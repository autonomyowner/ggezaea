import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeVoiceSession } from '../components/voice';
import { createApiClient } from '../lib/api';
import { colors } from '../lib/colors';

type SessionType = 'general-therapy' | 'flash-technique' | 'crisis-support';

interface TranscriptEntry {
  role: 'USER' | 'ASSISTANT';
  content: string;
}

export default function VoiceSessionScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const params = useLocalSearchParams<{ type?: string }>();

  const [sessionType, setSessionType] = useState<SessionType | null>(
    (params.type as SessionType) || null
  );
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const handleSessionEnd = async (sessionTranscript: TranscriptEntry[]) => {
    setTranscript(sessionTranscript);
    setSessionCompleted(true);
    setSessionStarted(false);

    // Optionally save transcript to conversation
    if (sessionTranscript.length > 0) {
      try {
        const api = createApiClient(getToken);
        // Create a conversation with the transcript
        const { data: conv } = await api.createConversation('Voice Session');

        // Send a summary message
        const summary = sessionTranscript
          .map(t => `${t.role === 'USER' ? 'You' : 'Matcha'}: ${t.content}`)
          .join('\n\n');

        await api.sendMessage({
          conversationId: conv.id,
          message: `[Voice Session Transcript]\n\n${summary}`,
          isSessionEnd: true,
        });
      } catch (err) {
        console.error('Failed to save transcript:', err);
      }
    }
  };

  const handleClose = () => {
    router.back();
  };

  const startSession = (type: SessionType) => {
    setSessionType(type);
    setSessionStarted(true);
    setSessionCompleted(false);
    setTranscript([]);
  };

  // Session type selection screen
  if (!sessionType && !sessionStarted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream[50] }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.warm[800]} />
            </TouchableOpacity>
            <Text style={{
              fontFamily: 'DMSerifDisplay_400Regular',
              fontSize: 24,
              color: colors.warm[900]
            }}>
              Voice Therapy
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Description */}
          <Text style={{
            color: colors.warm[600],
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 24,
          }}>
            Have a real-time voice conversation with Matcha.
            Choose a session type to get started.
          </Text>

          {/* Session Options */}
          <View style={{ gap: 16 }}>
            {/* General Therapy */}
            <TouchableOpacity
              onPress={() => startSession('general-therapy')}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.matcha[200],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.matcha[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="chatbubbles-outline" size={24} color={colors.matcha[600]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.warm[900],
                    marginBottom: 4,
                  }}>
                    General Therapy
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.warm[600] }}>
                    Open conversation with Matcha
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.warm[500], fontSize: 13 }}>
                Talk about anything on your mind. Matcha will listen and support you.
              </Text>
            </TouchableOpacity>

            {/* Flash Technique */}
            <TouchableOpacity
              onPress={() => startSession('flash-technique')}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.matcha[200],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.cream[300],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="flash-outline" size={24} color={colors.terra[500]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.warm[900],
                    marginBottom: 4,
                  }}>
                    Flash Technique
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.warm[600] }}>
                    Voice-guided EMDR session
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.warm[500], fontSize: 13 }}>
                10-15 minute guided session for processing distressing memories.
              </Text>
            </TouchableOpacity>

            {/* Crisis Support */}
            <TouchableOpacity
              onPress={() => startSession('crisis-support')}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.terra[300],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.terra[300] + '30',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="heart-outline" size={24} color={colors.terra[500]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.warm[900],
                    marginBottom: 4,
                  }}>
                    Crisis Support
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.warm[600] }}>
                    Immediate support when you need it
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.warm[500], fontSize: 13 }}>
                For difficult moments. Matcha will help ground and support you.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tip */}
          <View style={{
            backgroundColor: colors.matcha[50],
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
          }}>
            <Text style={{ color: colors.matcha[700], fontSize: 13, lineHeight: 20 }}>
              Find a quiet space and use headphones for the best experience.
              You can speak naturally and interrupt Matcha at any time.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Session completed screen
  if (sessionCompleted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream[50] }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}
        >
          {/* Success indicator */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.matcha[100],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="checkmark" size={40} color={colors.matcha[600]} />
            </View>
            <Text style={{
              fontFamily: 'DMSerifDisplay_400Regular',
              fontSize: 28,
              color: colors.warm[900],
              marginBottom: 8,
            }}>
              Session Complete
            </Text>
            <Text style={{ color: colors.warm[600], fontSize: 16, textAlign: 'center' }}>
              {transcript.length > 0
                ? `${transcript.length} messages exchanged`
                : 'Your session has ended'}
            </Text>
          </View>

          {/* Transcript preview */}
          {transcript.length > 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.warm[200],
            }}>
              <Text style={{
                fontWeight: '600',
                color: colors.warm[900],
                marginBottom: 12,
                fontSize: 16,
              }}>
                Session Highlights
              </Text>
              {transcript.slice(0, 4).map((entry, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={{
                    color: entry.role === 'USER' ? colors.matcha[600] : colors.warm[600],
                    fontSize: 12,
                    marginBottom: 2,
                  }}>
                    {entry.role === 'USER' ? 'You' : 'Matcha'}
                  </Text>
                  <Text style={{ color: colors.warm[800], fontSize: 14 }} numberOfLines={2}>
                    {entry.content}
                  </Text>
                </View>
              ))}
              {transcript.length > 4 && (
                <Text style={{ color: colors.warm[500], fontSize: 13, marginTop: 8 }}>
                  + {transcript.length - 4} more messages
                </Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                setSessionType(null);
                setSessionCompleted(false);
                setTranscript([]);
              }}
              style={{
                backgroundColor: colors.matcha[600],
                paddingVertical: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 16,
              }}>
                Start New Session
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                backgroundColor: colors.warm[200],
                paddingVertical: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{
                color: colors.warm[700],
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 16,
              }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Encouragement */}
          <View style={{
            backgroundColor: colors.matcha[50],
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
          }}>
            <Text style={{
              color: colors.matcha[700],
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 22,
            }}>
              Taking time for yourself is important.
              Remember, you can always come back when you need support.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active session
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <NativeVoiceSession
          sessionType={sessionType || 'general-therapy'}
          onSessionEnd={handleSessionEnd}
          onClose={handleClose}
        />
      </SafeAreaView>
    </View>
  );
}
