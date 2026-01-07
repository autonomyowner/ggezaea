# WA3i AI - Clinical Upgrade Guide

## Overview

This guide documents the upgrade from basic chat AI to a **clinical-grade therapeutic AI system** using:
- **Vapi.ai** for real-time voice therapy sessions
- **Ultrathink (DeepSeek R1)** + **Claude 3.5 Sonnet** for deep reasoning + emotional intelligence
- **Clinical CBT/EMDR prompts** based on evidence-based therapy
- **Safety guardrails** for crisis detection and prevention

---

## What's Been Added

### 1. Clinical-Grade CBT/EMDR Prompts
**Location**: `apps/api/src/modules/chat/prompts/clinical-cbt-prompt.ts`

**Features**:
- Socratic questioning framework (Beck's CBT)
- Emotional validation protocol (Linehan's DBT)
- Crisis detection and emergency response
- EMDR Flash Technique voice-guided scripts

**Key Principles**:
- Validation FIRST, exploration SECOND
- Collaborative empiricism ("Let's explore together")
- Non-diagnostic (describes patterns, not disorders)
- Safety-first (crisis detection is priority #1)

### 2. Vapi.ai Voice Integration
**Location**: `apps/api/src/providers/ai/vapi.provider.ts`

**Capabilities**:
- Real-time bidirectional voice communication
- Emotion detection from voice tone
- Sub-500ms latency for natural conversation
- Interruption handling (user can cut off AI mid-sentence)
- Integration with ElevenLabs for voice synthesis

**Models**:
- **Ultrathink** (`deepseek-r1-distill-llama-70b`) - For Flash Technique (structured, precise)
- **Claude 3.5 Sonnet** - For general therapy (emotional nuance, warmth)

### 3. Voice Session Management
**Location**: `apps/api/src/modules/voice/`

**Components**:
- `voice.service.ts` - Session creation, management, transcript extraction
- `voice.controller.ts` - REST API endpoints
- `voice.module.ts` - NestJS module

**Endpoints**:
```
POST   /voice/start                    - Start voice session
GET    /voice/sessions/:id             - Get session details
PATCH  /voice/sessions/:id/end         - End session
GET    /voice/sessions                 - Get session history
POST   /voice/webhook                  - Vapi webhook handler
```

### 4. Safety Guardrail Layer
**Location**: `apps/api/src/providers/safety/safety-guard.provider.ts`

**Multi-Layer Safety System**:
1. **Regex-based crisis detection** (fast, local) - Detects suicide/self-harm language
2. **AI-powered moderation** (Llama Guard 2) - Nuanced risk assessment
3. **Response validation** - Ensures AI doesn't give harmful advice

**Risk Levels**:
- NONE - No safety concerns
- LOW - Mild distress
- MODERATE - Monitor closely
- HIGH - Passive suicidal ideation, needs resources
- CRISIS - Active suicidal ideation with plan/intent, immediate redirect

### 5. Database Schema Updates
**Location**: `apps/api/prisma/schema.prisma`

**New Models**:
- `VoiceSession` - Tracks voice therapy sessions
- `VoiceSessionStatus` enum - (active, completed, failed, cancelled)

**Relations**:
- VoiceSession → User
- VoiceSession → Conversation (optional link for context)

---

## Environment Variables Required

Add these to your `.env` file:

```bash
# Vapi.ai Voice Infrastructure
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PUBLIC_KEY=your_vapi_public_key_here

# ElevenLabs Text-to-Speech (if not already set)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# OpenRouter (if not already set)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Getting API Keys

1. **Vapi.ai**:
   - Sign up at https://vapi.ai
   - Go to Dashboard → API Keys
   - Copy Private Key → `VAPI_API_KEY`
   - Copy Public Key → `VAPI_PUBLIC_KEY`

2. **ElevenLabs**:
   - Sign up at https://elevenlabs.io
   - Go to Profile → API Keys
   - Copy key → `ELEVENLABS_API_KEY`

3. **OpenRouter**:
   - Sign up at https://openrouter.ai
   - Go to Keys
   - Create new key → `OPENROUTER_API_KEY`

---

## Database Migration

Run Prisma migration to add VoiceSession table:

```bash
cd apps/api
npx prisma migrate dev --name add-voice-sessions
npx prisma generate
```

---

## Integration Steps

### Step 1: Install Dependencies

```bash
cd apps/api
npm install axios @nestjs/axios

cd apps/client
npm install @vapi-ai/web
```

### Step 2: Register Voice Module in App Module

**File**: `apps/api/src/app.module.ts`

```typescript
import { VoiceModule } from './modules/voice/voice.module';

@Module({
  imports: [
    // ... existing modules
    VoiceModule, // Add this
  ],
})
export class AppModule {}
```

### Step 3: Integrate Safety Guard into Chat Service

**File**: `apps/api/src/modules/chat/chat.service.ts`

Add safety checks before and after LLM calls:

```typescript
import { SafetyGuardProvider, RiskLevel } from '../../providers/safety/safety-guard.provider';

constructor(
  private prisma: PrismaService,
  private openRouter: OpenRouterProvider,
  private safetyGuard: SafetyGuardProvider, // Add this
) {}

async sendMessage(userId: string, userTier: 'FREE' | 'PRO', data: SendMessageDto) {
  // ... existing code ...

  // BEFORE sending to LLM - Check user input for safety
  const inputSafety = await this.safetyGuard.checkUserInput(data.message);

  if (inputSafety.riskLevel === RiskLevel.CRISIS) {
    // User is in immediate crisis - redirect to resources
    const crisisMessage = this.safetyGuard.getCrisisInterventionMessage(inputSafety.flags);

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.ASSISTANT,
        content: crisisMessage,
      },
    });

    return {
      conversationId,
      message: assistantMessage,
      analysis: null,
      usage: null,
      modelTier: 'safety-override',
      crisisDetected: true,
    };
  }

  // ... get LLM response as usual ...

  // AFTER getting LLM response - Validate safety
  const responseSafety = await this.safetyGuard.checkAIResponse(
    response.message,
    data.message,
  );

  if (!responseSafety.isSafe) {
    this.logger.warn(`Unsafe AI response blocked: ${responseSafety.flags}`);

    // Override with safe response
    response.message = inputSafety.requiresIntervention
      ? this.safetyGuard.getCrisisInterventionMessage(inputSafety.flags)
      : "I want to make sure I'm being helpful and supportive. Can you tell me more about what's going on?";
  }

  // ... save message and return ...
}
```

Don't forget to add SafetyGuardProvider to ChatModule providers:

```typescript
// apps/api/src/modules/chat/chat.module.ts
import { SafetyGuardProvider } from '../../providers/safety/safety-guard.provider';

