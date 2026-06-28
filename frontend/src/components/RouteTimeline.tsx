import { useLanguage } from '../context/LanguageContext';
import { getTranslatedLandmark } from '../utils/landmarks';
import type { RouteStep } from '../types';

interface Props {
  steps: RouteStep[];
  currentStep: number;
  onSelectStep: (index: number) => void;
}

export function RouteTimeline({ steps, currentStep, onSelectStep }: Props) {
  const { t } = useLanguage();

  return (
    <div style={{ padding: '8px 0' }}>
      {steps.map((step, i) => {
        const isCurrent = i === currentStep;
        const isDone = i < currentStep;
        return (
          <button
            key={step.step}
            onClick={() => onSelectStep(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 16px',
              background: isCurrent ? '#eff6ff' : 'transparent',
              border: 'none',
              borderLeft: isCurrent ? '4px solid #2563eb' : '4px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: isDone ? '#22c55e' : isCurrent ? '#2563eb' : '#e5e7eb',
                color: isDone || isCurrent ? '#fff' : '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {isDone ? '✓' : i + 1}
            </span>
            <span>
              <span style={{ fontWeight: 600, display: 'block' }}>
                {t.actions[step.checkpoint.action] ?? step.checkpoint.action}
              </span>
              {step.landmark && (
                <span style={{ fontSize: 13, color: '#4b5563' }}>
                  {getTranslatedLandmark(step.landmark.name, t)?.name ?? step.landmark.name}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
