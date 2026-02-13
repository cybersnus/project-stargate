import { createContext, useContext, type ReactNode } from 'react';
import { useSound } from '../hooks/useSound';
import { useAmbientSound } from '../hooks/useAmbientSound';

type SoundType = 'click' | 'success' | 'error' | 'reveal' | 'type';

interface SoundContextType {
  // Discrete sound controls
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: SoundType) => void;

  // Ambient sound controls
  ambientEnabled: boolean;
  toggleAmbient: () => void;
  playInterference: () => void;
  playRadioTransmission: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound();
  const ambient = useAmbientSound();

  const value: SoundContextType = {
    soundEnabled: sound.soundEnabled,
    toggleSound: sound.toggleSound,
    playSound: sound.playSound,
    ambientEnabled: ambient.ambientEnabled,
    toggleAmbient: ambient.toggleAmbient,
    playInterference: ambient.playInterference,
    playRadioTransmission: ambient.playRadioTransmission,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}