@Module({
  providers: [ChatService, SafetyGuardProvider],
  // ...
})
```

### Step 4: Create Frontend Voice UI Component

**File**: `apps/client/src/components/VoiceTherapySession.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export function VoiceTherapySession({ sessionType }: { sessionType: 'general-therapy' | 'flash-technique' }) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    // Initialize Vapi client
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
    });

    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
    });

    vapiInstance.on('speech-update', (update) => {
      if (update.role === 'user' || update.role === 'assistant') {
        setTranscript(prev => [...prev, `${update.role}: ${update.transcript}`]);
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const startCall = async () => {
    if (!vapi) return;

    try {
      // Call your backend to create session
      const response = await fetch('/api/voice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionType, createNewConversation: true }),
      });

      const data = await response.json();

      // Start Vapi call with the URL from backend
      await vapi.start(data.webCallUrl);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = () => {
    vapi?.stop();
  };

  return (
    <div className="voice-session">
      <h2>Voice Therapy Session</h2>

      {!isCallActive ? (
        <button onClick={startCall}>
          Start {sessionType === 'flash-technique' ? 'Flash Technique' : 'Therapy'} Session
        </button>
      ) : (
        <button onClick={endCall}>End Session</button>
      )}

      <div className="transcript">
        <h3>Transcript</h3>
        {transcript.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}
```

Add to `.env.local`:
```
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
```

---

## Usage Examples

### 1. Start a General Therapy Voice Session

```bash
curl -X POST http://localhost:4000/voice/start \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionType": "general-therapy",
    "createNewConversation": true
  }'
```

Response:
```json
{
  "sessionId": "clxxx...",
  "webCallUrl": "wss://api.vapi.ai/call/...",
  "vapiPublicKey": "your-public-key",
  "callId": "xxx",
  "conversationId": "clyyy..."
}
```

### 2. Start a Flash Technique Session

```typescript
const response = await fetch('/api/voice/start', {
  method: 'POST',
  body: JSON.stringify({
    sessionType: 'flash-technique',
  }),
});

const { webCallUrl } = await response.json();

// Connect with Vapi SDK
await vapi.start(webCallUrl);
```

### 3. Safety Check Example

```typescript
const safetyResult = await safetyGuard.checkUserInput(
  "I want to kill myself tonight. I have the pills ready."
);

console.log(safetyResult);
// {
//   isSafe: false,
//   riskLevel: 'CRISIS',
//   flags: ['SUICIDAL_IDEATION_WITH_INTENT'],
//   requiresIntervention: true,
//   recommendations: ['PROVIDE_CRISIS_RESOURCES', 'IMMEDIATE_REDIRECT_TO_988']
// }
```

---

## Testing

### 1. Test Safety Guardrails

```typescript
// Test crisis detection
const crisisTest = await safetyGuard.checkUserInput(
  "I'm thinking about ending it all"
);
expect(crisisTest.riskLevel).toBe(RiskLevel.HIGH);
expect(crisisTest.flags).toContain('PASSIVE_SUICIDAL_IDEATION');

// Test safe content
const safeTest = await safetyGuard.checkUserInput(
  "I'm feeling anxious about work"
);
expect(safeTest.isSafe).toBe(true);
expect(safeTest.riskLevel).toBe(RiskLevel.NONE);
```

### 2. Test Voice Session Flow

1. Start session → Get webCallUrl
2. Connect with Vapi SDK
3. Speak to test voice recognition
4. Verify transcript is captured
5. End session → Verify transcript saved to conversation

### 3. Test Flash Technique Voice Guidance

1. Start flash-technique session
2. Verify AI follows structured protocol (setup → processing → closing)
3. Check timing cues (7-second intervals between flashes)
4. Verify bilateral stimulation instructions
5. Confirm distress level tracking

---

## Cost Considerations

### Vapi Pricing (Approximate)
- **Voice calls**: ~$0.05-0.10 per minute
- **Breakdown**:
  - STT (Speech-to-Text): ~$0.006/min (Deepgram)
  - TTS (Text-to-Speech): ~$0.03/min (ElevenLabs)
  - LLM (Ultrathink/Claude): ~$0.01-0.04/min
  - Vapi platform fee: ~$0.01/min

### Cost Optimization Strategies
1. **Use pre-recorded audio** for Flash Technique repetitive phrases (already implemented)
2. **Shorter sessions** for crisis support (redirect to humans faster)
3. **Tiered models**: Ultrathink for Flash (precision), Claude for general (warmth)
4. **Caching**: Vapi caches system prompts to reduce token usage

---

## Security & Compliance

### HIPAA Compliance Considerations
⚠️ **Important**: This system is NOT HIPAA-compliant out of the box.

To make it HIPAA-compliant:
1. **BAA with Vapi**: Sign Business Associate Agreement
2. **Encrypted storage**: Encrypt all voice transcripts at rest
3. **Audit logging**: Log all access to PHI (Protected Health Information)
4. **User consent**: Obtain explicit consent for recording
5. **Data retention**: Implement automatic deletion policies

### Crisis Liability Protection
1. **Disclaimers**: Always state "I'm an AI, not a licensed therapist"
2. **Immediate redirect**: CRISIS-level triggers go straight to 988
3. **Audit trail**: Log all crisis detections for review
4. **Human oversight**: Implement review process for flagged sessions

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Safety Metrics**:
   - Crisis detection rate (% of sessions)
   - False positive rate (manual review)
   - Average response time to crisis

2. **Voice Session Metrics**:
   - Average session duration
   - Completion rate (% that finish vs drop off)
   - User satisfaction (post-session survey)

3. **Clinical Metrics**:
   - Distress reduction (Flash Technique: start vs end)
   - Conversation depth (avg turns per session)
   - Returning user rate

### Logging

Add structured logging for safety events:

```typescript
this.logger.log({
  event: 'CRISIS_DETECTED',
  userId: user.userId,
  riskLevel: 'CRISIS',
  flags: ['SUICIDAL_IDEATION_WITH_INTENT'],
  timestamp: new Date().toISOString(),
});
```

---

## Roadmap

### Phase 2 Enhancements
- [ ] Multi-language support (Vapi supports 100+ languages)
- [ ] Real-time emotion analysis (tone, pace, pauses)
- [ ] Adaptive Flash Technique (adjust timing based on user response)
- [ ] Integration with wearables (heart rate for distress detection)
- [ ] Therapist dashboard (review flagged sessions)

### Phase 3 - Advanced Features
- [ ] Group therapy sessions (multi-participant Vapi calls)
- [ ] Voice journaling with analysis
- [ ] Personalized coping skill library
- [ ] Integration with EMR systems (Epic, Cerner)

---

## Troubleshooting

### Common Issues

**1. Vapi call won't start**
- Check API keys in .env
- Verify CORS settings allow your domain
- Check browser permissions for microphone

**2. Safety guard too sensitive**
- Adjust regex patterns in `safety-guard.provider.ts`
- Lower AI safety check threshold
- Implement user feedback loop to refine

**3. Voice quality issues**
- Switch ElevenLabs voice models (try `eleven_turbo_v2` for faster response)
- Adjust `responseDelaySeconds` in Vapi config
- Check user's internet connection

**4. High Vapi costs**
- Reduce `maxDurationSeconds` for auto-cutoff
- Use pre-recorded audio for repetitive content
- Implement usage limits per user

---

## Support

For issues with:
- **Vapi integration**: https://docs.vapi.ai
- **ElevenLabs voices**: https://elevenlabs.io/docs
- **OpenRouter models**: https://openrouter.ai/docs
- **Clinical prompts**: Consult licensed therapist for review

---

## License & Disclaimer

⚠️ **Clinical Disclaimer**:
This AI system is a **mental health companion tool**, not a replacement for professional therapy. It should not be used for:
- Diagnosis of mental health conditions
- Prescription of treatment plans
- Emergency crisis intervention (always redirect to 988/911)

Users should consult licensed mental health professionals for clinical care.

---

**Built with ❤️ for WA3i AI - "AI at the service of your mind"**
