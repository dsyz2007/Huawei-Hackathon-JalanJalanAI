export type Language = 'en' | 'singlish' | 'yue' | 'teo' | 'zh' | 'ms' | 'ta' | 'hi';

export interface Checkpoint {
  id: string;
  action: 'turn_left' | 'turn_right' | 'go_straight' | 'cross_road' | 'exit_mrt' | 'arrive';
  lat: number;
  lng: number;
  distance?: number;
  bearing?: number;
}

export interface Landmark {
  name: string;
  description: string;
  imageUrl?: string;
  salienceScore?: number;
}

export interface Instruction {
  text: string;
  audioText: string;
  language: Language;
}

export interface RouteStep {
  step: number;
  checkpoint: Checkpoint;
  landmark?: Landmark;
  instruction?: Instruction;
}

export interface RouteRequest {
  origin: string;
  destination: string;
  language: Language;
  preferShelter: boolean;
}

export interface RouteResponse {
  routeId: string;
  distance: string;
  duration: string;
  steps: RouteStep[];
}

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}
