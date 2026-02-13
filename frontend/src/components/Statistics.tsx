import { useStats } from '../hooks/useStats';

export function Statistics() {
  const { stats, getHitRate, getAverageRating, getZScore, clearStats } = useStats();

  const shapeHitRate = getHitRate('shape');
  const imageHitRate = getHitRate('image');
  const avgLocationRating = getAverageRating();
  const shapeZScore = getZScore('shape');
  const imageZScore = getZScore('image');

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatComparison = (observed: number, expected: number): { text: string; className: string } => {
    const diff = observed - expected;
    const diffPercent = (diff * 100).toFixed(1);
    if (diff > 0) {
      return { text: `+${diffPercent}% above chance`, className: 'stat-positive' };
    } else if (diff < 0) {
      return { text: `${diffPercent}% below chance`, className: 'stat-negative' };
    }
    return { text: 'At chance level', className: '' };
  };

  const getSignificanceText = (zScore: number, n: number): string => {
    if (n < 10) return 'Need more trials (min 10)';
    if (n < 30) return 'Preliminary data (need 30+ trials)';

    const absZ = Math.abs(zScore);
    if (absZ >= 2.576) return 'Highly significant (p < 0.01)';
    if (absZ >= 1.96) return 'Significant (p < 0.05)';
    if (absZ >= 1.645) return 'Marginally significant (p < 0.10)';
    return 'Not statistically significant';
  };

  const totalTrials = stats.shape.total + stats.image.total + stats.location.total;

  return (
    <div>
      <h2 className="section-header">
        <span className="soviet-star">★</span> Performance Analysis
      </h2>

      {totalTrials === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'var(--paper-aged)',
          border: '2px dashed var(--typewriter-gray)'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>NO DATA RECORDED</p>
          <p style={{ color: 'var(--typewriter-gray)' }}>
            Complete training sessions to see your statistics here.
          </p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalTrials}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.shape.total}</div>
              <div className="stat-label">Shape Trials</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.image.total}</div>
              <div className="stat-label">Image Trials</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.location.total}</div>
              <div className="stat-label">Location Trials</div>
            </div>
          </div>

          {/* Shape Mode Stats */}
          {stats.shape.total > 0 && (
            <div style={{
              background: 'var(--paper-aged)',
              padding: '1.5rem',
              marginTop: '2rem',
              border: '2px solid var(--ink-black)'
            }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--ink-black)', paddingBottom: '0.5rem' }}>
                SHAPE PROTOCOL ANALYSIS
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Hit Rate</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {formatPercent(shapeHitRate)}
                  </div>
                  <div className={formatComparison(shapeHitRate, 0.2).className} style={{ fontSize: '0.85rem' }}>
                    {formatComparison(shapeHitRate, 0.2).text}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Hits / Trials</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {stats.shape.correct} / {stats.shape.total}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Z-Score</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {stats.shape.total >= 10 ? shapeZScore.toFixed(2) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>
                    {getSignificanceText(shapeZScore, stats.shape.total)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Performance vs Chance (20%)
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(shapeHitRate * 100, 100)}%` }}
                  />
                  <div className="progress-chance" style={{ left: '20%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Image Mode Stats */}
          {stats.image.total > 0 && (
            <div style={{
              background: 'var(--paper-aged)',
              padding: '1.5rem',
              marginTop: '1.5rem',
              border: '2px solid var(--ink-black)'
            }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--ink-black)', paddingBottom: '0.5rem' }}>
                IMAGE PROTOCOL ANALYSIS
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Hit Rate</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {formatPercent(imageHitRate)}
                  </div>
                  <div className={formatComparison(imageHitRate, 0.25).className} style={{ fontSize: '0.85rem' }}>
                    {formatComparison(imageHitRate, 0.25).text}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Hits / Trials</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {stats.image.correct} / {stats.image.total}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Z-Score</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {stats.image.total >= 10 ? imageZScore.toFixed(2) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>
                    {getSignificanceText(imageZScore, stats.image.total)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Performance vs Chance (25%)
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(imageHitRate * 100, 100)}%` }}
                  />
                  <div className="progress-chance" style={{ left: '25%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Location Mode Stats */}
          {stats.location.total > 0 && (
            <div style={{
              background: 'var(--paper-aged)',
              padding: '1.5rem',
              marginTop: '1.5rem',
              border: '2px solid var(--ink-black)'
            }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--ink-black)', paddingBottom: '0.5rem' }}>
                COORDINATE PROTOCOL ANALYSIS
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Average Rating</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {avgLocationRating.toFixed(2)} / 5
                  </div>
                  <div className={avgLocationRating >= 3 ? 'stat-positive' : 'stat-negative'} style={{ fontSize: '0.85rem' }}>
                    {avgLocationRating >= 3 ? 'Above middle rating' : 'Below middle rating'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Total Sessions</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-terminal)' }}>
                    {stats.location.total}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--typewriter-gray)' }}>Rating Distribution</div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {[5, 4, 3, 2, 1].map(r => {
                      const count = stats.location.history.filter(h => h.rating === r).length;
                      return (
                        <div key={r} style={{ display: 'flex', gap: '0.5rem' }}>
                          <span>{r}★:</span>
                          <span>{count} ({stats.location.total > 0 ? ((count / stats.location.total) * 100).toFixed(0) : 0}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistical Interpretation */}
          <div style={{
            background: 'var(--ink-black)',
            color: 'var(--green-terminal)',
            padding: '1.5rem',
            marginTop: '2rem',
            fontFamily: 'var(--font-terminal)',
            fontSize: '0.9rem'
          }}>
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--green-terminal)', paddingBottom: '0.5rem' }}>
              STATISTICAL INTERPRETATION GUIDE
            </h4>
            <p style={{ marginBottom: '0.5rem' }}>
              Z-SCORE THRESHOLDS:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>|z| {'>'} 1.96: Statistically significant (p {'<'} 0.05)</li>
              <li>|z| {'>'} 2.576: Highly significant (p {'<'} 0.01)</li>
            </ul>
            <p style={{ marginBottom: '0.5rem' }}>
              INTERPRETATION:
            </p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Positive z-score = performing above chance</li>
              <li>Negative z-score = performing below chance</li>
              <li>Significance doesn't prove causation</li>
              <li>Minimum 30 trials recommended for reliable analysis</li>
            </ul>
          </div>

          {/* Clear Data */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all statistics? This cannot be undone.')) {
                  clearStats();
                }
              }}
            >
              Clear All Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}
