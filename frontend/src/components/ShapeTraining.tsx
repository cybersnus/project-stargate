import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShapeTarget } from '../types';
import { useStats } from '../hooks/useStats';
import { useSoundContext } from '../contexts/SoundContext';

const SHAPE_SYMBOLS: Record<string, string> = {
  circle: '◯',
  square: '◻',
  star: '★',
  waves: '≋',
  cross: '✚'
};

import { API_BASE } from '../config';

type Phase = 'impression' | 'selection' | 'result';

export function ShapeTraining() {
  const navigate = useNavigate();
  const { recordResult } = useStats();
  const { playSound } = useSoundContext();
  const [target, setTarget] = useState<ShapeTarget | null>(null);
  const [phase, setPhase] = useState<Phase>('impression');
  const [impressions, setImpressions] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTarget = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/targets/shape`);
      if (!response.ok) throw new Error('Failed to fetch target');
      const data = await response.json();
      setTarget(data);
      setPhase('impression');
      setImpressions('');
      setSelected(null);
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarget();
  }, []);

  const handleProceedToSelection = () => {
    playSound('click');
    setPhase('selection');
  };

  const handleSelect = (shape: string) => {
    if (phase !== 'selection' || !target) return;
    setSelected(shape);
    const correct = shape === target.target;

    playSound(correct ? 'success' : 'error');

    recordResult({
      mode: 'shape',
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-header" style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>
          <span className="soviet-star">★</span> Shape Protocol
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
              TARGET LOCKED - AWAITING IMPRESSION INPUT
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
                <li style={{ marginBottom: '0.5rem' }}>Close your eyes and take a slow breath. Let your mind settle.</li>
                <li style={{ marginBottom: '0.5rem' }}>Hold the intention: "I want to perceive the target shape."</li>
                <li style={{ marginBottom: '0.5rem' }}>Notice what comes — flashes of lines, curves, angles, or just a feeling (sharp, soft, balanced, dynamic).</li>
                <li style={{ marginBottom: '0' }}>Don't analyze or guess. Just describe the raw impressions, even if they seem vague or random.</li>
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
            placeholder="Examples: 'curved edges... feels soft... something pointing upward... sense of movement...' — describe sensations, not guesses"
          />

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleProceedToSelection}
              disabled={impressions.trim().length < 5}
            >
              Proceed to Selection →
            </button>
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
            SELECT THE SHAPE THAT MATCHES YOUR IMPRESSIONS:
          </p>

          <div className="options-grid">
            {target.options.map((shape) => (
              <div
                key={shape}
                className="option-card"
                onClick={() => handleSelect(shape)}
              >
                <div className="shape-icon">{SHAPE_SYMBOLS[shape]}</div>
                <div style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{shape}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div>
          <div className={`result-box ${selected === target.target ? 'result-correct' : 'result-incorrect'}`}>
            <div className="result-title">
              {selected === target.target ? '✓ HIT' : '✗ MISS'}
            </div>
            <p>
              Target was: <strong style={{ fontSize: '2rem' }}>{SHAPE_SYMBOLS[target.target]}</strong>{' '}
              <span style={{ textTransform: 'uppercase' }}>{target.target}</span>
            </p>
            {selected !== target.target && (
              <p style={{ marginTop: '0.5rem' }}>
                You selected: {SHAPE_SYMBOLS[selected!]} {selected}
              </p>
            )}
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
