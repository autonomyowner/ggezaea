# WA3i Voice Agent

Voice AI service for WA3i with Arabic language support. Built on Vocode with Deepgram, OpenRouter, and ElevenLabs.

## Features

- **Arabic Speech-to-Text**: Deepgram Nova-2 model
- **Arabic Text-to-Speech**: ElevenLabs multilingual voices
- **LLM**: OpenRouter (Claude, GPT-4, etc.)
- **Real-time WebSocket streaming**
- **Mental health focused prompts**

## Setup

### 1. Install Dependencies

```bash
cd apps/voice
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required keys:
- `DEEPGRAM_API_KEY` - Get from [deepgram.com](https://deepgram.com)
- `OPENROUTER_API_KEY` - Get from [openrouter.ai](https://openrouter.ai)
- `ELEVENLABS_API_KEY` - Get from [elevenlabs.io](https://elevenlabs.io)

### 3. Run Locally

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --port 3001
```

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Start Conversation
```
POST /conversation/start
{
  "language": "ar",  // or "en"
  "conversation_id": "unique-id"
}
```

### WebSocket Conversation
```
WS /ws/conversation/{conversation_id}?language=ar
```

Send audio bytes, receive audio bytes.

### Text Chat (Testing)
```
POST /chat
{
  "message": "مرحبا",
  "language": "ar"
}
```

### List Voices
```
GET /voices
```

## Deploy to Render

### Option 1: Blueprint
1. Push code to GitHub
2. Go to Render Dashboard
3. New > Blueprint
4. Select your repo
5. Render will detect `render.yaml`

### Option 2: Manual
1. New > Web Service
2. Connect GitHub repo
3. Settings:
   - **Root Directory**: `apps/voice`
   - **Runtime**: Docker
   - **Health Check Path**: `/health`
4. Add environment variables
5. Deploy

## Arabic Voice Configuration

### ElevenLabs Voices for Arabic
- `adam` (pNInz6obpgDQGcFmaJgB) - Male Arabic voice
- `bella` (EXAVITQu4vr4xnSDxMaL) - Female multilingual

### Deepgram Settings
- Model: `nova-2` (best accuracy)
- Language: `ar` (Arabic)

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Deepgram  │────▶│  OpenRouter │
│   (Audio)   │     │   (STT)     │     │   (LLM)     │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │            ┌─────────────┐            │
       └────────────│  ElevenLabs │◀───────────┘
                    │   (TTS)     │
                    └─────────────┘
```

## License

MIT - Part of WA3i project
