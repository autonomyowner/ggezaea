'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data);
  }

  return response.json();
}

// API Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  tier: 'FREE' | 'PRO';
  createdAt: string;
  updatedAt: string;
  usage: {
    analysesThisMonth: number;
    analysesRemaining: number | null;
  };
}

export interface Analysis {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  inputText: string;
  biases: Array<{ name: string; intensity: number; description: string }> | null;
  patterns: Array<{ name: string; percentage: number }> | null;
  insights: string[] | null;
  emotionalState: { primary: string; secondary?: string; intensity: string } | null;
  processingTime: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
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
    totalAnalyses: number;
    lastAnalysisDate: string | null;
  };
  stats: {
    topBiases: Array<{ name: string; avgIntensity: number; count: number }>;
    patterns: Array<{ name: string; avgPercentage: number }>;
  };
  recentInsights: string[];
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  analysisLimit: number | null;
  features: Array<{ name: string; included: boolean }>;
  popular?: boolean;
}

// API Functions
export const api = {
  // User
  getMe: (token: string) =>
    apiClient<UserProfile>('/users/me', { token }),

  updateMe: (token: string, data: { firstName?: string }) =>
    apiClient<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  // Dashboard
  getDashboard: (token: string) =>
    apiClient<DashboardData>('/dashboard', { token }),

  // Analyses
  createAnalysis: (token: string, inputText: string) =>
    apiClient<Analysis>('/analyses', {
      method: 'POST',
      body: JSON.stringify({ inputText }),
      token,
    }),

  getAnalyses: (token: string, page = 1, limit = 10) =>
    apiClient<{ data: Analysis[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/analyses?page=${page}&limit=${limit}`,
      { token }
    ),

  getAnalysis: (token: string, id: string) =>
    apiClient<Analysis>(`/analyses/${id}`, { token }),

  // Plans
  getPlans: () =>
    apiClient<{ plans: Plan[]; currency: string; vatRate: number }>('/plans'),
};
