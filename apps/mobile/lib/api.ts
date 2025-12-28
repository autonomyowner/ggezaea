import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://matcha-api-akyb.onrender.com/api';

// Helper for parsing SSE data
function parseSSELine(line: string): { type: string; content?: string; [key: string]: any } | null {
  if (!line.startsWith('data: ')) return null;
  try {
    return JSON.parse(line.slice(6));
  } catch {
    return null;
  }
}

// Streaming message sender
export async function sendMessageStream(
  data: { message: string; conversationId?: string },
  onChunk: (chunk: string) => void,
  onDone: (finalData: SendMessageResponse) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/chat/send/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const parsed = parseSSELine(line.trim());
        if (!parsed) continue;

        if (parsed.type === 'chunk' && parsed.content) {
          onChunk(parsed.content);
        } else if (parsed.type === 'done') {
          onDone(parsed as unknown as SendMessageResponse);
        } else if (parsed.type === 'error') {
          onError(parsed.message || 'Stream error');
        }
      }
    }
  } catch (err: any) {
    onError(err.message || 'Stream failed');
  }
}

export interface DashboardData {
  profile: {
    id: string;
    email: string;
    firstName: string | null;
    tier: 'FREE' | 'PRO';
    memberSince: string;
    completionPercentage: number;
  };
  usage: {
    analysesThisMonth: number;
    analysesRemaining: number | null;
    chatMessagesThisMonth: number;
    chatMessagesRemaining: number | null;
    totalAnalyses: number;
    totalConversationsWithAnalysis: number;
    lastAnalysisDate: string | null;
    lastChatAnalysisDate: string | null;
  };
  stats: {
    topBiases: Array<{ name: string; avgIntensity: number; count: number }>;
    patterns: Array<{ name: string; avgPercentage: number }>;
    emotionalTrends: Array<{ emotion: string; count: number; avgIntensity: number }>;
  };
  recentInsights: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  sessionType?: 'CHAT' | 'EMDR_FLASH';
  emotionalState?: { primary: string; secondary?: string; intensity: string };
  biases?: Array<{ name: string; confidence: number; description: string }>;
  patterns?: Array<{ name: string; percentage: number }>;
  insights?: string[];
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface Analysis {
  emotionalState: {
    primary: string;
    secondary?: string;
    intensity: 'low' | 'moderate' | 'high';
  };
  biases: Array<{ name: string; confidence: number; description: string }>;
  patterns: Array<{ name: string; percentage: number }>;
  insights: string[];
}

export interface SendMessageResponse {
  conversationId: string;
  message: Message;
  analysis?: Analysis;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelTier?: string;
}

export interface EmdrSession {
  id: string;
  conversationId: string;
  currentPhase: string;
  blinkIntervalMin: number;
  blinkIntervalMax: number;
  blinksPerSet: number;
  tapIntervalMs: number;
  distressStart: number | null;
  distressEnd: number | null;
  setsCompleted: number;
  startedAt: string;
  completedAt: string | null;
}

export interface EmdrGuidance {
  shouldShowBilateral: boolean;
  shouldShowBlinks: boolean;
  blinkCount: number;
  suggestedNextPhase: string | null;
  groundingNeeded: boolean;
}

export interface VoiceSession {
  id: string;
  userId: string;
  conversationId: string | null;
  vapiCallId: string;
  sessionType: 'general-therapy' | 'flash-technique' | 'crisis-support';
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  transcript: string | null;
  duration: number | null;
  vapiCosts: any;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface StartVoiceSessionResponse {
  session: VoiceSession;
  webCallUrl: string;
  conversationId: string;
}

export const createApiClient = () => {
  const client: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    // Dashboard
    getDashboard: () => client.get<DashboardData>('/dashboard'),

    // Chat Usage
    getChatUsage: () =>
      client.get<{ tier: string; messagesRemaining: number | null; limit: number | null }>(
        '/chat/usage'
      ),

    // Conversations
    getConversations: (page = 1, limit = 20) =>
      client.get<{
        conversations: Conversation[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/chat/conversations?page=${page}&limit=${limit}`),

    getConversation: (id: string) => client.get<Conversation>(`/chat/conversations/${id}`),

    createConversation: (title?: string) =>
      client.post<Conversation>('/chat/conversations', { title }),

    updateConversationTitle: (id: string, title: string) =>
      client.patch<Conversation>(`/chat/conversations/${id}`, { title }),

    deleteConversation: (id: string) => client.delete(`/chat/conversations/${id}`),

    // Messages
    sendMessage: (data: {
      message: string;
      conversationId?: string;
      isSessionEnd?: boolean;
      requestDeepAnalysis?: boolean;
    }) => client.post<SendMessageResponse>('/chat/send', data),

    // EMDR Flash Technique
    startEmdrSession: () =>
      client.post<{
        conversationId: string;
        message: Message;
        session: EmdrSession;
        guidance: EmdrGuidance;
      }>('/chat/emdr/start'),

    sendEmdrMessage: (conversationId: string, message: string) =>
      client.post<{
        conversationId: string;
        message: Message;
        session: EmdrSession;
        guidance: EmdrGuidance;
      }>('/chat/emdr/send', { conversationId, message }),

    getEmdrSession: (conversationId: string) =>
      client.get<{ session: EmdrSession; conversation: Conversation }>(
        `/chat/emdr/${conversationId}`
      ),

    updateEmdrPhase: (conversationId: string, phase: string, distressLevel?: number) =>
      client.patch<EmdrSession>(`/chat/emdr/${conversationId}/phase`, {
        phase,
        distressLevel,
      }),

    completeEmdrSession: (conversationId: string, distressEnd: number) =>
      client.post<EmdrSession>(`/chat/emdr/${conversationId}/complete`, { distressEnd }),

    // TTS
    speak: (text: string, voiceId?: string) =>
      client.post('/tts/speak', { text, voiceId }, { responseType: 'arraybuffer' }),

    // Stripe
    createCheckout: (data: {
      email: string;
      billing: 'monthly' | 'yearly';
      successUrl: string;
      cancelUrl: string;
    }) => client.post<{ url: string | null; message?: string }>('/stripe/create-checkout', data),

    // Voice Therapy
    startVoiceSession: (data: {
      sessionType: 'general-therapy' | 'flash-technique' | 'crisis-support';
      createNewConversation?: boolean;
      conversationId?: string;
    }) => client.post<StartVoiceSessionResponse>('/voice/start', data),

    getVoiceSession: (sessionId: string) =>
      client.get<{ session: VoiceSession }>(`/voice/sessions/${sessionId}`),

    endVoiceSession: (sessionId: string) =>
      client.patch<{ session: VoiceSession; transcript: Array<{ role: string; content: string }> }>(
        `/voice/sessions/${sessionId}/end`
      ),

    getVoiceSessionHistory: (page = 1, limit = 10) =>
      client.get<{
        sessions: VoiceSession[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/voice/sessions?page=${page}&limit=${limit}`),
  };
};

export type ApiClient = ReturnType<typeof createApiClient>;
