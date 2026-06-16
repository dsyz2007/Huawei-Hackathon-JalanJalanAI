interface Props {
  current: number;
  total: number;
}

export function ProgressTracker({ current, total }: Props) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ textAlign: 'center', padding: '8px 16px' }}>
      <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px' }}>
        Step {current} of {total}
      </p>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        style={{
          height: 8,
          borderRadius: 4,
          background: '#e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: '#2563eb',
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
