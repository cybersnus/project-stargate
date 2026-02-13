export type TrainingMode = 'shape' | 'image' | 'location';

export interface ShapeTarget {
  session_id: string;
  target: string;
  options: string[];
}

export interface ImageData {
  id: number;
  url: string;
  seed: number;
}

export interface ImageTarget {
  session_id: string;
  images: ImageData[];
  target_index: number;
  target_seed: number;
}

export interface LocationReveal {
  map_url: string;
  // These will be fetched from Nominatim after reveal
  name?: string;
  description?: string;
}

export interface LocationTarget {
  session_id: string;
  coords: {
    lat: number;
    lng: number;
  };
  coords_display: string;
  region?: string;
  reveal: LocationReveal;
}

export interface SessionResult {
  mode: TrainingMode;
  session_id: string;
  timestamp: number;
  correct: boolean;
  rating?: number; // For location mode (1-5)
}

export interface Stats {
  shape: {
    total: number;
    correct: number;
    history: SessionResult[];
  };
  image: {
    total: number;
    correct: number;
    history: SessionResult[];
  };
  location: {
    total: number;
    totalRating: number;
    history: SessionResult[];
  };
}

export const DEFAULT_STATS: Stats = {
  shape: { total: 0, correct: 0, history: [] },
  image: { total: 0, correct: 0, history: [] },
  location: { total: 0, totalRating: 0, history: [] }
};
