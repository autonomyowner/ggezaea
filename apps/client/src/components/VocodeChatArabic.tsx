'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceOrb, VoiceOrbStatus } from './VoiceOrb';
import { useLanguage } from './LanguageProvider';

interface VocodeChatProps {
  onTranscript?: (messages: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>) => void;
  onSessionEnd?: () => void;
  isVisible?: boolean;
}

interface TranscriptEntry {
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: Date;
}

const VOCODE_API_URL = process.env.NEXT_PUBLIC_VOCODE_API_URL || 'https://vocode-wa3i.onrender.com';

export function VocodeChatArabic({ onTranscript, onSessionEnd, isVisible = true }: VocodeChatProps) {
  const { language, t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Determine orb status
  const getOrbStatus = (): VoiceOrbStatus => {
    if (isConnecting || isProcessing) return 'connecting';
    if (!isActive) return 'idle';
    if (assistantSpeaking) return 'ai-speaking';
    if (isSpeaking || isRecording) return 'user-speaking';
    return 'listening';
  };

  // Report transcripts back to parent
  useEffect(() => {
    if (transcript.length > 0 && onTranscript) {
      onTranscript(transcript.map(t => ({ role: t.role, content: t.content })));
    }
  }, [transcript, onTranscript]);

  // Text-based chat (fallback / simple mode)
  const sendTextMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsProcessing(true);
    setTranscript(prev => [
      ...prev,
      { role: 'USER', content: message, timestamp: new Date() }
    ]);

    try {
      const response = await fetch(`${VOCODE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language: language === 'ar' ? 'ar' : 'en'
        })
      });

      const data = await response.json();

      setTranscript(prev => [
        ...prev,
        { role: 'ASSISTANT', content: data.response, timestamp: new Date() }
      ]);

      // Text-to-speech for the response (optional - uses browser TTS)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.onstart = () => setAssistantSpeaking(true);
        utterance.onend = () => setAssistantSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setIsProcessing(false);
      setTextInput('');
    }
  }, [language]);

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // For now, we use speech recognition instead of sending audio
        // In production, you'd send this to Deepgram via the WebSocket
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsSpeaking(true);

      // Use Web Speech API for recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          sendTextMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError(language === 'ar' ? 'يرجى السماح بالوصول للميكروفون' : 'Please allow microphone access');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          setIsSpeaking(false);
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          stream.getTracks().forEach(track => track.stop());
        };

        recognition.start();
      }
    } catch (err) {
      console.error('Recording error:', err);
      setError(language === 'ar' ? 'لا يمكن الوصول للميكروفون' : 'Cannot access microphone');
    }
  }, [language, sendTextMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript([]);

    try {
      // Add initial greeting
      const greeting = language === 'ar'
        ? 'مرحباً، أنا WA3i. كيف يمكنني مساعدتك اليوم؟'
        : "Hello, I'm WA3i. How can I help you today?";

      setTranscript([{
        role: 'ASSISTANT',
        content: greeting,
        timestamp: new Date()
      }]);

      // Speak the greeting
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(greeting);
        utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.onstart = () => setAssistantSpeaking(true);
        utterance.onend = () => setAssistantSpeaking(false);
        speechSynthesis.speak(utterance);
      }

      setIsActive(true);
    } catch (err) {
      console.error('Session start error:', err);
      setError(language === 'ar' ? 'فشل في بدء الجلسة' : 'Failed to start session');
    } finally {
      setIsConnecting(false);
    }
  }, [language]);

  const endSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopRecording();
    speechSynthesis.cancel();
    setIsActive(false);
    setAssistantSpeaking(false);
    if (onSessionEnd) {
      onSessionEnd();
    }
  }, [stopRecording, onSessionEnd]);

  const toggleSession = useCallback(() => {
    if (isActive) {
      endSession();
    } else if (!isConnecting) {
      startSession();
    }
  }, [isActive, isConnecting, startSession, endSession]);

  if (!isVisible) return null;

  return (
    <div className="vocode-chat-container">
      {/* Main Voice Button */}
      <button
        onClick={toggleSession}
        disabled={isConnecting}
        className={`voice-button ${isActive ? 'active' : ''} ${isConnecting ? 'connecting' : ''}`}
        title={isActive ? (language === 'ar' ? 'إنهاء المحادثة' : 'End conversation') : (language === 'ar' ? 'بدء المحادثة' : 'Start conversation')}
      >
        {isConnecting ? (
          <div className="voice-button-spinner" />
        ) : isActive ? (
          <div className="voice-button-waves">
            <span style={{ '--delay': '0s', '--height': isSpeaking ? '60%' : '20%' } as React.CSSProperties} />
            <span style={{ '--delay': '0.1s', '--height': isSpeaking ? '100%' : '30%' } as React.CSSProperties} />
            <span style={{ '--delay': '0.2s', '--height': isSpeaking ? '80%' : '25%' } as React.CSSProperties} />
            <span style={{ '--delay': '0.3s', '--height': isSpeaking ? '90%' : '20%' } as React.CSSProperties} />
            <span style={{ '--delay': '0.4s', '--height': isSpeaking ? '70%' : '30%' } as React.CSSProperties} />
          </div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {/* Error Toast */}
      {error && (
        <div className="voice-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Active Call Overlay */}
      {isActive && (
        <div className="voice-active-indicator">
          <VoiceOrb
            status={getOrbStatus()}
            volumeLevel={volumeLevel}
            size="lg"
          />
          <div className="voice-status">
            {assistantSpeaking
              ? (language === 'ar' ? 'WA3i يتحدث...' : 'WA3i is speaking...')
              : isSpeaking
                ? (language === 'ar' ? 'جاري الاستماع...' : 'Listening...')
                : (language === 'ar' ? 'اضغط على الميكروفون للتحدث' : 'Tap microphone to speak')}
          </div>

          {/* Microphone button for push-to-talk */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || assistantSpeaking}
            className={`mic-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* Text input fallback */}
          <div className="text-input-container">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage(textInput)}
              placeholder={language === 'ar' ? 'أو اكتب رسالتك هنا...' : 'Or type your message...'}
              disabled={isProcessing}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            <button
              onClick={() => sendTextMessage(textInput)}
              disabled={!textInput.trim() || isProcessing}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <button onClick={endSession} className="voice-end-button">
            {language === 'ar' ? 'إنهاء المحادثة' : 'End Conversation'}
          </button>
        </div>
      )}

      {/* Live Transcript */}
      {isActive && transcript.length > 0 && (
        <div className="voice-transcript">
          {transcript.slice(-4).map((entry, index) => (
            <div
              key={index}
              className={`voice-transcript-entry ${entry.role === 'USER' ? 'user' : 'assistant'}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <span className="voice-transcript-role">
                {entry.role === 'USER'
                  ? (language === 'ar' ? 'أنت' : 'You')
                  : 'WA3i'}
              </span>
              <span className="voice-transcript-text">{entry.content}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .vocode-chat-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .voice-button {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: var(--cream-100);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .voice-button:hover {
          background: var(--matcha-100);
          color: var(--matcha-600);
        }

        .voice-button.active {
          background: linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(104, 166, 125, 0.4);
        }

        .voice-button.connecting {
          opacity: 0.7;
          cursor: wait;
        }

        .voice-button-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .voice-button-waves {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 20px;
        }

        .voice-button-waves span {
          width: 3px;
          height: var(--height, 30%);
          background: currentColor;
          border-radius: 2px;
          animation: wave 0.5s ease-in-out infinite alternate;
          animation-delay: var(--delay, 0s);
          transition: height 0.15s ease;
        }

        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .voice-error {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: var(--terra-50);
          border: 1px solid var(--terra-200);
          color: var(--terra-600);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          animation: slideUp 0.2s ease;
          z-index: 100;
        }

        .voice-error button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 2px;
          opacity: 0.6;
        }

        .voice-error button:hover {
          opacity: 1;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .voice-active-indicator {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          backdrop-filter: blur(8px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .voice-status {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          animation: fadeInUp 0.3s ease 0.1s backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mic-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(104, 166, 125, 0.4);
        }

        .mic-button:hover {
          transform: scale(1.05);
        }

        .mic-button.recording {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .mic-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .text-input-container {
          display: flex;
          gap: 8px;
          width: 90%;
          max-width: 400px;
          margin-top: 16px;
        }

        .text-input-container input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }

        .text-input-container input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .text-input-container input:focus {
          outline: none;
          border-color: var(--matcha-500);
        }

        .text-input-container button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: var(--matcha-500);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text-input-container button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .voice-end-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 12px 32px;
          border-radius: 24px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: fadeInUp 0.3s ease 0.2s backwards;
          margin-top: 16px;
        }

        .voice-end-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .voice-transcript {
          position: fixed;
          bottom: 160px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1001;
          max-height: 200px;
          overflow-y: auto;
        }

        .voice-transcript-entry {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          padding: 12px 16px;
          animation: slideIn 0.3s ease;
        }

        .voice-transcript-entry.user {
          margin-left: 20%;
          background: rgba(104, 166, 125, 0.3);
        }

        .voice-transcript-entry.assistant {
          margin-right: 20%;
          background: rgba(255, 255, 255, 0.15);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .voice-transcript-role {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 4px;
        }

        .voice-transcript-text {
          color: white;
          font-size: 14px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
