import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSoundContext } from '../contexts/SoundContext';
import '../styles/coldwar.css';

export function Layout() {
  const {
    soundEnabled,
    toggleSound,
    playSound,
    ambientEnabled,
    toggleAmbient,
    playInterference,
    playRadioTransmission,
  } = useSoundContext();

  const [isGlitching, setIsGlitching] = useState(false);

  // Random screen glitch every 25-60 seconds
  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    playInterference();
    // Glitch lasts 100-200ms
    setTimeout(() => setIsGlitching(false), 100 + Math.random() * 100);
  }, [playInterference]);

  useEffect(() => {
    const scheduleNextGlitch = () => {
      const delay = 25000 + Math.random() * 35000; // 25-60 seconds
      return setTimeout(() => {
        triggerGlitch();
        scheduleNextGlitch();
      }, delay);
    };

    const timeoutId = scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, [triggerGlitch]);

  // Random Russian radio transmission every 30-60 seconds
  useEffect(() => {
    const scheduleNextTransmission = () => {
      const delay = 30000 + Math.random() * 30000; // 30-60 seconds
      return setTimeout(() => {
        playRadioTransmission();
        scheduleNextTransmission();
      }, delay);
    };

    const timeoutId = scheduleNextTransmission();
    return () => clearTimeout(timeoutId);
  }, [playRadioTransmission]);

  const handleNavClick = () => {
    playSound('click');
  };

  const handleSoundToggle = () => {
    playSound('click');
    toggleSound();
  };

  const handleAmbientToggle = () => {
    playSound('click');
    toggleAmbient();
  };

  return (
    <div className={`paper-container screen-flicker ${isGlitching ? 'glitch-active' : ''}`}>
      {/* Visual effect overlays */}
      <div className="vignette-overlay" />
      <div className="noise-overlay" />
      <div className="crt-overlay" />
      <div className="vhs-distortion" />
      {isGlitching && <div className="glitch-overlay" />}

      <div className="layout">
        <header className="header">
          <div className="sound-controls">
            <button
              className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
              onClick={handleSoundToggle}
              title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              className={`sound-toggle ${ambientEnabled ? 'active' : ''}`}
              onClick={handleAmbientToggle}
              title={ambientEnabled ? 'Disable ambient static' : 'Enable ambient static'}
            >
              {ambientEnabled ? '📻' : '📴'}
            </button>
          </div>
          <h1 className="header-title">
            PROJECT STARGATE
          </h1>
          <p className="header-subtitle">
            PSYCHIC INTELLIGENCE TRAINING SYSTEM // FREQ: 7.83 Hz
          </p>
        </header>

        <nav className="nav-tabs">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            [ BRIEFING ]
          </NavLink>
          <NavLink
            to="/training"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            [ TRAINING ]
          </NavLink>
          <NavLink
            to="/statistics"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            [ ANALYSIS ]
          </NavLink>
        </nav>

        <main className="dossier">
          <Outlet />
        </main>

        <footer className="footer">
          <p>CLASSIFICATION: <span className="redacted">████</span> // DISTRIBUTION: EYES ONLY // TERMINAL ID: SG-7734</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>UNAUTHORIZED ACCESS WILL BE PROSECUTED</p>
        </footer>
      </div>
    </div>
  );
}
