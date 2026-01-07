'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../components/LanguageProvider';
import './breathing.css';

type BreathingPattern = {
  id: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
};

const PATTERNS: BreathingPattern[] = [
  {
    id: 'calm',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    cycles: 5,
  },
  {
    id: 'box',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4,
  },
  {
    id: '478',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
  },
];

type Phase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';

export default function BreathingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const abortRef = useRef(false);

  const getPatternName = (id: string) => {
    switch (id) {
      case 'calm': return t.breathing.patternCalm;
      case 'box': return t.breathing.patternBox;
      case '478': return t.breathing.pattern478;
      default: return id;
    }
  };

  const getPatternDescription = (id: string) => {
    switch (id) {
      case 'calm': return t.breathing.patternCalmDesc;
      case 'box': return t.breathing.patternBoxDesc;
      case '478': return t.breathing.pattern478Desc;
      default: return '';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return t.breathing.breatheIn;
      case 'hold1': return t.breathing.hold;
      case 'exhale': return t.breathing.breatheOut;
      case 'hold2': return t.breathing.hold;
      case 'complete': return t.breathing.wellDone;
      default: return t.breathing.ready;
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return '#5a9470';
      case 'hold1': return '#c97d52';
      case 'exhale': return '#6b9ac4';
      case 'hold2': return '#c97d52';
      default: return '#5a9470';
    }
  };

  const getAnimationClass = () => {
    switch (phase) {
      case 'inhale': return 'breathing-inhale';
      case 'exhale': return 'breathing-exhale';
      case 'hold1': return 'breathing-hold-expanded';
      case 'hold2': return 'breathing-hold-normal';
      default: return '';
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runPhase = useCallback(async (phaseName: Phase, duration: number): Promise<boolean> => {
    if (duration === 0) return true;
    if (abortRef.current) return false;

    setPhase(phaseName);
    setCountdown(duration);

    for (let i = duration; i > 0; i--) {
      if (abortRef.current) return false;
      await sleep(1000);
      if (abortRef.current) return false;
      setCountdown(i - 1);
    }
    return true;
  }, []);

  const startBreathing = useCallback(async () => {
    abortRef.current = false;
    setIsActive(true);
    setCurrentCycle(0);

    for (let cycle = 0; cycle < selectedPattern.cycles; cycle++) {
      if (abortRef.current) break;
      setCurrentCycle(cycle + 1);

      // Inhale
      const inhaleOk = await runPhase('inhale', selectedPattern.inhale);
      if (!inhaleOk) break;

      // Hold after inhale
      if (selectedPattern.hold1 > 0) {
        const hold1Ok = await runPhase('hold1', selectedPattern.hold1);
        if (!hold1Ok) break;
      }

      // Exhale
      const exhaleOk = await runPhase('exhale', selectedPattern.exhale);
      if (!exhaleOk) break;

      // Hold after exhale
      if (selectedPattern.hold2 > 0) {
        const hold2Ok = await runPhase('hold2', selectedPattern.hold2);
        if (!hold2Ok) break;
      }
    }

    if (!abortRef.current) {
      setPhase('complete');
    }
  }, [selectedPattern, runPhase]);

  const stopBreathing = () => {
    abortRef.current = true;
    setIsActive(false);
    setPhase('idle');
    setCurrentCycle(0);
    setCountdown(0);
  };

  const resetSession = () => {
    stopBreathing();
  };

  return (
    <div className="breathing-container">
      {/* Ambient background */}
      <div className="breathing-ambient-bg">
        <div className="breathing-ambient-orb orb-1"></div>
        <div className="breathing-ambient-orb orb-2"></div>
      </div>

      {/* Exit button */}
      <button
        className="breathing-exit-btn"
        onClick={() => router.push('/')}
        aria-label="Exit breathing"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Header */}
      <div className="breathing-header">
        <h1 className="breathing-title">{t.breathing.title}</h1>
      </div>

      {/* Pattern Selection */}
      {!isActive && phase !== 'complete' && (
        <div className="breathing-pattern-selection">
          <p className="breathing-pattern-label">{t.breathing.choosePattern}</p>
          <div className="breathing-patterns">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`breathing-pattern-card ${selectedPattern.id === pattern.id ? 'selected' : ''}`}
              >
                <span className="pattern-name">{getPatternName(pattern.id)}</span>
                <span className="pattern-description">{getPatternDescription(pattern.id)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breathing Circle */}
      <div className="breathing-circle-container">
        <div
          className={`breathing-circle ${getAnimationClass()}`}
          style={{
            backgroundColor: getPhaseColor(),
            '--phase-duration': `${phase === 'inhale' ? selectedPattern.inhale : phase === 'exhale' ? selectedPattern.exhale : 0}s`,
          } as React.CSSProperties}
        >
          <div className="breathing-circle-inner">
            {isActive && countdown > 0 ? (
              <span className="breathing-countdown" style={{ color: getPhaseColor() }}>
                {countdown}
              </span>
            ) : phase === 'complete' ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={getPhaseColor()} strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={getPhaseColor()} strokeWidth="1.5">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 5.988 17.968 2 12 2z"/>
              </svg>
            )}
          </div>
        </div>

        {/* Phase Text */}
        <p className="breathing-phase-text">{getPhaseText()}</p>

        {/* Cycle Counter */}
        {isActive && (
          <p className="breathing-cycle-counter">
            {t.breathing.cycle} {currentCycle} {t.breathing.of} {selectedPattern.cycles}
          </p>
        )}

        {/* Pattern Info */}
        {!isActive && phase !== 'complete' && (
          <div className="breathing-pattern-info">
            <p>
              {selectedPattern.inhale}{t.breathing.secondsIn}
              {selectedPattern.hold1 > 0 && ` \u2022 ${selectedPattern.hold1}${t.breathing.secondsHold}`}
              {` \u2022 ${selectedPattern.exhale}${t.breathing.secondsOut}`}
              {selectedPattern.hold2 > 0 && ` \u2022 ${selectedPattern.hold2}${t.breathing.secondsHold}`}
            </p>
            <p>{selectedPattern.cycles} {t.breathing.cycles}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="breathing-action-container">
        {phase === 'complete' ? (
          <div className="breathing-complete-section">
            <div className="breathing-complete-message">
              <p className="complete-title">{t.breathing.sessionComplete}</p>
              <p className="complete-subtitle">{t.breathing.greatJob}</p>
            </div>
            <button onClick={resetSession} className="breathing-btn primary">
              {t.breathing.startAnother}
            </button>
          </div>
        ) : isActive ? (
          <button onClick={stopBreathing} className="breathing-btn secondary">
            {t.breathing.stop}
          </button>
        ) : (
          <button onClick={startBreathing} className="breathing-btn primary">
            {t.breathing.begin}
          </button>
        )}
      </div>
    </div>
  );
}
