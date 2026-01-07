"""
Deepgram Transcriber with Arabic Support
"""

from vocode.streaming.transcriber.deepgram_transcriber import DeepgramTranscriber
from vocode.streaming.models.transcriber import DeepgramTranscriberConfig, Transcription
import config


def create_arabic_transcriber() -> DeepgramTranscriberConfig:
    """Create Deepgram transcriber configured for Arabic"""
    return DeepgramTranscriberConfig(
        language="ar",  # Arabic
        model="nova-2",  # Best accuracy
        tier="nova",
        sampling_rate=16000,
        audio_encoding="linear16",
        chunk_size=6400,
        endpointing_config=None,  # Use default
        downsampling=None,
        api_key=config.DEEPGRAM_API_KEY,
    )


def create_english_transcriber() -> DeepgramTranscriberConfig:
    """Create Deepgram transcriber configured for English"""
    return DeepgramTranscriberConfig(
        language="en",
        model="nova-2",
        tier="nova",
        sampling_rate=16000,
        audio_encoding="linear16",
        chunk_size=6400,
        endpointing_config=None,
        downsampling=None,
        api_key=config.DEEPGRAM_API_KEY,
    )


def create_multilingual_transcriber() -> DeepgramTranscriberConfig:
    """Create Deepgram transcriber with auto language detection"""
    return DeepgramTranscriberConfig(
        language=None,  # Auto-detect
        model="nova-2",
        tier="nova",
        sampling_rate=16000,
        audio_encoding="linear16",
        chunk_size=6400,
        endpointing_config=None,
        downsampling=None,
        api_key=config.DEEPGRAM_API_KEY,
    )
