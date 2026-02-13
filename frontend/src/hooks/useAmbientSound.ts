import { useCallback, useEffect, useRef, useState } from 'react';

let audioContext: AudioContext | null = null;
let userHasInteracted = false;

// Track user interaction globally
if (typeof document !== 'undefined') {
  const markInteracted = () => {
    userHasInteracted = true;
    document.removeEventListener('click', markInteracted);
    document.removeEventListener('keydown', markInteracted);
    document.removeEventListener('touchstart', markInteracted);
  };
  document.addEventListener('click', markInteracted);
  document.addEventListener('keydown', markInteracted);
  document.addEventListener('touchstart', markInteracted);
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Generate pink noise buffer (softer than white noise)
function createPinkNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const output = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }

  return buffer;
}

// Generate crackle/pop sounds
function createCrackleBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    if (Math.random() > 0.9995) {
      const popLength = Math.floor(Math.random() * 80) + 20;
      const intensity = 0.3 + Math.random() * 0.4;
      for (let j = 0; j < popLength && i + j < bufferSize; j++) {
        output[i + j] = (Math.random() * 2 - 1) * intensity * (1 - j / popLength);
      }
    }
  }

  return buffer;
}

export function useAmbientSound() {
  const [ambientEnabled, setAmbientEnabled] = useState(true);

  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const crackleSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const crackleGainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const audioBufferCache = useRef<Map<string, AudioBuffer>>(new Map());

  const stopAmbient = useCallback(() => {
    try {
      noiseSourceRef.current?.stop();
      noiseSourceRef.current?.disconnect();
      crackleSourceRef.current?.stop();
      crackleSourceRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
      crackleGainRef.current?.disconnect();
    } catch { /* ignore */ }

    noiseSourceRef.current = null;
    crackleSourceRef.current = null;
    gainNodeRef.current = null;
    crackleGainRef.current = null;
    isPlayingRef.current = false;
  }, []);

  const startAmbient = useCallback(async () => {
    if (isPlayingRef.current) return;

    const ctx = getAudioContext();

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch { /* ignore */ }

    if (ctx.state !== 'running') return;

    try {
      // Main noise
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.025, ctx.currentTime);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      const noiseBuffer = createPinkNoiseBuffer(ctx, 10);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.setValueAtTime(3000, ctx.currentTime);

      noiseSource.connect(lowPass);
      lowPass.connect(gainNode);
      noiseSource.start();
      noiseSourceRef.current = noiseSource;

      // Crackle layer
      const crackleBuffer = createCrackleBuffer(ctx, 10);
      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.08, ctx.currentTime);
      crackleSource.connect(crackleGain);
      crackleGain.connect(ctx.destination);
      crackleSource.start();
      crackleSourceRef.current = crackleSource;
      crackleGainRef.current = crackleGain;

      isPlayingRef.current = true;
    } catch { /* ignore */ }
  }, []);

  const toggleAmbient = useCallback(() => {
    setAmbientEnabled(prev => !prev);
  }, []);

  // Start/stop based on enabled state
  useEffect(() => {
    if (ambientEnabled && userHasInteracted) {
      startAmbient();
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
  }, [ambientEnabled, startAmbient, stopAmbient]);

  // Listen for first interaction to start audio
  useEffect(() => {
    if (!ambientEnabled) return;

    const tryStart = () => {
      if (userHasInteracted && ambientEnabled && !isPlayingRef.current) {
        startAmbient();
      }
    };

    document.addEventListener('click', tryStart);
    document.addEventListener('keydown', tryStart);
    document.addEventListener('touchstart', tryStart);

    // Also try immediately in case user already interacted
    tryStart();

    return () => {
      document.removeEventListener('click', tryStart);
      document.removeEventListener('keydown', tryStart);
      document.removeEventListener('touchstart', tryStart);
    };
  }, [ambientEnabled, startAmbient]);

  const playInterference = useCallback(() => {
    if (!ambientEnabled) return;

    try {
      const ctx = getAudioContext();
      const duration = 0.1 + Math.random() * 0.15;

      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500 + Math.random() * 2500, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch { /* ignore */ }
  }, [ambientEnabled]);

  // Numbers station clips
  const numbersStationClips = [
    { url: '/audio/poacher.ogg', duration: 12 },
    { url: '/audio/cuban_hm01.ogg', duration: 53 },
    { url: '/audio/gong_station.ogg', duration: 120 },
    { url: '/audio/russian_man.ogg', duration: 32 },
  ];

  const playRadioTransmission = useCallback(async () => {
    if (!ambientEnabled) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();

      const clip = numbersStationClips[Math.floor(Math.random() * numbersStationClips.length)];

      let audioBuffer = audioBufferCache.current.get(clip.url);
      if (!audioBuffer) {
        const response = await fetch(clip.url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCache.current.set(clip.url, audioBuffer);
      }

      const segmentDuration = 2 + Math.random() * 2;
      const maxStart = Math.max(0, audioBuffer.duration - segmentDuration);
      const startTime = Math.random() * maxStart;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gainNode.gain.setValueAtTime(0.4, now + segmentDuration - 0.2);
      gainNode.gain.linearRampToValueAtTime(0, now + segmentDuration);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(now, startTime, segmentDuration);
    } catch { /* ignore */ }
  }, [ambientEnabled]);

  return {
    ambientEnabled,
    toggleAmbient,
    startAmbient,
    stopAmbient,
    playInterference,
    playRadioTransmission,
  };
}
