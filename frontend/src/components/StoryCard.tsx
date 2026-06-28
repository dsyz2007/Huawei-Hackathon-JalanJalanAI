import { AudioPlayer } from './AudioPlayer';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedLandmark } from '../utils/landmarks';
import type { RouteStep, Language } from '../types';

function landmarkEmoji(name: string | undefined, action: string): string {
  const n = (name ?? '').toLowerCase();
  if (action === 'exit_mrt' || n.includes('mrt') || n.includes('station')) return '🚇';
  if (n.includes('bus')) return '🚌';
  if (n.includes('atm') || n.includes('bank')) return '🏧';
  if (n.includes('mall') || n.includes('shopping') || n.includes('hub')) return '🏬';
  if (n.includes('clinic') || n.includes('hospital') || n.includes('pharmacy') || n.includes('polyclinic')) return '🏥';
  if (n.includes('post')) return '📮';
  if (n.includes('kopitiam') || n.includes('coffee') || n.includes('cafe') || n.includes('food') || n.includes('hawker')) return '☕';
  if (n.includes('school')) return '🏫';
  if (n.includes('park') || n.includes('garden')) return '🌳';
  if (n.includes('temple') || n.includes('church') || n.includes('mosque')) return '🛕';
  if (action === 'arrive') return '🏁';
  return '📍';
}

interface Props {
  step: RouteStep;
  language: Language;
  distanceToCheckpoint?: number | null;
  direction?: string | null;
}

export function StoryCard({ step, language, distanceToCheckpoint, direction }: Props) {
  const { t } = useLanguage();
  const { landmark, instruction, checkpoint } = step;
  const isNear = distanceToCheckpoint !== null && distanceToCheckpoint !== undefined && distanceToCheckpoint < 40;

  const translatedLandmarkEntry = getTranslatedLandmark(landmark?.name, t);
  const translatedLandmarkName = translatedLandmarkEntry?.name;
  const translatedLandmarkDesc = translatedLandmarkEntry?.description;
  const displayText = t.audioTemplates[checkpoint.action]?.(translatedLandmarkName)
    ?? instruction?.text
    ?? checkpoint.action.replace(/_/g, ' ');
  const audioText = displayText;

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
            background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 55%, #fce7f3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 96,
          }}
        >
          {landmarkEmoji(landmark?.name, checkpoint.action)}
        </div>
      )}

      <div style={{ padding: '20px 24px' }}>
        {distanceToCheckpoint !== null && distanceToCheckpoint !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8, marginBottom: 14,
            background: isNear ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${isNear ? '#bfdbfe' : '#e2e8f0'}`,
          }}>
            <span style={{ fontSize: 15 }}>📍</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: isNear ? '#1d4ed8' : '#374151' }}>
              {t.metersAway(Math.round(distanceToCheckpoint))}
            </span>
            {isNear && direction && (
              <>
                <span style={{ color: '#93c5fd' }}>·</span>
                <span style={{ fontSize: 14, color: '#2563eb' }}>
                  {t.landmarkIs(t.directions[direction] ?? direction)}
                </span>
              </>
            )}
          </div>
        )}

        {landmark && (
          <>
            <p style={{ fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>
              {translatedLandmarkName ?? landmark.name}
            </p>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 14px' }}>
              {translatedLandmarkDesc ?? landmark.description}
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
          {displayText}
        </p>

        <AudioPlayer
          text={audioText}
          language={language}
        />
      </div>
    </div>
  );
}
