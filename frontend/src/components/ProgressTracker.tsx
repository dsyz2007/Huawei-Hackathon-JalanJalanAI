import { useLanguage } from '../context/LanguageContext';

interface Props {
  current: number;
  total: number;
  stepName?: string;
}

export function ProgressTracker({ current, total, stepName }: Props) {
  const { t } = useLanguage();
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ textAlign: 'center', padding: '8px 16px' }}>
      <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 2px' }}>
        {t.stepOf(current, total)}
      </p>
      {stepName && (
        <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 6px' }}>
          {stepName}
        </p>
      )}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        style={{ height: 8, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden' }}
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
