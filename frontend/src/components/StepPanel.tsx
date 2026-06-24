import { useLanguage } from '../context/LanguageContext';
import { getTranslatedLandmark } from '../utils/landmarks';
import type { RouteStep } from '../types';

interface Props {
  steps: RouteStep[];
  currentStep: number;
  onJump: (index: number) => void;
  onClose: () => void;
}

export function StepPanel({ steps, currentStep, onJump, onClose }: Props) {
  const { t } = useLanguage();

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
      />
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 280, background: '#fff', zIndex: 101,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{t.allSteps}</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const actionLabel = t.actions[step.checkpoint.action] ?? step.checkpoint.action;
            const translatedName = getTranslatedLandmark(step.landmark?.name, t)?.name ?? step.landmark?.name;
            return (
              <button
                key={step.checkpoint.id}
                onClick={() => { onJump(i); onClose(); }}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                  gap: 14, padding: '14px 20px', border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  background: isActive ? '#eff6ff' : '#fff',
                  borderLeft: isActive ? '4px solid #2563eb' : '4px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? '#2563eb' : '#e5e7eb',
                  color: isActive ? '#fff' : '#374151',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {translatedName ?? actionLabel}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {actionLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
