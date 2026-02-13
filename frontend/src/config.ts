// API base URL - uses environment variable in production, localhost in development
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
