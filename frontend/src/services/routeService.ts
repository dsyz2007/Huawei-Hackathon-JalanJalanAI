import { api } from './api';
import type { RouteRequest, RouteResponse, RouteStep } from '../types';

export async function generateRoute(request: RouteRequest): Promise<RouteResponse> {
  const { data } = await api.post<RouteResponse>('/route', request);
  return data;
}

export async function getCheckpoints(routeId: string): Promise<RouteStep[]> {
  const { data } = await api.post<RouteStep[]>('/checkpoints', { routeId });
  return data;
}

export async function getStory(routeId: string, language: string): Promise<RouteStep[]> {
  const { data } = await api.post<RouteStep[]>('/story', { routeId, language });
  return data;
}
