import { useLocation, useNavigate } from 'react-router-dom';
import { ProgressTracker } from '../components/ProgressTracker';
import { RouteTimeline } from '../components/RouteTimeline';
import { useStoryNavigation } from '../hooks/useStoryNavigation';
import { useLanguage } from '../context/LanguageContext';
import type { RouteResponse } from '../types';

interface LocationState {
  route: RouteResponse;
}

export function RoutePage() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  if (!state?.route) {
    navigate('/');
    return null;
  }

  const { route } = state;
  const { currentStep, goTo } = useStoryNavigation(route.steps.length);

  function startNavigation() {
    navigate('/story', { state: { route, initialStep: currentStep } });
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif', paddingBottom: 100 }}>
      <div style={{ padding: '20px 20px 0' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 15, padding: 0, marginBottom: 12 }}
        >
          {t.back}
        </button>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>{t.yourRoute}</h2>
        <p style={{ color: '#6b7280', margin: '0 0 16px', fontSize: 14 }}>
          {route.distance} · {route.duration}
        </p>
        <ProgressTracker current={currentStep + 1} total={route.steps.length} />
      </div>

      <RouteTimeline
        steps={route.steps}
        currentStep={currentStep}
        onSelectStep={goTo}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          padding: '16px 20px',
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <button
          onClick={startNavigation}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t.startNavigation}
        </button>
      </div>
    </div>
  );
}
