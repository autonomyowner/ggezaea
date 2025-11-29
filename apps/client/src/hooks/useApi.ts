'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useState, useEffect } from 'react';
import { api, DashboardData, Analysis, ApiError } from '../lib/api';

export function useApi() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchDashboard = useCallback(async (): Promise<DashboardData | null> => {
    if (!isLoaded || !isSignedIn) return null;

    const token = await getToken();
    if (!token) return null;

    return api.getDashboard(token);
  }, [getToken, isLoaded, isSignedIn]);

  const createAnalysis = useCallback(async (inputText: string): Promise<Analysis | null> => {
    if (!isLoaded || !isSignedIn) return null;

    const token = await getToken();
    if (!token) return null;

    return api.createAnalysis(token, inputText);
  }, [getToken, isLoaded, isSignedIn]);

  const getAnalysis = useCallback(async (id: string): Promise<Analysis | null> => {
    if (!isLoaded || !isSignedIn) return null;

    const token = await getToken();
    if (!token) return null;

    return api.getAnalysis(token, id);
  }, [getToken, isLoaded, isSignedIn]);

  const getAnalyses = useCallback(async (page = 1, limit = 10) => {
    if (!isLoaded || !isSignedIn) return null;

    const token = await getToken();
    if (!token) return null;

    return api.getAnalyses(token, page, limit);
  }, [getToken, isLoaded, isSignedIn]);

  return {
    isReady: isLoaded && isSignedIn,
    fetchDashboard,
    createAnalysis,
    getAnalysis,
    getAnalyses,
  };
}

export function useDashboard() {
  const { isReady, fetchDashboard } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) {
      setIsLoading(true);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchDashboard();
        setData(result);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`API Error: ${err.status}`);
        } else {
          setError('Failed to load dashboard data');
        }
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isReady, fetchDashboard]);

  const refresh = useCallback(async () => {
    if (!isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchDashboard();
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API Error: ${err.status}`);
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isReady, fetchDashboard]);

  return { data, isLoading, error, refresh };
}
