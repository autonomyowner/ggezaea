# Matcha AI - Complete Deployment Guide

## 🎯 Overview
This guide will walk you through:
1. Testing locally (FIRST - required)
2. Deploying to Render (your live site)

**Important**: We test locally first to catch any issues before deploying to production.

---

## Part 1: Local Testing (DO THIS FIRST)

### Step 1: Complete Your .env File

Open `apps/api/.env` and fill in your existing credentials:

```bash
# YOUR EXISTING CREDENTIALS (you should have these):
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
REDIS_URL=rediss://default:password@host:6379
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# ALREADY CONFIGURED (new voice features):
VAPI_API_KEY=b2915eb5-7055-4e2c-b7ec-05fd5cc161fb
VAPI_PUBLIC_KEY=24909e59-44ee-420d-baeb-3ea2c01656e2
ELEVENLABS_API_KEY=sk_8f3f73a363b6f9c4cadc91a80ecd7b0369cf036dda96d9c0
```

**If you don't have these credentials**, check your Render dashboard or your previous .env backups.

---

### Step 2: Install Backend Dependencies

```bash
cd D:/p1/vematcha/apps/api

# Install new dependencies
npm install axios @nestjs/axios

# Verify installation
npm list axios @nestjs/axios
```

Expected output:
```
├── axios@1.x.x
└── @nestjs/axios@3.x.x
```

---

### Step 3: Run Database Migration

```bash
# Still in apps/api directory
npx prisma migrate dev --name add-voice-sessions

# This will:
# 1. Create the voice_sessions table
# 2. Add VoiceSessionStatus enum
# 3. Update relations

# Generate Prisma client
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client
```

**If migration fails**: You might see "DATABASE_URL not found". Make sure Step 1 is complete.

---

### Step 4: Test Backend Startup

```bash
# Start the API server
npm run start:dev
```

**Look for these success messages** in the console:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] VoiceModule dependencies initialized
[Nest] INFO [VapiProvider] Vapi provider initialized
[Nest] INFO [SafetyGuardProvider] Safety guard initialized
[Nest] INFO [NestApplication] Nest application successfully started
```

**If you see errors**, check:
- Is DATABASE_URL correct in .env?
- Is PostgreSQL running?
- Are all required env vars filled in?

Keep this terminal open and running.

---

### Step 5: Test Safety Guardrails (Critical!)

Open a new terminal:

```bash
# Test 1: Crisis detection
curl -X POST http://localhost:4000/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"message\": \"I want to end my life tonight\", \"conversationId\": null}"
```

**Expected Response**: Should return message with 988 hotline and crisis resources.

```bash
# Test 2: Normal message
curl -X POST http://localhost:4000/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"message\": \"I'm feeling anxious about work\", \"conversationId\": null}"
```

**Expected Response**: Normal therapeutic response from AI.

**Don't have a JWT token?** Sign in to your app and check browser DevTools → Network → Find auth headers.

---

### Step 6: Test Voice Session Creation

```bash
curl -X POST http://localhost:4000/voice/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"sessionType\": \"general-therapy\", \"createNewConversation\": true}"
```

**Expected Response**:
```json
{
  "sessionId": "clxxxx...",
  "webCallUrl": "wss://api.vapi.ai/call/...",
  "vapiPublicKey": "24909e59-44ee-420d-baeb-3ea2c01656e2",
  "callId": "xxx",
  "conversationId": "clyyy..."
}
```

**If you get an error**:
- Check that VAPI_API_KEY is in .env
- Verify Vapi account has credits
- Check API server logs for details

---

### Step 7: Setup Frontend

Open a NEW terminal (keep backend running):

```bash
cd D:/p1/vematcha/apps/client

# Install Vapi SDK
npm install @vapi-ai/web

# Verify installation
npm list @vapi-ai/web
```

---

### Step 8: Add Vapi Public Key to Frontend

Create or edit `apps/client/.env.local`:

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=24909e59-44ee-420d-baeb-3ea2c01656e2
```

---

### Step 9: Start Frontend

```bash
# Still in apps/client directory
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000
```

---

### Step 10: Test Voice UI in Browser

1. Open browser: http://localhost:3000

2. To test the voice component, you need to add it to a page. Create a test page:

**File**: `apps/client/src/app/voice-test/page.tsx`

```typescript
import { VoiceTherapySession } from '@/components/VoiceTherapySession';

export default function VoiceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <VoiceTherapySession
        sessionType="general-therapy"
        onSessionEnd={(transcript) => {
          console.log('Session ended. Transcript:', transcript);
        }}
      />
    </div>
  );
}
```

3. Go to: http://localhost:3000/voice-test

4. Click "Start Session"

5. Allow microphone access when prompted

6. **Speak**: "Hello Matcha, how are you?"

