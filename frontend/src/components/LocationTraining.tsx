import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LocationTarget } from '../types';
import { useStats } from '../hooks/useStats';
import { useSoundContext } from '../contexts/SoundContext';

// Fix for default marker icon in Leaflet with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

import { API_BASE } from '../config';

type Phase = 'impression' | 'reveal' | 'rating' | 'result';

interface LocationInfo {
  name: string;
  country: string;
  loading: boolean;
}

export function LocationTraining() {
  const navigate = useNavigate();
  const { recordResult } = useStats();
  const { playSound } = useSoundContext();
  const [target, setTarget] = useState<LocationTarget | null>(null);
  const [phase, setPhase] = useState<Phase>('impression');
  const [impressions, setImpressions] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({ name: '', country: '', loading: false });

  const fetchTarget = async () => {
    setLoading(true);
    setError(null);
    setLocationInfo({ name: '', country: '', loading: false });
    try {
      const response = await fetch(`${API_BASE}/api/targets/location`);
      if (!response.ok) throw new Error('Failed to fetch target');
      const data = await response.json();
      setTarget(data);
      setPhase('impression');
      setImpressions('');
      setRating(null);
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch location info from Nominatim when revealing
  const fetchLocationInfo = async (lat: number, lng: number) => {
    setLocationInfo({ name: '', country: '', loading: true });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const name = address.city || address.town || address.village || address.county || address.state || 'Unknown area';
        const country = address.country || 'Unknown';
        setLocationInfo({ name, country, loading: false });
      } else {
        setLocationInfo({ name: 'Unknown location', country: '', loading: false });
      }
    } catch {
      setLocationInfo({ name: 'Could not fetch location', country: '', loading: false });
    }
  };

  useEffect(() => {
    fetchTarget();
  }, []);

  const handleReveal = () => {
    playSound('reveal');
    setPhase('reveal');
    if (target) {
      fetchLocationInfo(target.coords.lat, target.coords.lng);
    }
  };

  const handleProceedToRating = () => {
    playSound('click');
    setPhase('rating');
  };

  const handleRating = (value: number) => {
    if (!target) return;
    setRating(value);

    playSound(value >= 3 ? 'success' : 'error');

    recordResult({
      mode: 'location',
      session_id: target.session_id,
      timestamp: Date.now(),
      correct: value >= 3,
      rating: value
    });

    setPhase('result');
  };

  const handleNextSession = () => {
    playSound('click');
    fetchTarget();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="coords-display">INITIALIZING SESSION...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="result-box result-incorrect">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchTarget} style={{ marginTop: '1rem' }}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!target) return null;

  const displayName = locationInfo.name && locationInfo.country
    ? `${locationInfo.name}, ${locationInfo.country}`
    : locationInfo.name || 'Unknown Location';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-header" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>
          <span className="soviet-star">●</span> Coordinate Protocol
        </h2>
        <button className="btn btn-secondary" onClick={() => navigate('/training')}>
          ← Back
        </button>
      </div>

      <div className="session-id">{target.session_id}</div>

      {phase === 'impression' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-terminal)', fontSize: '0.9rem', color: 'var(--teal-bright)' }}>
              TARGET COORDINATES:
            </p>
            <div className="coords-display">
              {target.coords_display}
            </div>
          </div>

          <div style={{
            background: 'rgba(74, 155, 155, 0.1)',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderLeft: '3px solid var(--teal-dim)',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: 'var(--warning-amber)' }}>HOW TO PERCEIVE:</strong>
            </p>
            <ol style={{ paddingLeft: '1.2rem', marginBottom: '0' }}>
              <li style={{ marginBottom: '0.5rem' }}>Look at the coordinates briefly, then close your eyes. The numbers are just a "signal" — don't try to decode them geographically.</li>
              <li style={{ marginBottom: '0.5rem' }}>Relax your mind. Ask yourself: "What is at this location?"</li>
              <li style={{ marginBottom: '0.5rem' }}>Let impressions arise naturally — terrain features, colors, temperatures, sounds, smells, emotions, human presence, structures, vegetation.</li>
              <li style={{ marginBottom: '0' }}>Describe sensory qualities, not conclusions. Write "wet, green, dense" not "rainforest." Write "flat, dry, brown" not "desert."</li>
            </ol>
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            RECORD YOUR IMPRESSIONS:
          </label>
          <textarea
            className="textarea-field"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            placeholder="Examples: 'feels dry and hot... brown/orange colors... flat terrain... sparse vegetation... sense of openness... wind...' — describe the sensations"
            style={{ minHeight: '150px' }}
          />

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleReveal}
              disabled={impressions.trim().length < 20}
            >
              Reveal Target →
            </button>
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div>
          <div style={{
            background: 'rgba(74, 155, 155, 0.1)',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderLeft: '3px solid var(--teal-dim)'
          }}>
            <strong>Your impressions:</strong>
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{impressions}</p>
          </div>

          <div style={{
            border: '2px solid var(--teal-dim)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            background: 'var(--bg-panel)'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--teal-bright)' }}>
              ● TARGET REVEALED ●
            </h3>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--white-bright)' }}>
                {locationInfo.loading ? 'Loading location...' : displayName}
              </h4>
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-terminal)' }}>
                {target.coords_display}
              </p>
            </div>

            <p style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Compare your impressions to the map below. Consider terrain, vegetation, urban/rural character, climate indicators.
            </p>

            <div style={{ height: '350px', marginBottom: '1rem', border: '2px solid var(--border-dim)' }}>
              <MapContainer
                key={target.session_id}
                center={[target.coords.lat, target.coords.lng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <Marker position={[target.coords.lat, target.coords.lng]} />
              </MapContainer>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem', textAlign: 'center' }}>
              <a
                href={`https://www.google.com/maps/@${target.coords.lat},${target.coords.lng},14z`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--teal-bright)' }}
              >
                Open in Google Maps →
              </a>
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={handleProceedToRating}>
              Rate Your Accuracy →
            </button>
          </div>
        </div>
      )}

      {phase === 'rating' && (
        <div>
          <div style={{
            background: 'rgba(74, 155, 155, 0.1)',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderLeft: '3px solid var(--teal-dim)'
          }}>
            <strong>Target:</strong> {displayName}
            <p style={{ marginTop: '0.5rem' }}><strong>Your impressions:</strong></p>
            <p style={{ fontStyle: 'italic' }}>{impressions}</p>
          </div>

          <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
            RATE THE ACCURACY OF YOUR IMPRESSIONS:
          </p>

          <div className="rating-scale">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={`rating-btn ${rating === value ? 'selected' : ''}`}
                onClick={() => handleRating(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            color: 'var(--text-dim)'
          }}>
            <span>No Match</span>
            <span>Slight</span>
            <span>Partial</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div>
          <div className={`result-box ${rating! >= 3 ? 'result-correct' : 'result-incorrect'}`}>
            <div className="result-title">
              SESSION COMPLETE
            </div>
            <p style={{ fontSize: '1.2rem' }}>
              Your accuracy rating: <strong>{rating}/5</strong>
            </p>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>
              {rating === 5 && 'Excellent correspondence with target'}
              {rating === 4 && 'Good match with significant elements'}
              {rating === 3 && 'Partial match with some accurate impressions'}
              {rating === 2 && 'Slight correspondence, mostly misses'}
              {rating === 1 && 'No meaningful correspondence'}
            </p>
          </div>

          <div style={{
            background: 'rgba(74, 155, 155, 0.1)',
            padding: '1rem',
            marginTop: '1rem',
            borderLeft: '3px solid var(--teal-dim)'
          }}>
            <h4 style={{ marginBottom: '0.5rem' }}>{displayName}</h4>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {target.coords_display}
            </p>
            <p><strong>Your impressions:</strong></p>
            <p style={{ fontStyle: 'italic' }}>{impressions}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={handleNextSession}>
              Next Session →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
