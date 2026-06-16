import { useLocation, useNavigate } from 'react-router-dom';
import { StoryCard } from '../components/StoryCard';
import { ProgressTracker } from '../components/ProgressTracker';
import { LostMode } from '../components/LostMode';
import { useStoryNavigation } from '../hooks/useStoryNavigation';
import type { RouteResponse, Language } from '../types';

interface LocationState {
  route: RouteResponse;
  language: Language;
  initialStep?: number;
}

export function StoryPage() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();

  if (!state?.route) {
    navigate('/');
    return null;
  }

  const { route, language } = state;
  const { currentStep, isFirst, isLast, next, previous, swipeHandlers } =
    useStoryNavigation(route.steps.length);

  const step = route.steps[currentStep];
  const checkpointTarget = step
    ? { lat: step.checkpoint.lat, lng: step.checkpoint.lng }
    : undefined;

  function handleFinish() {
    navigate('/');
  }

  return (
    <div
      style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
      {...swipeHandlers}
    >
      <div style={{ padding: '16px 20px 8px' }}>
        <button
          onClick={() => navigate('/route', { state: { route, language } })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 15, padding: 0, marginBottom: 8 }}
        >
          ← Route Overview
        </button>
        <ProgressTracker current={currentStep + 1} total={route.steps.length} />
      </div>

      <div style={{ flex: 1, padding: '8px 16px 24px' }}>
        {step && <StoryCard step={step} language={language} />}
      </div>

      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: 12,
        }}
      >
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
          ← Previous
        </button>

        {isLast ? (
          <button
            onClick={handleFinish}
            style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#22c55e', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            Arrived!
          </button>
        ) : (
          <button
            onClick={next}
            style={{ flex: 1, padding: '13px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            Next →
          </button>
        )}
      </div>

      <LostMode
        active
        checkpointTarget={checkpointTarget}
        onHelp={() => alert('Please call a helper or ask someone nearby for assistance.')}
      />
    </div>
  );
}
