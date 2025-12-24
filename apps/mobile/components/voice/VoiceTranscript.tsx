import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../lib/colors';
import { TranscriptEntry } from '../../hooks/useVapi';

interface VoiceTranscriptProps {
  transcript: TranscriptEntry[];
  maxEntries?: number;
}

export function VoiceTranscript({ transcript, maxEntries = 5 }: VoiceTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (transcript.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [transcript.length]);

  if (transcript.length === 0) {
    return null;
  }

  const visibleTranscript = transcript.slice(-maxEntries);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {visibleTranscript.map((entry, index) => (
          <View key={index} style={styles.entry}>
            <Text
              style={[
                styles.role,
                entry.role === 'USER' ? styles.userRole : styles.assistantRole,
              ]}
            >
              {entry.role === 'USER' ? 'You' : 'Matcha'}
            </Text>
            <Text style={styles.content} numberOfLines={3}>
              {entry.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
    width: '100%',
  },
  scrollView: {
    flexGrow: 0,
  },
  entry: {
    marginBottom: 12,
  },
  role: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: '600',
  },
  userRole: {
    color: colors.matcha[300],
  },
  assistantRole: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: 'white',
  },
});

export default VoiceTranscript;
