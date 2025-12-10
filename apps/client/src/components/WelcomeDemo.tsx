'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import './WelcomeDemo.css';

// Timeline keyframes synchronized with audio (~25 seconds)
// Adjusted based on actual ElevenLabs audio pacing
const TIMELINE = {
  // "Welcome to Vematcha — your safe space..."
  welcome: { start: 0, end: 3500 },
  // "Using the clinically-proven Flash Technique..."
  flashTechnique: { start: 3500, end: 7500 },
  // "we help you process difficult memories..."
  processing: { start: 7500, end: 11500 },
  // "Simply focus on a peaceful place..."
  peacefulPlace: { start: 11500, end: 14500 },
  // "while we guide you through gentle stimulation..."
  stimulation: { start: 14500, end: 18500 },
  // "Safe. Effective. Gentle."
  safeEffective: { start: 18500, end: 21500 },
  // "Your healing journey starts here."
  journey: { start: 21500, end: 26000 },
};

export default function WelcomeDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Determine which phase we're in
  const getPhase = useCallback((time: number) => {
    if (time < TIMELINE.welcome.end) return 'welcome';
    if (time < TIMELINE.flashTechnique.end) return 'flashTechnique';
    if (time < TIMELINE.processing.end) return 'processing';
    if (time < TIMELINE.peacefulPlace.end) return 'peacefulPlace';
    if (time < TIMELINE.stimulation.end) return 'stimulation';
    if (time < TIMELINE.safeEffective.end) return 'safeEffective';
    return 'journey';
  }, []);

  const phase = getPhase(currentTime);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime * 1000);
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/welcome-demo.mp3');
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setHasEnded(true);
      };
    }

    if (hasEnded) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setHasEnded(false);
    }

    audioRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setHasEnded(false);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="welcome-demo-section">
      <div className="welcome-demo-container">
        {/* Ambient glow */}
        <div className="demo-ambient">
          <div className="demo-glow demo-glow-1" />
          <div className="demo-glow demo-glow-2" />
        </div>

        {/* Device frame */}
        <div className={`demo-device ${isPlaying ? 'playing' : ''} phase-${phase}`}>
          {/* Browser chrome */}
          <div className="demo-chrome">
            <div className="chrome-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="chrome-url">
              <span>vematcha.com/flash-session</span>
            </div>
          </div>

          {/* Screen content */}
          <div className="demo-screen">
            {/* Background orbs */}
            <div className="screen-ambient">
              <div className="screen-orb orb-a" />
              <div className="screen-orb orb-b" />
            </div>

            {/* Phase: Welcome */}
            <div className={`demo-phase phase-welcome ${phase === 'welcome' ? 'active' : ''}`}>
              <div className="phase-content">
                <h3 className="demo-title">Flash Session</h3>
                <p className="demo-tagline">A moment of healing</p>
                <div className="welcome-pulse" />
              </div>
            </div>

            {/* Phase: Flash Technique */}
            <div className={`demo-phase phase-flash ${phase === 'flashTechnique' ? 'active' : ''}`}>
              <div className="phase-content">
                <div className="flash-badge">Clinically Proven</div>
                <h3 className="demo-title-sm">The Flash Technique</h3>
                <p className="demo-text">Developed by Dr. Philip Manfield</p>
              </div>
            </div>

            {/* Phase: Processing */}
            <div className={`demo-phase phase-processing ${phase === 'processing' ? 'active' : ''}`}>
              <div className="phase-content">
                <div className="processing-visual">
                  <div className="memory-block distressing">
                    <span>Difficult Memory</span>
                  </div>
                  <div className="processing-arrow" />
                  <div className="memory-block peaceful">
                    <span>Processed</span>
                  </div>
                </div>
                <p className="demo-text">Without reliving the pain</p>
              </div>
            </div>

            {/* Phase: Peaceful Place */}
            <div className={`demo-phase phase-peaceful ${phase === 'peacefulPlace' ? 'active' : ''}`}>
              <div className="phase-content">
                <div className="peaceful-input">
                  <label>Your peaceful place</label>
                  <div className="input-mock">
                    <span className="typing-text">The beach at sunset...</span>
                    <span className="cursor" />
                  </div>
                </div>
              </div>
            </div>

            {/* Phase: Stimulation */}
            <div className={`demo-phase phase-stim ${phase === 'stimulation' ? 'active' : ''}`}>
              <div className="phase-content">
                <div className="bilateral-demo">
                  <div className="bi-circle bi-left active" />
                  <div className="bi-center">
                    <span>Left</span>
                  </div>
                  <div className="bi-circle bi-right" />
                </div>
                <div className="flash-overlay-demo">
                  <span>FLASH</span>
                </div>
              </div>
            </div>

            {/* Phase: Safe Effective Gentle */}
            <div className={`demo-phase phase-safe ${phase === 'safeEffective' ? 'active' : ''}`}>
              <div className="phase-content">
                <div className="safe-words">
                  <span className="word word-1">Safe</span>
                  <span className="word word-2">Effective</span>
                  <span className="word word-3">Gentle</span>
                </div>
              </div>
            </div>

            {/* Phase: Journey */}
            <div className={`demo-phase phase-journey ${phase === 'journey' || hasEnded ? 'active' : ''}`}>
              <div className="phase-content">
                <div className="journey-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="demo-title-sm">Your healing journey</h3>
                <p className="demo-text">starts here</p>
              </div>
            </div>

            {/* Play overlay */}
            {!isPlaying && !hasEnded && (
              <div className="play-overlay">
                <button className="play-btn" onClick={handlePlay}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Watch Demo</span>
                </button>
              </div>
            )}

            {/* Replay overlay */}
            {hasEnded && (
              <div className="play-overlay replay">
                <button className="play-btn" onClick={handleReplay}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  <span>Watch Again</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {(isPlaying || hasEnded) && (
            <div className="demo-progress">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((currentTime / 26000) * 100, 100)}%` }}
              />
            </div>
          )}

          {/* Pause button */}
          {isPlaying && (
            <button className="pause-overlay-btn" onClick={handlePause}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </button>
          )}
        </div>

        {/* Caption */}
        <p className="demo-caption">
          Experience the Flash Technique in under 30 seconds
        </p>
      </div>
    </section>
  );
}
