import { useSpeech } from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';

interface Props {
  text: string;
  language: Language;
}

export function AudioPlayer({ text, language }: Props) {
  const { speaking, paused, voiceUnavailable, speak, pause, resume, stop } = useSpeech();
  const { t } = useLanguage();

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {!speaking ? (
          <button onClick={() => speak(text, language)} style={btnStyle('#2563eb')}>
            ▶ {t.play}
          </button>
        ) : paused ? (
          <button onClick={resume} style={btnStyle('#2563eb')}>
            ▶ {t.resume}
          </button>
        ) : (
          <button onClick={pause} style={btnStyle('#f59e0b')}>
            ⏸ {t.pause}
          </button>
        )}
        {speaking && (
          <button onClick={stop} style={btnStyle('#ef4444')}>
            ■ {t.stop}
          </button>
        )}
      </div>
      {voiceUnavailable && (
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.5 }}>
          ⚠️ {t.voiceNotAvailable}
        </p>
      )}
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '10px 20px',
    borderRadius: 8,
    background: bg,
    color: '#fff',
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
