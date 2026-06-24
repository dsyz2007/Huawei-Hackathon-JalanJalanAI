import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoryCard } from '../components/StoryCard';
import { ProgressTracker } from '../components/ProgressTracker';
import { LostMode } from '../components/LostMode';
import { StepPanel } from '../components/StepPanel';
import { ProactiveHelpPopup } from '../components/ProactiveHelpPopup';
import { useStoryNavigation } from '../hooks/useStoryNavigation';
import { useGPS } from '../hooks/useGPS';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedLandmark } from '../utils/landmarks';
import { haversineDistance } from '../utils/geo';
import type { RouteResponse } from '../types';

const EMERGENCY_CONTACT = '+6598765432';
const NO_MOVEMENT_MS = 60_000;
const WRONG_DIR_THRESHOLD_M = 100;
const SNOOZE_MS = 5 * 60_000;

interface LocationState {
  route: RouteResponse;
  initialStep?: number;
}

function computeDirection(bearing: number, heading: number | null): string {
  if (heading !== null && !isNaN(heading)) {
    const rel = (bearing - heading + 360) % 360;
    if (rel < 45 || rel >= 315) return 'ahead';
    if (rel < 135) return 'right';
    if (rel < 225) return 'behind';
    return 'left';
  }
  if (bearing >= 315 || bearing < 45) return 'north';
  if (bearing < 135) return 'east';
  if (bearing < 225) return 'south';
  return 'west';
}

export function StoryPage() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [panelOpen, setPanelOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState<string | null>(null);
  const lastMovedRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const minDistToCheckpointRef = useRef<number | null>(null);
  const helpSnoozedUntilRef = useRef(0);

  const totalSteps = state?.route?.steps?.length ?? 0;
  const { currentStep, isFirst, isLast, next, previous, goTo, swipeHandlers } =
    useStoryNavigation(totalSteps);

  const step = state?.route?.steps?.[currentStep];
  const checkpointTarget = step
    ? { lat: step.checkpoint.lat, lng: step.checkpoint.lng }
    : undefined;

  const { position, distanceToCheckpoint, bearing, heading } = useGPS(checkpointTarget);
  const autoAdvanced = useRef(false);

  useEffect(() => {
    autoAdvanced.current = false;
    minDistToCheckpointRef.current = null;
  }, [currentStep]);

  useEffect(() => {
    if (
      distanceToCheckpoint !== null &&
      distanceToCheckpoint < 40 &&
      !isLast &&
      !autoAdvanced.current
    ) {
      autoAdvanced.current = true;
      const id = setTimeout(() => next(), 2000);
      return () => clearTimeout(id);
    }
  }, [distanceToCheckpoint, isLast, next]);

  useEffect(() => {
    if (!position || Date.now() < helpSnoozedUntilRef.current) return;
    const { lat, lng } = position;
    const now = Date.now();
    if (!lastMovedRef.current) {
      lastMovedRef.current = { lat, lng, time: now };
      return;
    }
    const dist = haversineDistance(lastMovedRef.current, { lat, lng });
    if (dist > 5) {
      lastMovedRef.current = { lat, lng, time: now };
    } else if (now - lastMovedRef.current.time > NO_MOVEMENT_MS) {
      setHelpMessage(t.noMovementAlert);
      helpSnoozedUntilRef.current = now + SNOOZE_MS;
      lastMovedRef.current = { lat, lng, time: now };
    }
  }, [position, t.noMovementAlert]);

  useEffect(() => {
    if (distanceToCheckpoint === null || Date.now() < helpSnoozedUntilRef.current) return;
    if (minDistToCheckpointRef.current === null || distanceToCheckpoint < minDistToCheckpointRef.current) {
      minDistToCheckpointRef.current = distanceToCheckpoint;
      return;
    }
    if (distanceToCheckpoint > minDistToCheckpointRef.current + WRONG_DIR_THRESHOLD_M) {
      setHelpMessage(t.wrongDirectionAlert);
      helpSnoozedUntilRef.current = Date.now() + SNOOZE_MS;
      minDistToCheckpointRef.current = distanceToCheckpoint;
    }
  }, [distanceToCheckpoint, t.wrongDirectionAlert]);

  if (!state?.route) {
    navigate('/');
    return null;
  }

  const { route } = state;
  const direction =
    bearing !== null && distanceToCheckpoint !== null && distanceToCheckpoint < 40
      ? computeDirection(bearing, heading)
      : null;

  return (
    <div
      style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100dvh', display: 'flex', flexDirection: 'column', userSelect: 'none', touchAction: 'none' }}
      {...swipeHandlers}
    >
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <button
            onClick={() => navigate('/route', { state: { route } })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 15, padding: 0 }}
          >
            {t.routeOverview}
          </button>
          <button
            onClick={() => setPanelOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 20, padding: 0, lineHeight: 1 }}
            aria-label="All steps"
          >
            ☰
          </button>
        </div>
        <ProgressTracker current={currentStep + 1} total={route.steps.length} stepName={getTranslatedLandmark(step?.landmark?.name, t)?.name ?? step?.landmark?.name} />
      </div>

      <div style={{ flex: 1, padding: '8px 16px 24px' }}>
        {step && (
          <StoryCard
            step={step}
            language={language}
            distanceToCheckpoint={distanceToCheckpoint}
            direction={direction}
          />
        )}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 12 }}>
        <button
          onClick={previous}
          disabled={isFirst}
          style={{
            flex: 1,
            padding: '13px',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.4 : 1,
          }}
        >
          {t.previous}
        </button>

        {isLast ? (
          <button
            onClick={() => navigate('/')}
            style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#22c55e', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            {t.arrived}
          </button>
        ) : (
          <button
            onClick={next}
            style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            {t.next}
          </button>
        )}
      </div>

      <LostMode
        active
        position={position}
        distanceToCheckpoint={distanceToCheckpoint}
        onHelp={() => navigate('/route', { state: { route } })}
      />

      {panelOpen && (
        <StepPanel
          steps={route.steps}
          currentStep={currentStep}
          onJump={goTo}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {helpMessage && (
        <ProactiveHelpPopup
          message={helpMessage}
          onDismiss={() => setHelpMessage(null)}
          onCall={() => {
            window.location.href = `tel:${EMERGENCY_CONTACT}`;
            setHelpMessage(null);
          }}
        />
      )}
    </div>
  );
}
