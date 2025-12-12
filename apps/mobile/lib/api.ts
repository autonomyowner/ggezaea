import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://matcha-api-akyb.onrender.com/api';

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

export const createApiClient = (
  getToken: (options?: { forceRefresh?: boolean }) => Promise<string | null>
) => {
  const client: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await getToken({ forceRefresh: true });
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch {
          // Token refresh failed - user needs to re-authenticate
        }
      }

      return Promise.reject(error);
    }
  );

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
  };
};

export type ApiClient = ReturnType<typeof createApiClient>;
