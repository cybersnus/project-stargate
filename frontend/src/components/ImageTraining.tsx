import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ImageTarget } from '../types';
import { useStats } from '../hooks/useStats';
import { useSoundContext } from '../contexts/SoundContext';

import { API_BASE } from '../config';

type Phase = 'impression' | 'selection' | 'result';

export function ImageTraining() {
  const navigate = useNavigate();
  const { recordResult } = useStats();
  const { playSound } = useSoundContext();
  const [target, setTarget] = useState<ImageTarget | null>(null);
  const [phase, setPhase] = useState<Phase>('impression');
  const [impressions, setImpressions] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  const fetchTarget = async () => {
    setLoading(true);
    setError(null);
    setImagesLoaded([]);
    try {
      const response = await fetch(`${API_BASE}/api/targets/images`);
      if (!response.ok) throw new Error('Failed to fetch target');
      const data = await response.json();
      setTarget(data);
      setPhase('impression');
      setImpressions('');
      setSelected(null);
      setImagesLoaded(new Array(data.images.length).fill(false));
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarget();
  }, []);

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  const handleProceedToSelection = () => {
    playSound('click');
    setPhase('selection');
  };

  const handleSelect = (index: number) => {
    if (phase !== 'selection' || !target) return;
    setSelected(index);
    const correct = index === target.target_index;

    playSound(correct ? 'success' : 'error');

    recordResult({
      mode: 'image',
      session_id: target.session_id,
      timestamp: Date.now(),
      correct
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

  const allImagesLoaded = imagesLoaded.length > 0 && imagesLoaded.every(Boolean);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-header" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>
          <span className="soviet-star">★</span> Image Protocol
        </h2>
        <button className="btn btn-secondary" onClick={() => navigate('/training')}>
          ← Back
        </button>
      </div>

      <div className="session-id">{target.session_id}</div>

      {phase === 'impression' && (
        <div>
          <div style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--teal-dim)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--teal-bright)' }}>
              TARGET IMAGE LOCKED - AWAITING IMPRESSION INPUT
            </p>
            <div style={{
              background: 'rgba(74, 155, 155, 0.1)',
              padding: '1rem',
              borderLeft: '3px solid var(--teal-dim)',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: 'var(--warning-amber)' }}>HOW TO PERCEIVE:</strong>
              </p>
              <ol style={{ paddingLeft: '1.2rem', marginBottom: '0' }}>
                <li style={{ marginBottom: '0.5rem' }}>Close your eyes. Take a few slow breaths and relax.</li>
                <li style={{ marginBottom: '0.5rem' }}>Set your intention: "I want to perceive the target image."</li>
                <li style={{ marginBottom: '0.5rem' }}>Wait for impressions — colors, light/dark, textures, shapes, emotions, temperatures, or a general "sense" of the scene.</li>
                <li style={{ marginBottom: '0' }}>Write whatever comes, even if it seems random. Avoid naming specific objects — describe qualities instead (e.g., "blue, cold, vertical lines" not "a building").</li>
              </ol>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            RECORD YOUR IMPRESSIONS:
          </label>
          <textarea
            className="textarea-field"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            placeholder="Examples: 'warm colors... something round... feels peaceful... bright light from above... organic texture...' — raw sensations, not guesses"
          />

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleProceedToSelection}
              disabled={impressions.trim().length < 10}
            >
              Proceed to Selection →
            </button>
          </div>

          {/* Preload images in the background */}
          <div style={{ display: 'none' }}>
            {target.images.map((img, idx) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                onLoad={() => handleImageLoad(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {phase === 'selection' && (
        <div>
          <div style={{
            background: 'var(--paper-aged)',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderLeft: '3px solid var(--olive-dark)'
          }}>
            <strong>Your impressions:</strong>
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{impressions}</p>
          </div>

          <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
            SELECT THE IMAGE THAT MATCHES YOUR IMPRESSIONS:
          </p>

          {!allImagesLoaded && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="coords-display">LOADING IMAGES...</div>
            </div>
          )}

          <div className="image-grid" style={{ opacity: allImagesLoaded ? 1 : 0.3 }}>
            {target.images.map((img, idx) => (
              <div
                key={img.id}
                className="image-option"
                onClick={() => allImagesLoaded && handleSelect(idx)}
                style={{ cursor: allImagesLoaded ? 'pointer' : 'wait' }}
              >
                <img
                  src={img.url}
                  alt={`Option ${idx + 1}`}
                  onLoad={() => handleImageLoad(idx)}
                />
                <div className="image-label">OPTION {idx + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div>
          <div className={`result-box ${selected === target.target_index ? 'result-correct' : 'result-incorrect'}`}>
            <div className="result-title">
              {selected === target.target_index ? '✓ HIT' : '✗ MISS'}
            </div>
            <p>The target was Option {target.target_index + 1}</p>
          </div>

          <div style={{
            background: 'var(--paper-aged)',
            padding: '1rem',
            marginTop: '1rem',
            borderLeft: '3px solid var(--olive-dark)'
          }}>
            <strong>Your impressions were:</strong>
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>{impressions}</p>
          </div>

          <div className="image-grid" style={{ marginTop: '1.5rem' }}>
            {target.images.map((img, idx) => (
              <div
                key={img.id}
                className={`image-option ${
                  idx === target.target_index
                    ? 'correct'
                    : idx === selected
                    ? 'incorrect'
                    : ''
                }`}
                style={{ cursor: 'default' }}
              >
                <img src={img.url} alt={`Option ${idx + 1}`} />
                <div className="image-label">
                  {idx === target.target_index && '★ TARGET '}
                  {idx === selected && idx !== target.target_index && '✗ YOUR SELECTION '}
                  OPTION {idx + 1}
                </div>
              </div>
            ))}
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
