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
  const { t } = useLanguage();

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
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ padding: '20px 20px 0' }}>
        <button
          onClick={() => navigate('/')}
          style={{ minHeight: 48, minWidth: 48, background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: 15, padding: '0 8px', marginBottom: 12 }}
        >
          {t.back}
        </button>
        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #db2777 100%)', color: '#fff', borderRadius: 16, padding: '18px 20px', margin: '0 0 16px', boxShadow: '0 6px 20px rgba(37,99,235,0.25)' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{t.yourRoute}</h2>
          <p style={{ opacity: 0.92, margin: '6px 0 0', fontSize: 14 }}>
            {route.distance} · {route.duration} · {route.steps.length} 📍
          </p>
        </div>
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
            minHeight: 48,
            padding: '14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
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
