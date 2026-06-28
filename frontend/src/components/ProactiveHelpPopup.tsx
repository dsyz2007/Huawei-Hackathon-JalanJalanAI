import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';

interface Props {
  message: string;
  onDismiss: () => void;
  onCall: () => void;
}

// Feature-local labels (kept out of the global i18n dictionary to stay self-contained).
const SHARE_LABEL: Record<Language, string> = {
  english: 'Share My Location',
  singlish: 'Send My Location',
  cantonese: '分享我的位置',
  teochew: '分享我个位置',
  hokkien: '分享我个位置',
  chinese: '分享我的位置',
  malay: 'Kongsi Lokasi Saya',
  tamil: 'எனது இருப்பிடத்தைப் பகிர்',
  hindi: 'मेरा स्थान साझा करें',
};

function shareLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    if (navigator.share) {
      navigator.share({ title: 'My location', text: 'This is where I am:', url }).catch(() => {});
    } else {
      window.open(url, '_blank');
    }
  });
}

export function ProactiveHelpPopup({ message, onDismiss, onCall }: Props) {
  const { t, language } = useLanguage();

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 300,
        }}
      />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff', borderRadius: 20,
          padding: '32px 24px', maxWidth: 340, width: '90%',
          zIndex: 301, textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🆘</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 24px', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onCall}
            style={{
              minHeight: 48, padding: '14px', borderRadius: 12,
              background: '#ef4444', color: '#fff',
              border: 'none', fontSize: 17, fontWeight: 700, cursor: 'pointer',
            }}
          >
            📞 {t.callLovedOne}
          </button>
          <button
            onClick={shareLocation}
            style={{
              minHeight: 48, padding: '14px', borderRadius: 12,
              background: '#2563eb', color: '#fff',
              border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
          >
            📍 {SHARE_LABEL[language]}
          </button>
          <button
            onClick={onDismiss}
            style={{
              minHeight: 48, padding: '14px', borderRadius: 12,
              background: '#f1f5f9', color: '#374151',
              border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.imOk}
          </button>
        </div>
      </div>
    </>
  );
}