7. **Expected**: AI responds with voice

8. Check transcript appears on screen

---

### Step 11: Verify Database

After voice session:

```bash
cd D:/p1/vematcha/apps/api
npx prisma studio
```

This opens a browser UI at http://localhost:5555

Check:
1. **VoiceSession** table has new records
2. **Conversation** table shows the conversation
3. **Message** table has transcript entries

---

## ✅ Local Testing Checklist

Before deploying to Render, verify:

- [ ] Backend starts without errors
- [ ] Crisis message triggers 988 hotline response
- [ ] Normal chat works as before
- [ ] Voice session returns `webCallUrl`
- [ ] Voice UI connects and you can speak
- [ ] AI responds with voice
- [ ] Transcript saves to database
- [ ] No console errors in browser

**If ALL checks pass**, proceed to Part 2.

**If ANY check fails**, see Troubleshooting section at bottom.

---

## Part 2: Deploy to Render

### Step 1: Commit Your Changes

```bash
cd D:/p1/vematcha

# Check what's changed
git status

# Add all new files
git add apps/api/src/modules/voice/
git add apps/api/src/providers/ai/vapi.provider.ts
git add apps/api/src/providers/safety/
git add apps/api/src/modules/chat/prompts/clinical-cbt-prompt.ts
git add apps/api/src/app.module.ts
git add apps/api/src/modules/chat/chat.module.ts
git add apps/api/src/modules/chat/chat.service.ts
git add apps/api/src/config/
git add apps/api/prisma/schema.prisma
git add apps/client/src/components/VoiceTherapySession.tsx
git add UPGRADE_GUIDE.md
git add IMPLEMENTATION_SUMMARY.md
git add DEPLOYMENT_STEPS.md

# Commit
git commit -m "feat: add clinical voice therapy with safety guardrails

- Add Vapi.ai voice integration for real-time therapy
- Add clinical CBT/EMDR prompts system
- Add 3-layer safety guardrail (crisis detection)
- Add VoiceSession database model
- Add VoiceTherapySession component
- Integrate safety checks into chat service"

# Push to main
git push origin main
```

---

### Step 2: Add Environment Variables to Render

1. Go to https://dashboard.render.com
2. Find your API service
3. Click "Environment" tab
4. Add these NEW variables:

```
VAPI_API_KEY = b2915eb5-7055-4e2c-b7ec-05fd5cc161fb
VAPI_PUBLIC_KEY = 24909e59-44ee-420d-baeb-3ea2c01656e2
ELEVENLABS_API_KEY = sk_8f3f73a363b6f9c4cadc91a80ecd7b0369cf036dda96d9c0
```

4. Click "Save Changes"

**Render will automatically redeploy your API** when you save env vars.

---

### Step 3: Run Migration on Render Database

**Option A: Auto-migrate (if configured)**
- If your Render service has `npm run migrate` in build command, it runs automatically
- Check deploy logs for: "Migration applied successfully"

**Option B: Manual migrate**
1. Go to Render dashboard → Your API service
2. Click "Shell" tab
3. Run:
```bash
npx prisma migrate deploy
npx prisma generate
```

---

### Step 4: Add Vapi Public Key to Frontend (Vercel/Netlify)

If your frontend is on **Vercel**:
1. Go to https://vercel.com/dashboard
2. Find your project
3. Settings → Environment Variables
4. Add:
   - Key: `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
   - Value: `24909e59-44ee-420d-baeb-3ea2c01656e2`
   - Environments: Production, Preview, Development
5. Click "Save"
6. Redeploy (Vercel → Deployments → "..." → Redeploy)

If your frontend is on **Netlify**:
1. Go to https://app.netlify.com
2. Site settings → Environment variables
3. Add same key/value
4. Trigger redeploy

---

### Step 5: Test Production Voice Session

Once deployed:

```bash
# Test voice endpoint on Render
curl -X POST https://YOUR-RENDER-API-URL.onrender.com/voice/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROD_JWT" \
  -d "{\"sessionType\": \"general-therapy\", \"createNewConversation\": true}"
```

**Expected**: Same response as local test (webCallUrl, sessionId, etc.)

---

### Step 6: Test Voice UI in Production

1. Go to your live site: `https://your-site.com/voice-test`

2. Click "Start Session"

3. Allow microphone

4. Speak to test

5. Verify:
   - AI responds with voice
   - Transcript appears
   - No console errors

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Production backend starts without errors
2. ✅ Crisis detection works on live site
3. ✅ Voice session creates successfully
4. ✅ You can have a voice conversation on live site
5. ✅ Transcript saves to production database
6. ✅ No errors in Render logs

---

## 🐛 Troubleshooting

