import { useSpeech } from '../hooks/useSpeech';
import type { Language } from '../types';

interface Props {
  text: string;
  language: Language;
}

export function AudioPlayer({ text, language }: Props) {
  const { speaking, paused, speak, pause, resume, stop } = useSpeech();

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: '12px 0' }}>
      {!speaking ? (
        <button onClick={() => speak(text, language)} style={btnStyle('#2563eb')}>
          ▶ Play
        </button>
      ) : paused ? (
        <button onClick={resume} style={btnStyle('#2563eb')}>
          ▶ Resume
        </button>
      ) : (
        <button onClick={pause} style={btnStyle('#f59e0b')}>
          ⏸ Pause
        </button>
      )}
      {speaking && (
        <button onClick={stop} style={btnStyle('#ef4444')}>
          ■ Stop
        </button>
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
