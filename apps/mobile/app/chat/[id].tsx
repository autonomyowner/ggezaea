import { useEffect, useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { createApiClient, Message, Analysis, Conversation } from '../../lib/api';
import { useAppStore } from '../../stores/appStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Typing Indicator Component
function TypingIndicator() {
  return (
    <View className="flex-row items-center px-4 py-3 self-start">
      <View className="bg-warm-100 rounded-2xl rounded-tl-sm px-4 py-3 flex-row items-center">
        <View className="w-2 h-2 bg-warm-400 rounded-full mx-0.5 animate-bounce" />
        <View className="w-2 h-2 bg-warm-400 rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '150ms' }} />
        <View className="w-2 h-2 bg-warm-400 rounded-full mx-0.5 animate-bounce" style={{ animationDelay: '300ms' }} />
      </View>
    </View>
  );
}

// Message Bubble Component - Memoized to prevent re-renders
const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'USER';

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <View
        style={{
          maxWidth: '85%',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isUser ? '#5a9470' : '#f5ebe0',
          borderRadius: 16,
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
        }}
      >
        <Text style={{ color: isUser ? 'white' : '#2d3a2e', fontSize: 16 }}>
          {message.content}
        </Text>
      </View>
      <Text style={{ color: '#a69889', fontSize: 12, marginTop: 4, paddingHorizontal: 4 }}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
});

