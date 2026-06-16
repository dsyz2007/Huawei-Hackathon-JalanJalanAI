import type { RouteStep } from '../types';

const ACTION_LABELS: Record<string, string> = {
  exit_mrt: 'Exit MRT',
  turn_left: 'Turn Left',
  turn_right: 'Turn Right',
  go_straight: 'Go Straight',
  cross_road: 'Cross Road',
  arrive: 'Arrive',
};

interface Props {
  steps: RouteStep[];
  currentStep: number;
  onSelectStep: (index: number) => void;
}

export function RouteTimeline({ steps, currentStep, onSelectStep }: Props) {
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
                color: isDone || isCurrent ? '#fff' : '#6b7280',
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
                {ACTION_LABELS[step.checkpoint.action] ?? step.checkpoint.action}
              </span>
              {step.landmark && (
                <span style={{ fontSize: 13, color: '#6b7280' }}>{step.landmark.name}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
