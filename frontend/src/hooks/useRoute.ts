import { useState, useCallback } from 'react';
import { generateRoute } from '../services/routeService';
import type { RouteRequest, RouteResponse } from '../types';

interface RouteState {
  data: RouteResponse | null;
  loading: boolean;
  error: string | null;
}

export function useRoute() {
  const [state, setState] = useState<RouteState>({ data: null, loading: false, error: null });

  const fetchRoute = useCallback(async (request: RouteRequest) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await generateRoute(request);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate route';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, fetchRoute, reset };
}
