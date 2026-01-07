"""
WA3i Voice Agent Server
Supports Arabic and English voice conversations
"""

import logging
from fastapi import FastAPI, WebSocket, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from vocode.streaming.streaming_conversation import StreamingConversation
from vocode.streaming.transcriber.deepgram_transcriber import DeepgramTranscriber
from vocode.streaming.synthesizer.eleven_labs_synthesizer import ElevenLabsSynthesizer
from vocode.streaming.models.audio import AudioEncoding

import config
from agent import WA3iAgent, WA3iAgentConfig, WA3iEnglishAgentConfig
from transcriber import create_arabic_transcriber, create_english_transcriber, create_multilingual_transcriber
from synthesizer import create_arabic_synthesizer, create_english_synthesizer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="WA3i Voice Agent",
    description="Voice AI for mental health support with Arabic language support",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active conversations
active_conversations = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "WA3i Voice Agent",
        "version": "1.0.0",
        "languages": ["ar", "en"]
    }


@app.get("/health")
async def health():
    """Health check for Render"""
    return {"status": "ok"}


@app.get("/debug")
async def debug():
    """Debug endpoint to check config"""
    return {
        "deepgram_key_set": bool(config.DEEPGRAM_API_KEY),
        "openrouter_key_set": bool(config.OPENROUTER_API_KEY),
        "elevenlabs_key_set": bool(config.ELEVENLABS_API_KEY),
        "deepgram_key_prefix": config.DEEPGRAM_API_KEY[:8] + "..." if config.DEEPGRAM_API_KEY else None,
        "openrouter_key_prefix": config.OPENROUTER_API_KEY[:8] + "..." if config.OPENROUTER_API_KEY else None,
        "elevenlabs_key_prefix": config.ELEVENLABS_API_KEY[:8] + "..." if config.ELEVENLABS_API_KEY else None,
    }


@app.post("/conversation/start")
async def start_conversation(request: Request):
    """Start a new voice conversation"""
    try:
        data = await request.json()
        language = data.get("language", "ar")
        conversation_id = data.get("conversation_id", "default")

        # Configure based on language
        if language == "ar":
            transcriber_config = create_arabic_transcriber()
            synthesizer_config = create_arabic_synthesizer()
            agent_config = WA3iAgentConfig()
        else:
            transcriber_config = create_english_transcriber()
            synthesizer_config = create_english_synthesizer()
            agent_config = WA3iEnglishAgentConfig()

        return JSONResponse({
            "status": "ready",
            "conversation_id": conversation_id,
            "language": language,
            "websocket_url": f"/ws/conversation/{conversation_id}"
        })

    except Exception as e:
        logger.error(f"Error starting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/conversation/{conversation_id}")
async def websocket_conversation(websocket: WebSocket, conversation_id: str):
    """WebSocket endpoint for real-time voice conversation"""
    await websocket.accept()

    try:
        # Get language preference from query params
        language = websocket.query_params.get("language", "ar")

        # Configure components based on language
        if language == "ar":
            transcriber_config = create_arabic_transcriber()
            synthesizer_config = create_arabic_synthesizer()
            agent_config = WA3iAgentConfig()
        else:
            transcriber_config = create_english_transcriber()
            synthesizer_config = create_english_synthesizer()
            agent_config = WA3iEnglishAgentConfig()

        # Create conversation
        conversation = StreamingConversation(
            transcriber=DeepgramTranscriber(transcriber_config),
            agent=WA3iAgent(agent_config),
            synthesizer=ElevenLabsSynthesizer(synthesizer_config),
        )

        active_conversations[conversation_id] = conversation

        # Start conversation
        await conversation.start()

        # Handle WebSocket messages
        while True:
            data = await websocket.receive()

            if "bytes" in data:
                # Audio data from client
                audio_chunk = data["bytes"]
                conversation.receive_audio(audio_chunk)

            elif "text" in data:
                # Text command from client
                message = data["text"]
                if message == "stop":
                    break

    except Exception as e:
        logger.error(f"WebSocket error: {e}")

    finally:
        # Cleanup
        if conversation_id in active_conversations:
            await active_conversations[conversation_id].terminate()
            del active_conversations[conversation_id]
        await websocket.close()


@app.post("/conversation/{conversation_id}/end")
async def end_conversation(conversation_id: str):
    """End an active conversation"""
    if conversation_id in active_conversations:
        await active_conversations[conversation_id].terminate()
        del active_conversations[conversation_id]
        return {"status": "ended", "conversation_id": conversation_id}

    raise HTTPException(status_code=404, detail="Conversation not found")


@app.get("/voices")
async def list_voices():
    """List available voices"""
    return {
        "arabic": {
            "adam": "pNInz6obpgDQGcFmaJgB",
            "bella": "EXAVITQu4vr4xnSDxMaL",
        },
        "english": {
            "rachel": "21m00Tcm4TlvDq8ikWAM",
            "josh": "TxGEqnHWrfWFTfGW9XjX",
            "bella": "EXAVITQu4vr4xnSDxMaL",
        }
    }


# Simple text-based endpoint for testing
@app.post("/chat")
async def chat(request: Request):
    """Simple text chat endpoint (no voice)"""
    try:
        data = await request.json()
        message = data.get("message", "")
        language = data.get("language", "ar")

        if language == "ar":
            agent_config = WA3iAgentConfig()
        else:
            agent_config = WA3iEnglishAgentConfig()

        agent = WA3iAgent(agent_config)
        response = await agent.generate_response(message, "text-chat")

        return {"response": response, "language": language}

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ElevenLabs TTS endpoint
@app.post("/tts")
async def text_to_speech(request: Request):
    """Generate speech using ElevenLabs"""
    import aiohttp

    try:
        data = await request.json()
        text = data.get("text", "")
        language = data.get("language", "ar")

        if not text:
            raise HTTPException(status_code=400, detail="No text provided")

        # Male Arabic voice: "Adam" or use Arabic-specific voice
        # For Arabic: use multilingual model with Arabic male voice
        voice_id = "pNInz6obpgDQGcFmaJgB" if language == "ar" else "TxGEqnHWrfWFTfGW9XjX"  # Adam for Arabic, Josh for English

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": config.ELEVENLABS_API_KEY
        }

        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",  # Best for Arabic
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    logger.error(f"ElevenLabs error: {error_text}")
                    raise HTTPException(status_code=resp.status, detail="TTS generation failed")

                audio_data = await resp.read()

                from fastapi.responses import Response
                return Response(
                    content=audio_data,
                    media_type="audio/mpeg",
                    headers={
                        "Content-Disposition": "inline; filename=speech.mp3"
                    }
                )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )
