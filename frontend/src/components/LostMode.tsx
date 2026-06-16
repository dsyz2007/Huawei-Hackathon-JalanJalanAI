import { useEffect, useState } from 'react';
import { useGPS } from '../hooks/useGPS';

// Triggers if user hasn't moved >10m in 3 minutes while navigation is active
const STALE_MS = 3 * 60 * 1000;
const MOVEMENT_THRESHOLD_M = 10;

interface Props {
  active: boolean;
  checkpointTarget?: { lat: number; lng: number };
  onHelp: () => void;
}

export function LostMode({ active, checkpointTarget, onHelp }: Props) {
  const { position, distanceToCheckpoint } = useGPS(checkpointTarget);
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
      <p style={{ fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>Are you lost?</p>
      {distanceToCheckpoint !== null && (
        <p style={{ color: '#6b7280', margin: '0 0 12px', fontSize: 14 }}>
          Next checkpoint is {Math.round(distanceToCheckpoint)}m away.
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          onClick={() => { setShowHelp(false); setLastMovedAt(Date.now()); }}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff' }}
        >
          I'm OK
        </button>
        <button
          onClick={() => { setShowHelp(false); onHelp(); }}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
        >
          Need Help
        </button>
      </div>
    </div>
  );
}
