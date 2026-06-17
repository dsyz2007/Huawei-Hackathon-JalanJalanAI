import { useLocation, useNavigate } from 'react-router-dom';
import { StoryCard } from '../components/StoryCard';
import { ProgressTracker } from '../components/ProgressTracker';
import { LostMode } from '../components/LostMode';
import { useStoryNavigation } from '../hooks/useStoryNavigation';
import { useLanguage } from '../context/LanguageContext';
import type { RouteResponse } from '../types';

interface LocationState {
  route: RouteResponse;
  initialStep?: number;
}

export function StoryPage() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  if (!state?.route) {
    navigate('/');
    return null;
  }

  const { route } = state;
  const { currentStep, isFirst, isLast, next, previous, swipeHandlers } =
    useStoryNavigation(route.steps.length);

  const step = route.steps[currentStep];
  const checkpointTarget = step
    ? { lat: step.checkpoint.lat, lng: step.checkpoint.lng }
    : undefined;

  return (
    <div
      style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
      {...swipeHandlers}
    >
      <div style={{ padding: '16px 20px 8px' }}>
        <button
          onClick={() => navigate('/route', { state: { route } })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 15, padding: 0, marginBottom: 8 }}
        >
          {t.routeOverview}
        </button>
        <ProgressTracker current={currentStep + 1} total={route.steps.length} />
      </div>

      <div style={{ flex: 1, padding: '8px 16px 24px' }}>
        {step && <StoryCard step={step} language={language} />}
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
        checkpointTarget={checkpointTarget}
        onHelp={() => navigate('/route', { state: { route } })}
      />
    </div>
  );
}
