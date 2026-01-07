import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Twilio
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Server
PORT = int(os.getenv("PORT", 3001))
HOST = os.getenv("HOST", "0.0.0.0")

# WA3i
WA3I_API_URL = os.getenv("WA3I_API_URL", "http://localhost:3000")

# OpenRouter base URL (OpenAI compatible)
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Arabic voice settings
ARABIC_VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # ElevenLabs Arabic voice (Adam)
ENGLISH_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # ElevenLabs English voice (Rachel)

# Deepgram settings for Arabic
DEEPGRAM_LANGUAGE = "ar"  # Arabic
DEEPGRAM_MODEL = "nova-2"  # Best model for accuracy
