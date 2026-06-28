import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { GPSPosition } from '../types';

const STALE_MS = 3 * 60 * 1000;
const MOVEMENT_THRESHOLD_M = 10;

interface Props {
  active: boolean;
  position: GPSPosition | null;
  distanceToCheckpoint: number | null;
  onHelp: () => void;
}

export function LostMode({ active, position, distanceToCheckpoint, onHelp }: Props) {
  const { t } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const [lastPos, setLastPos] = useState(position);

  useEffect(() => {
    if (!active || !position) return;
    if (!lastPos) { setLastPos(position); return; }

    const dLat = position.lat - lastPos.lat;
    const dLng = position.lng - lastPos.lng;
    const approxMeters = Math.sqrt(dLat * dLat + dLng * dLng) * 111320;

    if (approxMeters > MOVEMENT_THRESHOLD_M) {
      setLastMovedAt(Date.now());
      setLastPos(position);
    }
  }, [position, active]);

  useEffect(() => {
    if (!active) { setShowHelp(false); return; }
    const id = setInterval(() => {
      if (Date.now() - lastMovedAt > STALE_MS) setShowHelp(true);
    }, 10000);
    return () => clearInterval(id);
  }, [active, lastMovedAt]);

  if (!showHelp) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#fff',
        border: '2px solid #f59e0b',
        borderRadius: 16,
        padding: '16px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        textAlign: 'center',
        maxWidth: 320,
        width: '90vw',
      }}
    >
      <p style={{ fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>{t.areYouLost}</p>
      {distanceToCheckpoint !== null && (
        <p style={{ color: '#4b5563', margin: '0 0 6px', fontSize: 14 }}>
          {t.nextCheckpoint(Math.round(distanceToCheckpoint))}
        </p>
      )}
      <p style={{ color: '#4b5563', margin: '0 0 12px', fontSize: 14 }}>{t.lostHelp}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          onClick={() => { setShowHelp(false); setLastMovedAt(Date.now()); }}
          style={{ minHeight: 48, minWidth: 48, padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', fontSize: 16, fontWeight: 600 }}
        >
          {t.imOk}
        </button>
        <button
          onClick={() => { setShowHelp(false); onHelp(); }}
          style={{ minHeight: 48, minWidth: 48, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
        >
          {t.needHelp}
        </button>
      </div>
    </div>
  );
}
