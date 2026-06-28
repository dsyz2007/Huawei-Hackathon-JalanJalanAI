import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoute } from '../hooks/useRoute';
import { getDemoRoute, DEMO_ROUTES, type DemoRouteId } from '../services/demoRouteService';
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

export function HomePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preferShelter, setPreferShelter] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { fetchRoute, loading, error } = useRoute();
  const navigate = useNavigate();

  async function handleGenerate() {
    if (!origin.trim() || !destination.trim()) return;
    const result = await fetchRoute({ origin, destination, language, preferShelter });
    if (result) navigate('/route', { state: { route: result } });
  }

  async function handleDemo(id: DemoRouteId) {
    const result = await getDemoRoute(id, language);
    navigate('/route', { state: { route: result } });
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{t.appName}</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>{t.tagline}</p>

      <label style={labelStyle}>{t.startingFrom}</label>
      <input
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder={t.originPlaceholder}
        style={inputStyle}
      />

      <div style={{ textAlign: 'center', margin: '-6px 0 6px' }}>
        <button
          type="button"
          onClick={() => { setOrigin(destination); setDestination(origin); }}
          aria-label="Swap start and destination"
          style={swapBtnStyle}
        >
          ⇅
        </button>
      </div>

      <label style={labelStyle}>{t.goingTo}</label>
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder={t.destinationPlaceholder}
        style={inputStyle}
      />

      <label style={labelStyle}>{t.language}</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        style={inputStyle}
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 24px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={preferShelter}
          onChange={(e) => setPreferShelter(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <span style={{ fontSize: 15 }}>{t.preferShelter}</span>
      </label>

      {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{t.errorGenerating}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading || !origin.trim() || !destination.trim()}
        style={{
          ...btnStyle('#2563eb'),
          width: '100%',
          opacity: loading || !origin.trim() || !destination.trim() ? 0.5 : 1,
        }}
      >
        {loading ? t.generating : t.generateRoute}
      </button>

      <p style={{ textAlign: 'center', color: '#9ca3af', margin: '24px 0 12px', fontSize: 13 }}>
        {t.tryDemo}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(Object.keys(DEMO_ROUTES) as DemoRouteId[]).map((id) => (
          <button
            key={id}
            onClick={() => handleDemo(id)}
            style={{ ...btnStyle('#f1f5f9'), color: '#374151', fontSize: 14 }}
          >
            {t.demoRoutes[id]}
          </button>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 16,
  marginBottom: 16,
  boxSizing: 'border-box',
  outline: 'none',
};

const swapBtnStyle: React.CSSProperties = {
  minHeight: 40,
  minWidth: 40,
  borderRadius: 20,
  border: '1px solid #d1d5db',
  background: '#fff',
  fontSize: 18,
  cursor: 'pointer',
};

function btnStyle(bg: string): React.CSSProperties {
  return {
    minHeight: 48,
    padding: '14px 20px',
    borderRadius: 10,
    background: bg,
    color: bg === '#2563eb' ? '#fff' : undefined,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
