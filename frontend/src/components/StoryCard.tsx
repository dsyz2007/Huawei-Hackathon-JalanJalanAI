import { AudioPlayer } from './AudioPlayer';
import type { RouteStep, Language } from '../types';

interface Props {
  step: RouteStep;
  language: Language;
}

export function StoryCard({ step, language }: Props) {
  const { landmark, instruction, checkpoint } = step;

  return (
    <div
      style={{
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        background: '#fff',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {landmark?.imageUrl ? (
        <img
          src={landmark.imageUrl}
          alt={landmark.name}
          style={{ width: '100%', height: 220, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 220,
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 48,
          }}
        >
          📍
        </div>
      )}

      <div style={{ padding: '20px 24px' }}>
        {landmark && (
          <>
            <p style={{ fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>{landmark.name}</p>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 14px' }}>
              {landmark.description}
            </p>
          </>
        )}

        <p
          style={{
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.5,
            margin: '0 0 16px',
            color: '#111827',
          }}
        >
          {instruction?.text ?? checkpoint.action.replace(/_/g, ' ')}
        </p>

        <AudioPlayer
          text={instruction?.audioText ?? instruction?.text ?? checkpoint.action}
          language={language}
        />
      </div>
    </div>
  );
}
