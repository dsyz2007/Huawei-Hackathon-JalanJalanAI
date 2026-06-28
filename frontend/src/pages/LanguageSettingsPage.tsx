import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'singlish', label: 'Singlish' },
  { value: 'cantonese', label: '廣東話' },
  { value: 'teochew', label: '潮州話' },
  { value: 'hokkien', label: '福建話' },
  { value: 'chinese', label: '中文' },
  { value: 'malay', label: 'Melayu' },
  { value: 'tamil', label: 'தமிழ்' },
  { value: 'hindi', label: 'हिन्दी' },
];

export function LanguageSettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ minHeight: 48, background: 'none', border: 'none', color: '#6b7280', fontSize: 15, cursor: 'pointer', padding: '0 8px', marginBottom: 12 }}
      >
        {t.back}
      </button>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 20px' }}>{t.language}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LANGUAGES.map((l) => {
          const active = l.value === language;
          return (
            <button
              key={l.value}
              onClick={() => { setLanguage(l.value); navigate(-1); }}
              style={{
                minHeight: 64, padding: '16px 20px', borderRadius: 14,
                fontSize: 20, fontWeight: 700, textAlign: 'left', cursor: 'pointer',
                background: active ? '#2563eb' : '#fff',
                color: active ? '#fff' : '#111827',
                border: `2px solid ${active ? '#2563eb' : '#e5e7eb'}`,
              }}
            >
              {active ? '✓ ' : ''}{l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
