'use client';

import { useRef, useEffect, useMemo } from 'react';
import './VoiceOrb.css';

export type VoiceOrbStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'user-speaking'
  | 'ai-speaking';

interface VoiceOrbProps {
  status: VoiceOrbStatus;
  volumeLevel: number; // 0-1
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { orb: 80, core: 48 },
  md: { orb: 120, core: 64 },
  lg: { orb: 160, core: 80 },
};

export function VoiceOrb({
  status,
  volumeLevel,
  size = 'md',
  className = ''
}: VoiceOrbProps) {
  const smoothedVolumeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth volume transitions
  useEffect(() => {
    const smoothVolume = () => {
      // Exponential moving average for smooth transitions
      smoothedVolumeRef.current = smoothedVolumeRef.current * 0.7 + volumeLevel * 0.3;

      if (containerRef.current) {
        const smoothed = smoothedVolumeRef.current;
        containerRef.current.style.setProperty('--volume', smoothed.toString());
        containerRef.current.style.setProperty('--volume-scale', (1 + smoothed * 0.4).toString());
        containerRef.current.style.setProperty('--volume-opacity', (0.2 + smoothed * 0.6).toString());
      }

      rafRef.current = requestAnimationFrame(smoothVolume);
    };

    rafRef.current = requestAnimationFrame(smoothVolume);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [volumeLevel]);

  const dimensions = SIZE_MAP[size];

  const statusClass = useMemo(() => {
    switch (status) {
      case 'idle': return 'voice-orb--idle';
      case 'connecting': return 'voice-orb--connecting';
      case 'listening': return 'voice-orb--listening';
      case 'user-speaking': return 'voice-orb--user-speaking';
      case 'ai-speaking': return 'voice-orb--ai-speaking';
      default: return '';
    }
  }, [status]);

  return (
    <div
      ref={containerRef}
      className={`voice-orb ${statusClass} voice-orb--${size} ${className}`}
      style={{
        '--orb-size': `${dimensions.orb}px`,
        '--core-size': `${dimensions.core}px`,
      } as React.CSSProperties}
    >
      {/* Outer pulse ring 1 */}
      <div className="voice-orb__ring voice-orb__ring--1" />

      {/* Outer pulse ring 2 */}
      <div className="voice-orb__ring voice-orb__ring--2" />

      {/* Volume-reactive ripple layer */}
      <div className="voice-orb__ripple" />

      {/* Main orb background */}
      <div className="voice-orb__glow" />

      {/* Core orb */}
      <div className="voice-orb__core">
        {/* Inner gradient layer */}
        <div className="voice-orb__core-inner" />

        {/* Connecting spinner */}
        {status === 'connecting' && (
          <div className="voice-orb__spinner" />
        )}
      </div>
    </div>
  );
}

export default VoiceOrb;
