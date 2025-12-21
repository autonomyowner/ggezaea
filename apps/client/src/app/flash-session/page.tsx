'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useFlashSession } from './hooks/useFlashSession';
import { useFlashSessionVoice } from './hooks/useFlashSessionVoice';
import { VoiceOrb, VoiceOrbStatus } from '@/components/VoiceOrb';
import './flash-session.css';

export default function FlashSessionPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const session = useFlashSession();
  const voice = useFlashSessionVoice();
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/login');
    }
  }, [isSignedIn, isLoaded, router]);

  // Get voice orb status
  const getVoiceOrbStatus = (): VoiceOrbStatus => {
    if (voice.isVoiceConnecting) return 'connecting';
    if (!voice.isVoiceConnected) return 'idle';
    if (voice.assistantSpeaking) return 'ai-speaking';
    if (voice.isSpeaking) return 'user-speaking';
    return 'listening';
  };

  // Prevent scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flash-session-container">
        <div className="flash-loading">
          <div className="loading-orb"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flash-session-container">
      {/* Ambient background */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Mute button - always visible */}
      <button
        className="mute-btn"
        onClick={session.toggleMute}
        aria-label={session.isMuted ? 'Unmute' : 'Mute'}
      >
        {session.isMuted ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        )}
      </button>

      {/* Exit button */}
      <button
        className="exit-btn"
        onClick={() => router.push('/chat')}
        aria-label="Exit session"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Screen content based on state */}
      {session.state === 'INTRO' && (
        <IntroScreen
          session={session}
          voice={voice}
          voiceMode={voiceMode}
          setVoiceMode={setVoiceMode}
        />
      )}

      {session.state === 'SET_ACTIVE' && (
        <SetActiveScreen
          session={session}
          voiceMode={voiceMode}
          getVoiceOrbStatus={getVoiceOrbStatus}
        />
      )}

      {session.state === 'SET_PAUSE' && (
        <SetPauseScreen
          session={session}
          voice={voice}
          voiceMode={voiceMode}
          getVoiceOrbStatus={getVoiceOrbStatus}
        />
      )}

      {session.state === 'CLOSING' && (
        <ClosingScreen
          session={session}
          voice={voice}
          voiceMode={voiceMode}
          getVoiceOrbStatus={getVoiceOrbStatus}
        />
      )}

      {session.state === 'SUMMARY' && (
        <SummaryScreen session={session} onComplete={() => router.push('/chat')} />
      )}
    </div>
  );
}