// Analysis Panel Component
function AnalysisPanel({ analysis }: { analysis: Analysis | null }) {
  if (!analysis) {
    return (
      <View className="p-4 items-center justify-center">
        <Ionicons name="analytics-outline" size={48} color="#d9d0c5" />
        <Text className="text-warm-500 mt-2">
          Analysis will appear as you chat
        </Text>
      </View>
    );
  }

  return (
    <View className="p-4">
      {/* Emotional State */}
      <View className="mb-4">
        <Text className="text-warm-900 font-sans-semibold mb-2">Emotional State</Text>
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-matcha-100 px-3 py-1 rounded-full">
            <Text className="text-matcha-700 font-sans-medium">
              {analysis.emotionalState.primary}
            </Text>
          </View>
          {analysis.emotionalState.secondary && (
            <View className="bg-warm-200 px-3 py-1 rounded-full">
              <Text className="text-warm-700">{analysis.emotionalState.secondary}</Text>
            </View>
          )}
          <View className="bg-terra-300/30 px-3 py-1 rounded-full">
            <Text className="text-terra-600 text-sm">{analysis.emotionalState.intensity}</Text>
          </View>
        </View>
      </View>

      {/* Thinking Patterns */}
      {analysis.patterns.length > 0 && (
        <View className="mb-4">
          <Text className="text-warm-900 font-sans-semibold mb-2">Thinking Patterns</Text>
          <View className="gap-2">
            {analysis.patterns.map((pattern) => (
              <View key={pattern.name}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-warm-700">{pattern.name}</Text>
                  <Text className="text-matcha-600 font-sans-medium">
                    {Math.round(pattern.percentage)}%
                  </Text>
                </View>
                <View className="h-2 bg-warm-200 rounded-full">
                  <View
                    className="h-full bg-matcha-500 rounded-full"
                    style={{ width: `${pattern.percentage}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Biases */}
      {analysis.biases.length > 0 && (
        <View className="mb-4">
          <Text className="text-warm-900 font-sans-semibold mb-2">Detected Biases</Text>
          <View className="gap-2">
            {analysis.biases.slice(0, 3).map((bias) => (
              <View key={bias.name} className="bg-warm-50 p-3 rounded-xl">
                <View className="flex-row justify-between items-center">
                  <Text className="text-warm-900 font-sans-medium">{bias.name}</Text>
                  <Text className="text-terra-500 text-sm">
                    {Math.round(bias.confidence * 100)}%
                  </Text>
                </View>
                {bias.description && (
                  <Text className="text-warm-600 text-sm mt-1">{bias.description}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <View>
          <Text className="text-warm-900 font-sans-semibold mb-2">Key Insights</Text>
          <View className="gap-2">
            {analysis.insights.map((insight, index) => (
              <View key={index} className="border-l-2 border-matcha-400 pl-3 py-1">
                <Text className="text-warm-700">{insight}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { getToken } = useAuth();
  const { currentAnalysis, setCurrentAnalysis } = useAppStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced scroll to bottom
  const scrollToBottom = useCallback((animated = true) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  const fetchConversation = useCallback(async () => {
    if (!id || id === 'new') {
      // New conversation - don't fetch, just show empty chat
      setIsLoading(false);
      return;
    }

    try {
      const api = createApiClient(getToken);
      const response = await api.getConversation(id);
      setConversation(response.data);
      setMessages(response.data.messages || []);
      setError(null);

      // Set analysis from conversation if available
      if (response.data.emotionalState) {
        setCurrentAnalysis({
          emotionalState: response.data.emotionalState as any,
          biases: response.data.biases || [],
          patterns: response.data.patterns || [],
          insights: response.data.insights || [],
        });
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Conversation not found');
      } else {
        console.log('API unavailable, starting fresh conversation');
        // Don't show error for network issues - allow offline chatting
      }
    }
  }, [id, getToken, setCurrentAnalysis]);

  useEffect(() => {
    fetchConversation().finally(() => setIsLoading(false));
  }, [fetchConversation]);

  useEffect(() => {
    if (conversation?.title) {
      navigation.setOptions({ headerTitle: conversation.title });
    }
  }, [conversation?.title, navigation]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const api = createApiClient(getToken);
      const response = await api.sendMessage({
        message: messageText,
        conversationId: id === 'new' ? undefined : id,
      });

      // Update with real messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessage.id),
        { ...tempUserMessage, id: `user-${Date.now()}` },
        response.data.message,
      ]);

      // If this was a new conversation, navigate to the real conversation ID
      if (id === 'new' && response.data.conversationId) {
        router.replace(`/chat/${response.data.conversationId}`);
      }

      // Update analysis
      if (response.data.analysis) {
        setCurrentAnalysis(response.data.analysis);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setInputText(messageText); // Restore input

      // Show error alert
      const errorMessage = err?.response?.status === 401
        ? 'Please sign in to send messages'
        : 'Unable to connect to server. Please check your internet connection.';
      Alert.alert('Message Failed', errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const toggleAnalysis = () => {
    if (showAnalysis) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.expand();
    }
    setShowAnalysis(!showAnalysis);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center" edges={['bottom']}>
        <ActivityIndicator size="large" color="#5a9470" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center px-8" edges={['bottom']}>
        <Ionicons name="alert-circle-outline" size={64} color="#c97d52" />
        <Text className="text-warm-900 font-sans-semibold text-xl mt-4">{error}</Text>
        <Text className="text-warm-500 text-center mt-2">
          This conversation may have been deleted or doesn't exist.
        </Text>
        <TouchableOpacity
          className="mt-6 bg-matcha-600 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-sans-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fefdfb' }} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
            onContentSizeChange={() => scrollToBottom(true)}
            ListFooterComponent={isSending ? <TypingIndicator /> : null}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            removeClippedSubviews={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />

          {/* Input Area */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              paddingHorizontal: 12,
              paddingVertical: 8,
              paddingBottom: Platform.OS === 'android' ? 12 : 8,
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#f5ebe0',
            }}
          >
            <TouchableOpacity
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              onPress={toggleAnalysis}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showAnalysis ? 'analytics' : 'analytics-outline'}
                size={24}
                color={showAnalysis ? '#5a9470' : '#a69889'}
              />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                backgroundColor: '#faf8f5',
                borderRadius: 22,
                paddingHorizontal: 16,
                paddingVertical: Platform.OS === 'ios' ? 10 : 6,
                marginHorizontal: 8,
                minHeight: 44,
                maxHeight: 120,
                justifyContent: 'center',
              }}
            >
              <TextInput
                style={{
                  color: '#2d3a2e',
                  fontSize: 16,
                  lineHeight: 22,
                  maxHeight: 100,
                  minHeight: Platform.OS === 'ios' ? 22 : 28,
                  paddingTop: Platform.OS === 'ios' ? 0 : 8,
                  paddingBottom: Platform.OS === 'ios' ? 0 : 8,
                  textAlignVertical: 'center',
                }}
                placeholder="Type a message..."
                placeholderTextColor="#a69889"
                value={inputText}
                onChangeText={setInputText}
                onFocus={() => scrollToBottom(true)}
                multiline
                maxLength={10000}
                blurOnSubmit={false}
                returnKeyType="default"
              />
            </View>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: inputText.trim() && !isSending ? '#5a9470' : '#e5ddd5',
              }}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isSending ? 'white' : '#a69889'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Analysis Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['50%', '75%']}
          enablePanDownToClose
          onClose={() => setShowAnalysis(false)}
          backgroundStyle={{ backgroundColor: '#fefdfb' }}
          handleIndicatorStyle={{ backgroundColor: '#d9d0c5' }}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          <View className="flex-row items-center justify-between px-4 pb-2 border-b border-warm-100">
            <Text className="text-warm-900 font-sans-semibold text-lg">Analysis</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Ionicons name="close" size={24} color="#5a5347" />
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView>
            <AnalysisPanel analysis={currentAnalysis} />
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
