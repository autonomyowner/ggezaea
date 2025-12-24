import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVapi, TranscriptEntry } from '../../hooks/useVapi';
import { VoiceOrb } from './VoiceOrb';
import { VoiceTranscript } from './VoiceTranscript';
import { SessionType } from '../../lib/voice-config';
import { colors } from '../../lib/colors';

interface NativeVoiceSessionProps {
  sessionType: SessionType;
  onSessionEnd?: (transcript: TranscriptEntry[]) => void;
  onClose?: () => void;
}

export function NativeVoiceSession({
  sessionType,
  onSessionEnd,
  onClose,
}: NativeVoiceSessionProps) {
  const {
    status,
    volumeLevel,
    transcript,
    error,
    start,
    stop,
    statusText,
    subText,
  } = useVapi({
    sessionType,
    onSessionEnd,
    onError: (err) => console.error('Voice error:', err),
  });

  // Auto-start the session when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      start();
    }, 500); // Small delay for smooth transition

    return () => clearTimeout(timer);
  }, [start]);

  const handleEndSession = useCallback(() => {
    stop();
  }, [stop]);

  const handleRetry = useCallback(() => {
    start();
  }, [start]);

  const isOrbActive = status === 'active' || status === 'speaking';

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      {/* Main content */}
      <View style={styles.content}>
        {/* Voice Orb */}
        <View style={styles.orbContainer}>
          <VoiceOrb
            isActive={isOrbActive}
            volumeLevel={volumeLevel}
            size={180}
          />
        </View>

        {/* Status text */}
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.subText}>{subText}</Text>

        {/* Error display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Transcript */}
        <View style={styles.transcriptContainer}>
          <VoiceTranscript transcript={transcript} maxEntries={5} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {status === 'connecting' && (
            <View style={styles.connectingContainer}>
              <ActivityIndicator size="small" color={colors.matcha[400]} />
              <Text style={styles.connectingText}>Connecting...</Text>
            </View>
          )}

          {(status === 'active' || status === 'speaking') && (
            <TouchableOpacity
              onPress={handleEndSession}
              style={styles.endButton}
            >
              <Text style={styles.endButtonText}>End Conversation</Text>
            </TouchableOpacity>
          )}

          {status === 'error' && (
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}

          {status === 'ended' && (
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orbContainer: {
    marginBottom: 32,
  },
  statusText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(200, 100, 100, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(200, 100, 100, 0.4)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    color: '#ff9999',
    textAlign: 'center',
    fontSize: 14,
  },
  transcriptContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  controls: {
    alignItems: 'center',
  },
  connectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectingText: {
    color: 'white',
    fontSize: 16,
  },
  endButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  endButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: colors.matcha[600],
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NativeVoiceSession;