// ============================================
// INTRO SCREEN
// ============================================
function IntroScreen({
  session,
  voice,
  voiceMode,
  setVoiceMode,
}: {
  session: ReturnType<typeof useFlashSession>;
  voice: ReturnType<typeof useFlashSessionVoice>;
  voiceMode: boolean;
  setVoiceMode: (value: boolean) => void;
}) {
  const canStart = session.data.topic.trim() && session.data.positiveMemory.trim();

  const handleVoiceSetup = async () => {
    setVoiceMode(true);
    await voice.startVoicePhase('setup');
  };

  return (
    <div className="screen intro-screen">
      <div className="intro-content">
        <h1 className="intro-title">Flash Session</h1>
        <p className="intro-subtitle">A moment of healing, guided by your breath</p>

        {/* Voice mode toggle */}
        <div className="voice-mode-toggle">
          <button
            className={`mode-btn ${!voiceMode ? 'active' : ''}`}
            onClick={() => {
              setVoiceMode(false);
              voice.endVoicePhase();
            }}
          >
            Type Mode
          </button>
          <button
            className={`mode-btn ${voiceMode ? 'active' : ''}`}
            onClick={handleVoiceSetup}
            disabled={voice.isVoiceConnecting}
          >
            {voice.isVoiceConnecting ? 'Connecting...' : 'Voice Mode'}
          </button>
        </div>

        {/* Voice Setup UI */}
        {voiceMode && voice.isVoiceConnected && (
          <div className="voice-setup-container">
            <VoiceOrb
              status={
                voice.assistantSpeaking
                  ? 'ai-speaking'
                  : voice.isSpeaking
                  ? 'user-speaking'
                  : 'listening'
              }
              volumeLevel={voice.volumeLevel}
              size="lg"
            />
            <p className="voice-status-text">
              {voice.assistantSpeaking
                ? 'Matcha is speaking...'
                : voice.isSpeaking
                ? 'Listening...'
                : 'Speak to Matcha'}
            </p>
            {voice.transcript.length > 0 && (
              <div className="voice-transcript-preview">
                {voice.transcript.slice(-2).map((entry, idx) => (
                  <p key={idx} className={`transcript-entry ${entry.role.toLowerCase()}`}>
                    <span className="role">{entry.role === 'USER' ? 'You' : 'Matcha'}:</span>{' '}
                    {entry.content}
                  </p>
                ))}
              </div>
            )}
            <button
              className="start-btn voice-start-btn"
              onClick={() => {
                voice.endVoicePhase();
                session.startSession();
              }}
            >
              Start Session Now
            </button>
          </div>
        )}

        {/* Type Mode Form */}
        {!voiceMode && (
          <div className="intro-form">
            <div className="form-group">
              <label className="form-label">What has been weighing on you?</label>
              <p className="form-hint">Just the topic - we won&apos;t go into details</p>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Work stress, a difficult conversation..."
                value={session.data.topic}
                onChange={(e) => session.setTopic(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">How distressed do you feel about this?</label>
              <div className="distress-slider-container">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={session.data.distressStart}
                  onChange={(e) => session.setDistressStart(Number(e.target.value))}
                  className="distress-slider"
                />
                <div className="distress-labels">
                  <span>0 - None</span>
                  <span className="distress-value">{session.data.distressStart}</span>
                  <span>10 - Extreme</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Think of a peaceful memory or safe place</label>
              <p className="form-hint">Somewhere that brings you calm and happiness</p>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., The beach, my grandmother's garden..."
                value={session.data.positiveMemory}
                onChange={(e) => session.setPositiveMemory(e.target.value)}
              />
            </div>

            <div className="intro-instructions">
              <h3>How the Flash Technique works</h3>
              <ul>
                <li>Focus completely on your peaceful place - don&apos;t think about the problem</li>
                <li>Tap your legs slowly - left, right, left, right</li>
                <li>When you see &quot;Flash&quot; - blink 3 times quickly</li>
                <li>We&apos;ll do 5 flashes per set, then check how you feel</li>
                <li>The goal is to reduce distress without having to relive the memory</li>
              </ul>
            </div>

            <button
              className={`start-btn ${canStart && !session.isPreloading ? '' : 'disabled'}`}
              onClick={session.startSession}
              disabled={!canStart || session.isPreloading}
            >
              {session.isPreloading ? 'Loading audio...' : 'Begin Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SET ACTIVE SCREEN - Hands-free tapping
// ============================================
function SetActiveScreen({
  session,
  voiceMode,
  getVoiceOrbStatus,
}: {
  session: ReturnType<typeof useFlashSession>;
  voiceMode: boolean;
  getVoiceOrbStatus: () => VoiceOrbStatus;
}) {
  const progress = Math.min((session.setElapsed / session.setDuration) * 100, 100);

  return (
    <div className="screen set-active-screen">
      {/* Flash overlay - Triple blink cue */}
      {session.blinkActive && (
        <div className="blink-overlay">
          <div className="blink-ripple"></div>
          <div className="blink-text">FLASH</div>
          <div className="flash-counter">Flash {session.blinkCount} of 5</div>
        </div>
      )}

      {/* Set counter */}
      <div className="set-counter">
        Set {session.data.currentSet} of {session.data.totalSets}
      </div>

      {/* Bilateral circles */}
      <div className="bilateral-container">
        <div className={`bilateral-circle left ${session.bilateralSide === 'left' ? 'active' : ''}`}>
          <div className="circle-inner"></div>
          <div className="circle-glow"></div>
        </div>

        <div className="bilateral-center">
          {/* Show VoiceOrb in voice mode, otherwise show text */}
          {voiceMode ? (
            <VoiceOrb
              status={session.isSpeaking ? 'ai-speaking' : 'idle'}
              volumeLevel={0}
              size="sm"
            />
          ) : (
            <div className="breath-text">
              {session.bilateralSide === 'left' ? 'Left' : 'Right'}
            </div>
          )}
        </div>

        <div className={`bilateral-circle right ${session.bilateralSide === 'right' ? 'active' : ''}`}>
          <div className="circle-inner"></div>
          <div className="circle-glow"></div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-time">
          {Math.ceil((session.setDuration - session.setElapsed) / 1000)}s
        </div>
      </div>

      {/* Speaking indicator - only show when not in voice mode */}
      {!voiceMode && session.isSpeaking && (
        <div className="speaking-indicator">
          <div className="speaking-wave"></div>
          <div className="speaking-wave"></div>
          <div className="speaking-wave"></div>
        </div>
      )}

      {/* Emergency exit */}
      <button className="pause-btn" onClick={session.endEarly}>
        I need to stop
      </button>
    </div>
  );
}

// ============================================
// SET PAUSE SCREEN
// ============================================
function SetPauseScreen({
  session,
  voice,
  voiceMode,
  getVoiceOrbStatus,
}: {
  session: ReturnType<typeof useFlashSession>;
  voice: ReturnType<typeof useFlashSessionVoice>;
  voiceMode: boolean;
  getVoiceOrbStatus: () => VoiceOrbStatus;
}) {
  // Start voice check-in when entering pause screen in voice mode
  useEffect(() => {
    if (voiceMode && !voice.isVoiceConnected && !voice.isVoiceConnecting) {
      voice.startVoicePhase('check-in');
    }
    return () => {
      if (voiceMode && voice.isVoiceConnected) {
        voice.endVoicePhase();
      }
    };
  }, []);

  const handleContinue = () => {
    if (voice.isVoiceConnected) {
      voice.endVoicePhase();
    }
    session.continueSet();
  };

  return (
    <div className="screen pause-screen">
      <div className="pause-content">
        {voiceMode && voice.isVoiceConnected ? (
          // Voice check-in UI
          <>
            <VoiceOrb
              status={getVoiceOrbStatus()}
              volumeLevel={voice.volumeLevel}
              size="lg"
            />
            <h2 className="pause-title">Check-in</h2>
            <p className="pause-subtitle">
              Set {session.data.currentSet} of {session.data.totalSets} complete
            </p>
            <p className="voice-status-text">
              {voice.assistantSpeaking
                ? 'Matcha is speaking...'
                : voice.isSpeaking
                ? 'Listening...'
                : 'Share what you noticed'}
            </p>
            {voice.transcript.length > 0 && (
              <div className="voice-transcript-preview">
                {voice.transcript.slice(-2).map((entry, idx) => (
                  <p key={idx} className={`transcript-entry ${entry.role.toLowerCase()}`}>
                    <span className="role">{entry.role === 'USER' ? 'You' : 'Matcha'}:</span>{' '}
                    {entry.content}
                  </p>
                ))}
              </div>
            )}
            <div className="pause-actions">
              <button className="continue-btn" onClick={handleContinue}>
                Continue to Next Set
              </button>
              <button className="end-early-btn" onClick={session.endEarly}>
                End session early
              </button>
            </div>
          </>
        ) : (
          // Text-based pause UI
          <>
            <div className="pause-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>

            <h2 className="pause-title">Take a breath</h2>
            <p className="pause-subtitle">
              Set {session.data.currentSet} of {session.data.totalSets} complete
            </p>

            <p className="pause-prompt">What did you notice during that set?</p>
            <p className="pause-hint">You don&apos;t need to answer - just notice.</p>

            <div className="pause-actions">
              <button className="continue-btn" onClick={session.continueSet}>
                Continue to Next Set
              </button>

              <button className="need-moment-btn" onClick={() => {}}>
                I need a moment
              </button>

              <button className="end-early-btn" onClick={session.endEarly}>
                End session early
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// CLOSING SCREEN
// ============================================
function ClosingScreen({
  session,
  voice,
  voiceMode,
  getVoiceOrbStatus,
}: {
  session: ReturnType<typeof useFlashSession>;
  voice: ReturnType<typeof useFlashSessionVoice>;
  voiceMode: boolean;
  getVoiceOrbStatus: () => VoiceOrbStatus;
}) {
  // Start voice closing when entering in voice mode
  useEffect(() => {
    if (voiceMode && !voice.isVoiceConnected && !voice.isVoiceConnecting) {
      voice.startVoicePhase('closing');
    }
    return () => {
      if (voiceMode && voice.isVoiceConnected) {
        voice.endVoicePhase();
      }
    };
  }, []);

  const handleComplete = () => {
    if (voice.isVoiceConnected) {
      voice.endVoicePhase();
    }
    session.completeSession();
  };

  return (
    <div className="screen closing-screen">
      <div className="closing-content">
        {voiceMode && voice.isVoiceConnected ? (
          // Voice closing UI
          <>
            <VoiceOrb
              status={getVoiceOrbStatus()}
              volumeLevel={voice.volumeLevel}
              size="lg"
            />
            <h2 className="closing-title">Almost done</h2>
            <p className="voice-status-text">
              {voice.assistantSpeaking
                ? 'Matcha is speaking...'
                : voice.isSpeaking
                ? 'Listening...'
                : 'Share how you feel'}
            </p>
            {voice.transcript.length > 0 && (
              <div className="voice-transcript-preview">
                {voice.transcript.slice(-2).map((entry, idx) => (
                  <p key={idx} className={`transcript-entry ${entry.role.toLowerCase()}`}>
                    <span className="role">{entry.role === 'USER' ? 'You' : 'Matcha'}:</span>{' '}
                    {entry.content}
                  </p>
                ))}
              </div>
            )}
            <button className="complete-btn" onClick={handleComplete}>
              Complete Session
            </button>
          </>
        ) : (
          // Text-based closing UI
          <>
            <h2 className="closing-title">Almost done</h2>
            <p className="closing-subtitle">
              Gently bring to mind what was bothering you earlier...
            </p>
            <p className="closing-topic">&quot;{session.data.topic}&quot;</p>

            <div className="closing-question">
              <label className="form-label">How does it feel now?</label>
              <div className="distress-slider-container final">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={session.data.distressEnd ?? session.data.distressStart}
                  onChange={(e) => session.setDistressEnd(Number(e.target.value))}
                  className="distress-slider"
                />
                <div className="distress-labels">
                  <span>0 - None</span>
                  <span className="distress-value">{session.data.distressEnd ?? session.data.distressStart}</span>
                  <span>10 - Extreme</span>
                </div>
              </div>
            </div>

            <button className="complete-btn" onClick={session.completeSession}>
              Complete Session
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUMMARY SCREEN
// ============================================
function SummaryScreen({
  session,
  onComplete
}: {
  session: ReturnType<typeof useFlashSession>;
  onComplete: () => void;
}) {
  const startLevel = session.data.distressStart;
  const endLevel = session.data.distressEnd ?? startLevel;
  const improvement = startLevel - endLevel;
  const duration = session.data.startTime && session.data.endTime
    ? Math.round((session.data.endTime.getTime() - session.data.startTime.getTime()) / 60000)
    : 0;

  return (
    <div className="screen summary-screen">
      <div className="summary-content">
        <div className="summary-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h2 className="summary-title">Session Complete</h2>
        <p className="summary-subtitle">You did wonderful work today</p>

        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-label">Distress Level</div>
            <div className="stat-comparison">
              <span className="stat-start">{startLevel}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              <span className="stat-end">{endLevel}</span>
            </div>
            {improvement > 0 && (
              <div className="stat-improvement">
                {improvement} point{improvement > 1 ? 's' : ''} better
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-label">Duration</div>
            <div className="stat-value">{duration} min</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Sets Completed</div>
            <div className="stat-value">{session.data.currentSet}</div>
          </div>
        </div>

        <div className="summary-reminder">
          <p>Notice how you feel over the next few hours and days.</p>
          <p>You can return anytime you need this space.</p>
        </div>

        <button className="done-btn" onClick={onComplete}>
          Done
        </button>
      </div>
    </div>
  );
}
