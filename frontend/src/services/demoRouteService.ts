import { api } from './api';
import type { RouteResponse, Language } from '../types';

export type DemoRouteId = 'A' | 'B' | 'C';

export const DEMO_ROUTES: Record<DemoRouteId, { label: string; origin: string; destination: string }> = {
  A: { label: 'Bedok MRT → Bedok Interchange', origin: 'Bedok MRT', destination: 'Bedok Interchange' },
  B: { label: 'Tampines MRT → Tampines Mall', origin: 'Tampines MRT', destination: 'Tampines Mall' },
  C: { label: 'Ang Mo Kio MRT → AMK Hub', origin: 'Ang Mo Kio MRT', destination: 'AMK Hub' },
};

export async function getDemoRoute(id: DemoRouteId, language: Language): Promise<RouteResponse> {
  const { data } = await api.post<RouteResponse>('/demo-route', { id, language });
  return data;
}
