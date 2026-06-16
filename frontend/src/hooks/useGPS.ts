import { useState, useEffect, useRef } from 'react';
import type { GPSPosition } from '../types';

function haversineDistance(a: GPSPosition, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

export function useGPS(checkpointTarget?: { lat: number; lng: number }) {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distanceToCheckpoint, setDistanceToCheckpoint] = useState<number | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const gps: GPSPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setPosition(gps);
        setError(null);
        if (checkpointTarget) {
          setDistanceToCheckpoint(haversineDistance(gps, checkpointTarget));
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [checkpointTarget?.lat, checkpointTarget?.lng]);

  return { position, error, distanceToCheckpoint };
}
