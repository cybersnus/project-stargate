import { useNavigate } from 'react-router-dom';

export function TrainingSelector() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="section-header">
        <span className="soviet-star">★</span> Select Training Protocol
      </h2>

      <p style={{ marginBottom: '1.5rem' }}>
        Select a training mode below. Each mode tests different aspects of remote viewing perception.
        Record your impressions before revealing the target to maintain proper protocol.
      </p>

      <div className="mode-selector">
        <div className="mode-card" onClick={() => navigate('/training/shape')}>
          <div className="mode-icon">◯ ◻ ★</div>
          <div className="mode-title">Shape Protocol</div>
          <div className="mode-description">
            Classic Zener card format. Identify one of five geometric shapes.
            Good for beginners.
          </div>
          <div className="mode-chance">CHANCE: 20% (1 in 5)</div>
        </div>

        <div className="mode-card" onClick={() => navigate('/training/image')}>
          <div className="mode-icon">🖼️</div>
          <div className="mode-title">Image Protocol</div>
          <div className="mode-description">
            Four random images. Describe impressions, then select the target.
          </div>
          <div className="mode-chance">CHANCE: 25% (1 in 4)</div>
        </div>

        <div className="mode-card" onClick={() => navigate('/training/location')}>
          <div className="mode-icon">🌍</div>
          <div className="mode-title">Coordinate Protocol</div>
          <div className="mode-description">
            True to Stargate origins. Given coordinates, describe the location.
            Self-rated accuracy.
          </div>
          <div className="mode-chance">RATING: 1-5 SCALE</div>
        </div>
      </div>

      <div style={{
        background: 'var(--paper-aged)',
        padding: '1rem',
        border: '1px dashed var(--typewriter-gray)',
        marginTop: '2rem'
      }}>
        <h4 style={{ marginBottom: '0.5rem' }}>PROTOCOL REMINDER</h4>
        <ol style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
          <li>Clear your mind before each session</li>
          <li>Record your first impressions - shapes, colors, textures, feelings</li>
          <li>Avoid naming or identifying - describe only</li>
          <li>Trust your initial impressions over analytical thoughts</li>
          <li>Review results only after making your selection</li>
        </ol>
      </div>
    </div>
  );
}
