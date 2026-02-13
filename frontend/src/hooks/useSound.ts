import { useCallback, useEffect, useState } from 'react';

const SOUND_KEY = 'stargate_sound_enabled';

// Sound effect URLs using Web Audio API generated tones
type SoundType = 'click' | 'success' | 'error' | 'reveal' | 'type';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  decay?: boolean;
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  click: { frequency: 220, duration: 0.04, type: 'sine', volume: 0.08, decay: true },
  success: { frequency: 523.25, duration: 0.15, type: 'sine', volume: 0.15, decay: true },
  error: { frequency: 180, duration: 0.2, type: 'sawtooth', volume: 0.12, decay: true },
  reveal: { frequency: 330, duration: 0.25, type: 'sine', volume: 0.12, decay: true },
  type: { frequency: 400, duration: 0.02, type: 'sine', volume: 0.05 },
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(SOUND_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      const config = SOUNDS[type];

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      // Success sound plays a small ascending arpeggio
      if (type === 'success') {
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05); // E5
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
      }

      gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);

      if (config.decay) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
      }

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);
    } catch {
      // Audio not supported or blocked
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playSound,
  };
}
