'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../../lib/api';

// Pre-recorded audio files mapping (phrase text → audio file path)
const PRERECORDED_AUDIO: Record<string, string> = {
  // Set Opening
  "Begin slow tapping... left... right... left... right...": "/audio/flash/Begin slow tapping left right.mp3",
  // Focus Cue
  "Stay fully connected to your peaceful place...": "/audio/flash/Stay fully connected to your peaceful place.mp3",
  // Flash Command
  "Flash": "/audio/flash/Flash.mp3",
  // Between-Flash Reminders
  "Stay with your positive place...": "/audio/flash/Stay with your positive place.mp3",
  "Notice what you see there...": "/audio/flash/Notice what you see there.mp3",
  "Feel the calm...": "/audio/flash/Feel the calm.mp3",
  "Let those good feelings grow...": "/audio/flash/Let those good feelings grow.mp3",
  // Set Completion
  "Stop tapping...": "/audio/flash/Stop tapping.mp3",
  "Take a deep breath...": "/audio/flash/Take a deep breath.mp3",
  // Pause Check
  "Take a moment to notice how you feel.": "/audio/flash/Take a moment to notice how you feel.mp3",
  "Does the memory seem different in any way?": "/audio/flash/Does the memory seem different in any way.mp3",
  // Closing Phase
  "Bring to mind what was bothering you earlier...": "/audio/flash/Bring to mind what was bothering you earlier.mp3",
  "How does it feel now, on a scale of zero to ten?": "/audio/flash/How does it feel now, on a scale of zero to ten.mp3",
  // Session Complete
  "Wonderful. Your mind did important work today.": "/audio/flash/Wonderful Your mind did important work today.mp3",
  "Notice your feet on the ground...": "/audio/flash/Notice your feet on the ground.mp3",
  "Look around and name three things you can see...": "/audio/flash/Look around and name three things you can see.mp3",
  "You can return anytime you need this space.": "/audio/flash/You can return anytime you need this space.mp3",
};

interface UseTTSReturn {
  speak: (text: string, onStart?: () => void) => void;
  speakSequence: (texts: string[]) => void;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  preloadPhrases: (phrases: string[]) => Promise<void>;
}

export function useTTS(): UseTTSReturn {
  const { getToken } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(false);
  const queueRef = useRef<Array<{ text: string; onStart?: () => void }>>([]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioCache.current.forEach((url) => URL.revokeObjectURL(url));
      audioCache.current.clear();
    };
  }, []);

  // Fallback to browser TTS
  const speakWithBrowser = useCallback((text: string, onStart?: () => void): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        onStart?.();
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        // Call onStart when audio actually begins
        onStart?.();
      };

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const fetchAudio = useCallback(async (text: string, onStart?: () => void): Promise<string | null> => {
    // Check cache first
    const cached = audioCache.current.get(text);
    if (cached) return cached;

    // Check for pre-recorded audio file
    const prerecordedPath = PRERECORDED_AUDIO[text];
    if (prerecordedPath) {
      audioCache.current.set(text, prerecordedPath);
      return prerecordedPath;
    }

    // Fall back to API for non-prerecorded phrases
    try {
      const token = await getToken();
      if (!token) {
        // Fallback to browser TTS if no token
        await speakWithBrowser(text, onStart);
        return null;
      }

      const audioBuffer = await api.textToSpeech(token, text);
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      audioCache.current.set(text, url);
      return url;
    } catch (error) {
      console.error('TTS fetch error, falling back to browser TTS:', error);
      // Fallback to browser TTS on error
      await speakWithBrowser(text, onStart);
      return null;
    }
  }, [getToken, speakWithBrowser]);

  const playNext = useCallback(async () => {
    if (!isMountedRef.current || isPlayingRef.current || queueRef.current.length === 0) {
      return;
    }

    const item = queueRef.current.shift()!;
    isPlayingRef.current = true;
    setIsSpeaking(true);

    try {
      setIsLoading(true);
      const url = await fetchAudio(item.text, item.onStart);
      setIsLoading(false);

      if (!url || !isMountedRef.current) {
        isPlayingRef.current = false;
        setIsSpeaking(false);
        playNext();
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      // For cached audio, call onStart immediately when playing starts
      audio.onplay = () => {
        item.onStart?.();
      };

      audio.onended = () => {
        if (isMountedRef.current) {
          isPlayingRef.current = false;
          setIsSpeaking(queueRef.current.length > 0);
          playNext();
        }
      };

      audio.onerror = () => {
        if (isMountedRef.current) {
          isPlayingRef.current = false;
          setIsSpeaking(queueRef.current.length > 0);
          playNext();
        }
      };

      await audio.play();
    } catch (error) {
      console.error('Audio play error:', error);
      isPlayingRef.current = false;
      setIsSpeaking(false);
      playNext();
    }
  }, [fetchAudio]);

  const speak = useCallback((text: string, onStart?: () => void) => {
    queueRef.current.push({ text, onStart });
    if (!isPlayingRef.current) {
      playNext();
    }
  }, [playNext]);

  const speakSequence = useCallback((texts: string[]) => {
    queueRef.current.push(...texts.map(text => ({ text })));
    if (!isPlayingRef.current) {
      playNext();
    }
  }, [playNext]);

  const stop = useCallback(() => {
    queueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const preloadPhrases = useCallback(async (phrases: string[]) => {
    const promises = phrases.map(async (phrase) => {
      if (!audioCache.current.has(phrase)) {
        await fetchAudio(phrase);
      }
    });
    await Promise.all(promises);
  }, [fetchAudio]);

  return {
    speak,
    speakSequence,
    stop,
    isSpeaking,
    isLoading,
    preloadPhrases,
  };
}