### Issue: "Vapi provider not initialized"
**Solution**:
- Check `VAPI_API_KEY` is in .env
- Restart backend: `Ctrl+C` then `npm run start:dev`

### Issue: "webCallUrl not returned"
**Solution**:
- Check Render logs for errors
- Verify Vapi account has credits: https://vapi.ai/dashboard
- Check API key is correct

### Issue: "Microphone not working"
**Solution**:
- Browser must be HTTPS (localhost is ok)
- Check browser permissions: URL bar → lock icon → Site settings → Microphone
- Try different browser (Chrome recommended)

### Issue: "Voice connects but no AI response"
**Solution**:
- Check Render logs for OpenRouter errors
- Verify `OPENROUTER_API_KEY` is set on Render
- Check ElevenLabs API key has credits

### Issue: "Safety check too sensitive"
**Solution**:
- Edit `apps/api/src/providers/safety/safety-guard.provider.ts`
- Adjust regex patterns around line 200
- Redeploy

### Issue: "Database migration failed"
**Solution**:
```bash
# Reset and re-migrate
cd apps/api
npx prisma migrate reset  # WARNING: Deletes data
npx prisma migrate dev
```

### Issue: "Frontend can't reach backend"
**Solution**:
- Check `NEXT_PUBLIC_API_URL` in frontend .env
- Verify CORS settings in backend
- Check Render backend is running (not sleeping)

---

## 📞 Emergency Support

If something breaks in production:

### Rollback Steps:
```bash
# Revert to previous working version
git revert HEAD
git push origin main
```

Render will auto-deploy the previous version.

### Check Logs:
- **Render API logs**: Dashboard → Your service → Logs tab
- **Frontend logs**: Browser DevTools → Console
- **Database**: Render → Database → Logs

---

## 🔒 Security Checklist

Before going live:

- [ ] Regenerate exposed API keys (from this chat):
  - Vapi: https://vapi.ai/dashboard/keys
  - ElevenLabs: https://elevenlabs.io/app/settings/api-keys
- [ ] Verify `.env` is in `.gitignore`
- [ ] Check no secrets in git history: `git log --all --full-history --source -- '.env'`
- [ ] Enable CORS only for your domain in backend
- [ ] Set up monitoring for crisis events
- [ ] Test crisis detection with real scenarios

---

## 📊 Monitoring After Launch

Keep an eye on:

1. **Render Metrics**: CPU, Memory, Response time
2. **Vapi Dashboard**: https://vapi.ai/dashboard
   - Call minutes used
   - Success rate
   - Average call duration
3. **Database Growth**: Voice sessions table size
4. **Error Rate**: Render logs for repeated errors
5. **Cost**: Voice calls ~$0.08/min, track usage

---

## 🎯 Next Steps After Successful Deployment

1. **Add voice button to main chat interface**
2. **Create voice-guided Flash Technique**
3. **Set up therapist review dashboard**
4. **Implement usage limits for voice (FREE: 30 min/month)**
5. **Add voice session history page**

---

## Summary of What You Just Deployed

### Backend Additions:
- ✅ Voice therapy session endpoints
- ✅ Vapi.ai integration (real-time voice)
- ✅ 3-layer safety system (crisis detection)
- ✅ Clinical CBT/EMDR prompts
- ✅ VoiceSession database model

### Frontend Additions:
- ✅ VoiceTherapySession component
- ✅ Real-time transcript display
- ✅ Volume level indicator
- ✅ Error handling

### Safety Features:
- ✅ Regex crisis detection (immediate)
- ✅ AI-powered safety checks (Llama Guard)
- ✅ Response validation (blocks harmful AI output)
- ✅ Automatic 988 hotline redirect

### Models:
- ✅ Claude 3.5 Sonnet (general therapy)
- ✅ Ultrathink/DeepSeek R1 (Flash Technique)
- ✅ Llama Guard 2 (safety)

---

**Status**: ✅ All code complete, ready for deployment

**Estimated Deploy Time**: 30-60 minutes (including testing)

**Cost Impact**: ~$0.08-0.12 per voice minute

---

Need help? Check the detailed guides:
- **UPGRADE_GUIDE.md** - Architecture & technical details
- **IMPLEMENTATION_SUMMARY.md** - Quick reference
- **This file** - Step-by-step deployment

Good luck! 🚀

---

## Part 3: Horizontal Scaling Deployment

This section covers deploying the horizontally scalable backend with Redis-backed rate limiting and separate worker processes.

### Architecture Overview

```
                    ┌─────────────────┐
                    │   Vercel CDN    │
                    │   (Frontend)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Render LB     │
                    │  (Auto-routing) │
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
       │  API (1-3)  │ │  API ...  │ │   Worker    │
       │ (stateless) │ │           │ │ (Bull jobs) │
       └──────┬──────┘ └─────┬─────┘ └──────┬──────┘
              └──────────────┼──────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌─────▼─────┐      ┌──────▼──────┐
    │  Redis  │        │ PostgreSQL│      │ External    │
    │(shared) │        │ (pooled)  │      │ APIs        │
    └─────────┘        └───────────┘      └─────────────┘
```

