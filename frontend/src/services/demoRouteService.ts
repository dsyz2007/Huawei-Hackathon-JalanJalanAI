import { api } from './api';
import type { RouteResponse, Language } from '../types';

export type DemoRouteId = 'A' | 'B' | 'C';

export const DEMO_ROUTES: Record<DemoRouteId, { label: string; origin: string; destination: string }> = {
  A: { label: 'Bedok MRT → Bedok Interchange', origin: 'Bedok MRT', destination: 'Bedok Interchange' },
  B: { label: 'Tampines MRT → Tampines Mall', origin: 'Tampines MRT', destination: 'Tampines Mall' },
  C: { label: 'Ang Mo Kio MRT → AMK Hub', origin: 'Ang Mo Kio MRT', destination: 'AMK Hub' },
};

const MOCK_DATA: Record<DemoRouteId, RouteResponse> = {
  A: {
    routeId: 'demo-A',
    distance: '650m',
    duration: '8 mins',
    steps: [
      {
        step: 1,
        checkpoint: { id: 'A1', action: 'exit_mrt', lat: 1.3236, lng: 103.9300, distance: 0 },
        landmark: { name: 'Bedok MRT Exit B', description: 'Blue MRT sign above the exit' },
        instruction: { text: 'Exit through Exit B. Look for the blue MRT sign above you.', audioText: 'Exit through Exit B. Look for the blue sign above you.', language: 'en' },
      },
      {
        step: 2,
        checkpoint: { id: 'A2', action: 'turn_left', lat: 1.3240, lng: 103.9305, distance: 80 },
        landmark: { name: 'POSB ATM', description: 'Yellow ATM machine on the corner' },
        instruction: { text: 'Walk until you see the yellow POSB ATM. Turn left there.', audioText: 'Walk to the yellow ATM. Turn left there.', language: 'en' },
      },
      {
        step: 3,
        checkpoint: { id: 'A3', action: 'cross_road', lat: 1.3245, lng: 103.9310, distance: 200 },
        landmark: { name: 'Red Bus Stop', description: 'Red roof bus stop with a shelter' },
        instruction: { text: 'Cross the road at the traffic light. The red bus stop is on the other side.', audioText: 'Cross at the traffic light. The bus stop is on the other side.', language: 'en' },
      },
      {
        step: 4,
        checkpoint: { id: 'A4', action: 'arrive', lat: 1.3250, lng: 103.9315, distance: 400 },
        landmark: { name: 'Bedok Interchange', description: 'Large covered bus interchange' },
        instruction: { text: 'You have arrived at Bedok Interchange!', audioText: 'You have arrived at Bedok Interchange!', language: 'en' },
      },
    ],
  },
  B: {
    routeId: 'demo-B',
    distance: '400m',
    duration: '5 mins',
    steps: [
      {
        step: 1,
        checkpoint: { id: 'B1', action: 'exit_mrt', lat: 1.3527, lng: 103.9451, distance: 0 },
        landmark: { name: 'Tampines MRT Exit A', description: 'Green MRT sign above the exit' },
        instruction: { text: 'Exit through Exit A. Look for the green MRT sign above you.', audioText: 'Exit through Exit A.', language: 'en' },
      },
      {
        step: 2,
        checkpoint: { id: 'B2', action: 'go_straight', lat: 1.3530, lng: 103.9455, distance: 100 },
        landmark: { name: 'Tampines Central Post Office', description: 'Red post box outside a building' },
        instruction: { text: 'Walk straight. You will pass a red post box on your right.', audioText: 'Walk straight. Pass the red post box on your right.', language: 'en' },
      },
      {
        step: 3,
        checkpoint: { id: 'B3', action: 'arrive', lat: 1.3533, lng: 103.9458, distance: 250 },
        landmark: { name: 'Tampines Mall Entrance', description: 'Big glass doors with a mall sign' },
        instruction: { text: 'You have arrived at Tampines Mall. Enter through the big glass doors.', audioText: 'You have arrived at Tampines Mall!', language: 'en' },
      },
    ],
  },
  C: {
    routeId: 'demo-C',
    distance: '300m',
    duration: '4 mins',
    steps: [
      {
        step: 1,
        checkpoint: { id: 'C1', action: 'exit_mrt', lat: 1.3699, lng: 103.8492, distance: 0 },
        landmark: { name: 'Ang Mo Kio MRT Exit C', description: 'Orange MRT sign above the exit' },
        instruction: { text: 'Exit through Exit C. Look for the orange sign above you.', audioText: 'Exit through Exit C.', language: 'en' },
      },
      {
        step: 2,
        checkpoint: { id: 'C2', action: 'turn_right', lat: 1.3702, lng: 103.8495, distance: 80 },
        landmark: { name: 'Kopitiam Coffee Shop', description: 'Open-air coffee shop with yellow signboard' },
        instruction: { text: 'Walk past the Kopitiam coffee shop and turn right.', audioText: 'Pass the coffee shop and turn right.', language: 'en' },
      },
      {
        step: 3,
        checkpoint: { id: 'C3', action: 'arrive', lat: 1.3705, lng: 103.8498, distance: 200 },
        landmark: { name: 'AMK Hub Entrance', description: 'Large shopping mall entrance' },
        instruction: { text: 'You have arrived at AMK Hub!', audioText: 'You have arrived at AMK Hub!', language: 'en' },
      },
    ],
  },
};

export async function getDemoRoute(id: DemoRouteId, language: Language): Promise<RouteResponse> {
  try {
    const { data } = await api.post<RouteResponse>('/demo-route', { id, language });
    return data;
  } catch {
    return MOCK_DATA[id];
  }
}
