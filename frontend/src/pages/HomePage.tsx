import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoute } from '../hooks/useRoute';
import { getDemoRoute, DEMO_ROUTES, type DemoRouteId } from '../services/demoRouteService';
import type { Language } from '../types';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ms', label: 'Melayu' },
  { value: 'ta', label: 'தமிழ்' },
];

export function HomePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [preferShelter, setPreferShelter] = useState(false);
  const { fetchRoute, loading, error } = useRoute();
  const navigate = useNavigate();

  async function handleGenerate() {
    if (!origin.trim() || !destination.trim()) return;
    const result = await fetchRoute({ origin, destination, language, preferShelter });
    if (result) navigate('/route', { state: { route: result, language } });
  }

  async function handleDemo(id: DemoRouteId) {
    const result = await getDemoRoute(id, language);
    navigate('/route', { state: { route: result, language } });
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>JalanJalan AI</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>Simple navigation for everyone</p>

      <label style={labelStyle}>Starting from</label>
      <input
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder="e.g. Bedok MRT"
        style={inputStyle}
      />

      <label style={labelStyle}>Going to</label>
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="e.g. Bedok Interchange"
        style={inputStyle}
      />

      <label style={labelStyle}>Language</label>
      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} style={inputStyle}>
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
        <span style={{ fontSize: 15 }}>Prefer sheltered routes</span>
      </label>

      {error && <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading || !origin.trim() || !destination.trim()}
        style={{
          ...btnStyle('#2563eb'),
          width: '100%',
          opacity: loading || !origin.trim() || !destination.trim() ? 0.5 : 1,
        }}
      >
        {loading ? 'Generating...' : 'Generate Route'}
      </button>

      <p style={{ textAlign: 'center', color: '#9ca3af', margin: '24px 0 12px', fontSize: 13 }}>
        — or try a demo —
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(Object.keys(DEMO_ROUTES) as DemoRouteId[]).map((id) => (
          <button
            key={id}
            onClick={() => handleDemo(id)}
            style={{ ...btnStyle('#f1f5f9'), color: '#374151', fontSize: 14 }}
          >
            {DEMO_ROUTES[id].label}
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

function btnStyle(bg: string): React.CSSProperties {
  return {
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