### Step 1: Create Redis Instance on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Redis"**
3. Configure:
   - **Name**: `matcha-redis`
   - **Region**: Frankfurt (same as API)
   - **Plan**: Starter ($7/month) or Free (for testing)
   - **Max Memory Policy**: `allkeys-lru`
4. Click **"Create Redis"**
5. Wait for it to deploy (1-2 minutes)
6. **Copy the Internal URL** (looks like: `redis://red-xxxxx:6379`)

### Step 2: Update API Service Environment Variables

1. Go to your **matcha-api** service on Render
2. Click **"Environment"** tab
3. Add/Update these variables:

```
REDIS_URL = redis://red-xxxxx:6379  (paste your Redis Internal URL)
```

4. Click **"Save Changes"**

### Step 3: Create Background Worker Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Background Worker"**
3. Configure:
   - **Name**: `matcha-worker`
   - **Region**: Frankfurt
   - **Branch**: main
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:worker`
   - **Plan**: Starter ($7/month)

4. Add Environment Variables:
```
NODE_ENV = production
DATABASE_URL = (same as API service)
REDIS_URL = redis://red-xxxxx:6379
OPENROUTER_API_KEY = (same as API service)
OPENROUTER_FAST_MODEL = openai/gpt-4o-mini
FRONTEND_URL = https://your-frontend.vercel.app
```

5. Click **"Create Background Worker"**

### Step 4: Enable Auto-Scaling on API (Optional)

1. Go to your **matcha-api** service
2. Click **"Settings"** tab
3. Scroll to **"Instance Type"**
4. Enable **"Auto-Scaling"**:
   - **Min Instances**: 1
   - **Max Instances**: 3
   - **Target CPU**: 80%
   - **Target Memory**: 80%
5. Click **"Save Changes"**

**Note**: Auto-scaling requires Starter plan or higher ($7/month per instance).

### Step 5: Update render.yaml (Infrastructure as Code)

The `apps/api/render.yaml` has been updated with the new configuration. Push to deploy:

```bash
cd D:/p1/vematcha
git add apps/api/render.yaml
git commit -m "feat(api): configure horizontal scaling with Redis and worker"
git push origin main
```

### Step 6: Verify Deployment

After Render deploys (2-5 minutes):

```bash
# Test health endpoint
curl https://matcha-api.onrender.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-24T...",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "storage": "configured"
  }
}

# Test readiness probe
curl https://matcha-api.onrender.com/api/health/ready

# Expected:
{
  "ready": true,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Step 7: Verify Rate Limiting Works Across Instances

```bash
# Make rapid requests to test rate limiting
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://matcha-api.onrender.com/api/health
done

# Expected: First 3 return 200, then 429 (rate limited)
```

### Step 8: Verify Worker is Processing Jobs

1. Go to Render Dashboard → **matcha-worker**
2. Click **"Logs"** tab
3. Look for:
```
[Worker] Worker is running and listening for jobs...
[AnalysisProcessor] Processing analysis: clxxxx...
[AnalysisProcessor] Analysis completed: clxxxx (1234ms)
```

### Horizontal Scaling Checklist

- [ ] Redis instance created and running
- [ ] API service has `REDIS_URL` set
- [ ] Worker service deployed and running
- [ ] Health endpoint shows all services connected
- [ ] Rate limiting works (returns 429 on exceeded)
- [ ] Worker logs show job processing
- [ ] No errors in API or Worker logs

### Cost Summary (Render)

| Service | Plan | Cost/Month |
|---------|------|------------|
| API (1 instance) | Starter | $7 |
| API (auto-scale 3) | Starter x3 | $21 |
| Worker | Starter | $7 |
| Redis | Starter | $7 |
| PostgreSQL | Starter | $7 |
| **Total (min)** | | **$28/month** |
| **Total (max)** | | **$42/month** |

### Rollback if Issues

If something breaks:

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

Or on Render:
1. Go to API service → **"Events"** tab
2. Find the last working deploy
3. Click **"Rollback to this deploy"**

### Monitoring

1. **Render Metrics**: Dashboard → Service → Metrics
   - CPU usage per instance
   - Memory usage
   - Response times

2. **Redis Metrics**: Dashboard → Redis → Metrics
   - Commands/second
   - Memory usage
   - Connected clients

3. **Health Endpoint**: Set up uptime monitoring
   - Use UptimeRobot or Render's built-in monitoring
   - Monitor `/api/health/ready`

---

**Horizontal scaling is now configured!**
