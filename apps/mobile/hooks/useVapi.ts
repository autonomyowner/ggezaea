import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/react-native';
import { SessionType, sessionConfigs, voiceConfig, modelConfig } from '../lib/voice-config';

export type VapiStatus = 'idle' | 'connecting' | 'active' | 'speaking' | 'ended' | 'error';

export interface TranscriptEntry {
  role: 'USER' | 'ASSISTANT';
  content: string;
}

interface UseVapiOptions {
  sessionType: SessionType;
  onSessionEnd?: (transcript: TranscriptEntry[]) => void;
  onError?: (error: string) => void;
}

interface UseVapiReturn {
  status: VapiStatus;
  volumeLevel: number;
  transcript: TranscriptEntry[];
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  statusText: string;
  subText: string;
}

const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY || '';

export function useVapi({ sessionType, onSessionEnd, onError }: UseVapiOptions): UseVapiReturn {
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const [status, setStatus] = useState<VapiStatus>('idle');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const config = sessionConfigs[sessionType];

  // Derive status text from status
  const getStatusText = useCallback(() => {
    switch (status) {
      case 'idle':
        return { main: 'Ready', sub: 'Tap to start' };
      case 'connecting':
        return { main: 'Connecting...', sub: 'Please allow microphone access' };
      case 'active':
        return { main: 'Speak naturally', sub: 'Matcha is listening' };
      case 'speaking':
        return { main: 'Matcha is speaking...', sub: 'Listen carefully' };
      case 'ended':
        return { main: 'Session ended', sub: 'Thank you for sharing' };
      case 'error':
        return { main: 'Connection failed', sub: error || 'Please try again' };
      default:
        return { main: 'Ready', sub: '' };
    }
  }, [status, error]);

  const { main: statusText, sub: subText } = getStatusText();

  // Initialize Vapi instance
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) {
      setError('Voice not configured - missing VAPI key');
      setStatus('error');
      return;
    }

    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    // Call lifecycle events
    vapi.on('call-start', () => {
      setStatus('active');
    });

    vapi.on('call-end', () => {
      setStatus('ended');
      onSessionEnd?.(transcriptRef.current);
    });

    // Speech events
    vapi.on('speech-start', () => {
      setStatus('speaking');
    });

    vapi.on('speech-end', () => {
      setStatus('active');
    });

    // Volume level for animations
    vapi.on('volume-level', (level: number) => {
      // Smooth the volume level
      setVolumeLevel(prev => prev * 0.7 + level * 0.3);
    });

    // Transcript messages
    vapi.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const role: 'USER' | 'ASSISTANT' = message.role === 'user' ? 'USER' : 'ASSISTANT';
        const entry: TranscriptEntry = { role, content: message.transcript };

        transcriptRef.current = [...transcriptRef.current, entry];
        setTranscript(transcriptRef.current);
      }
    });

    // Error handling
    vapi.on('error', (err: any) => {
      console.error('Vapi error:', err);
      const errorMessage = err?.message || 'Voice connection failed';
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
    });

    return () => {
      vapi.stop();
    };
  }, [onSessionEnd, onError]);

  const start = useCallback(async () => {
    if (!vapiRef.current) {
      setError('Voice not initialized');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);
    setTranscript([]);
    transcriptRef.current = [];

    try {
      await vapiRef.current.start({
        model: {
          provider: modelConfig.provider,
          model: modelConfig.model,
          messages: [{ role: 'system' as const, content: config.systemPrompt }],
        },
        voice: {
          provider: voiceConfig.provider,
          voiceId: voiceConfig.voiceId,
        },
        firstMessage: config.firstMessage,
        silenceTimeoutSeconds: config.silenceTimeoutSeconds,
        maxDurationSeconds: config.maxDurationSeconds,
        backgroundSound: 'off',
        backchannelingEnabled: true,
        backgroundDenoisingEnabled: true,
      } as any);
    } catch (err: any) {
      console.error('Failed to start Vapi:', err);
      setError(err.message || 'Failed to start voice session');
      setStatus('error');
    }
  }, [config]);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  return {
    status,
    volumeLevel,
    transcript,
    error,
    start,
    stop,
    statusText,
    subText,
  };
}
