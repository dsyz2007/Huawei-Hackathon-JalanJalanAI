import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoute } from '../hooks/useRoute';
import { getDemoRoute, DEMO_ROUTES, type DemoRouteId } from '../services/demoRouteService';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';
import { localizedPlaces, resolvePlace } from '../utils/places';

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

const DEMO_COLORS = ['#fef3c7', '#dbeafe', '#dcfce7'];

export function HomePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preferShelter, setPreferShelter] = useState(false);
  const [contact, setContact] = useState(() => localStorage.getItem('nextOfKin') ?? '');
  const { language, t } = useLanguage();
  const { fetchRoute, loading, error } = useRoute();
  const navigate = useNavigate();

  async function handleGenerate() {
    if (!origin.trim() || !destination.trim()) return;
    const result = await fetchRoute({
      origin: resolvePlace(origin),
      destination: resolvePlace(destination),
      language,
      preferShelter,
    });
    if (result) navigate('/route', { state: { route: result } });
  }

  async function handleDemo(id: DemoRouteId) {
    const result = await getDemoRoute(id, language);
    navigate('/route', { state: { route: result } });
  }

  const currentLangLabel = LANGUAGES.find((l) => l.value === language)?.label ?? language;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 40px' }}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🧭 {t.appName}</h1>
        <p style={{ opacity: 0.92, margin: '6px 0 0', fontSize: 15 }}>{t.tagline}</p>
      </div>

      {/* Language selector at the very top */}
      <label style={labelStyle}>{t.language}</label>
      <button
        type="button"
        onClick={() => navigate('/language')}
        style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer', background: '#fff' }}
      >
        🌏 {currentLangLabel} ▸
      </button>

      <datalist id="places">
        {localizedPlaces(language).map((p) => (
          <option key={p.canonical} value={p.value} />
        ))}
      </datalist>

      <label style={labelStyle}>{t.startingFrom}</label>
      <input
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder={t.originPlaceholder}
        list="places"
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
        list="places"
        style={inputStyle}
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 20px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={preferShelter}
          onChange={(e) => setPreferShelter(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <span style={{ fontSize: 15 }}>☂️ {t.preferShelter}</span>
      </label>

      <label style={labelStyle}>📞 {t.callLovedOne}</label>
      <input
        value={contact}
        onChange={(e) => { setContact(e.target.value); localStorage.setItem('nextOfKin', e.target.value); }}
        placeholder="+65 9123 4567"
        inputMode="tel"
        style={inputStyle}
      />

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ color: '#b91c1c', margin: 0, fontSize: 14, fontWeight: 700 }}>{t.errorGenerating}</p>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: 13 }}>
            Try a nearby MRT, mall, or 6-digit postal code — e.g. “Bedok MRT”, “Tampines Mall”, “238801”.
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !origin.trim() || !destination.trim()}
        style={{
          ...btnStyle,
          width: '100%',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: '#fff',
          opacity: loading || !origin.trim() || !destination.trim() ? 0.5 : 1,
        }}
      >
        {loading ? t.generating : `🚶 ${t.generateRoute}`}
      </button>

      <p style={{ textAlign: 'center', color: '#6b7280', margin: '24px 0 12px', fontSize: 13 }}>
        {t.tryDemo}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(Object.keys(DEMO_ROUTES) as DemoRouteId[]).map((id, i) => (
          <button
            key={id}
            onClick={() => handleDemo(id)}
            style={{ ...btnStyle, background: DEMO_COLORS[i % DEMO_COLORS.length], color: '#374151', fontSize: 14 }}
          >
            {t.demoRoutes[id]}
          </button>
        ))}
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #db2777 100%)',
  color: '#fff',
  borderRadius: 16,
  padding: '22px',
  marginBottom: 22,
  boxShadow: '0 6px 20px rgba(37,99,235,0.25)',
};

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

const btnStyle: React.CSSProperties = {
  minHeight: 48,
  padding: '14px 20px',
  borderRadius: 10,
  border: 'none',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};
