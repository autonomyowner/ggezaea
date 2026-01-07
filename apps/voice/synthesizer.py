"""
ElevenLabs Synthesizer with Arabic Support
"""

from vocode.streaming.models.synthesizer import ElevenLabsSynthesizerConfig
import config


# Arabic voices from ElevenLabs
ARABIC_VOICES = {
    "adam": "pNInz6obpgDQGcFmaJgB",      # Adam - Arabic male
    "bella": "EXAVITQu4vr4xnSDxMaL",     # Bella - can do Arabic
    "rachel": "21m00Tcm4TlvDq8ikWAM",    # Rachel - multilingual
}

# English voices
ENGLISH_VOICES = {
    "rachel": "21m00Tcm4TlvDq8ikWAM",
    "josh": "TxGEqnHWrfWFTfGW9XjX",
    "bella": "EXAVITQu4vr4xnSDxMaL",
}


def create_arabic_synthesizer(voice: str = "adam") -> ElevenLabsSynthesizerConfig:
    """Create ElevenLabs synthesizer for Arabic"""
    voice_id = ARABIC_VOICES.get(voice, ARABIC_VOICES["adam"])

    return ElevenLabsSynthesizerConfig(
        api_key=config.ELEVENLABS_API_KEY,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",  # Best for Arabic
        stability=0.5,
        similarity_boost=0.75,
        sampling_rate=16000,
        optimize_streaming_latency=3,  # Balance quality/latency
    )


def create_english_synthesizer(voice: str = "rachel") -> ElevenLabsSynthesizerConfig:
    """Create ElevenLabs synthesizer for English"""
    voice_id = ENGLISH_VOICES.get(voice, ENGLISH_VOICES["rachel"])

    return ElevenLabsSynthesizerConfig(
        api_key=config.ELEVENLABS_API_KEY,
        voice_id=voice_id,
        model_id="eleven_monolingual_v1",  # Fast for English
        stability=0.5,
        similarity_boost=0.75,
        sampling_rate=16000,
        optimize_streaming_latency=3,
    )
