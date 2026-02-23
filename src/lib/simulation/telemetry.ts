"use client"

import { useState, useEffect } from 'react';

export interface TelemetryData {
  latitude: number;
  longitude: number;
  speed: string;
  status: 'moving' | 'stopped' | 'alert';
  heading: number;
}

// Initial positions for school buses
const BUS_ROUTES = [
  { id: 'R10', start: { lat: 25.276985, lng: 55.296249 }, heading: 45 },
  { id: 'R04', start: { lat: 25.285000, lng: 55.305000 }, heading: 120 },
  { id: 'S-XX', start: { lat: 25.270000, lng: 55.280000 }, heading: 300, status: 'alert' as const },
];

export function useTelemetry(routeId: string) {
  const [data, setData] = useState<TelemetryData | null>(null);

  useEffect(() => {
    const route = BUS_ROUTES.find(r => r.id === routeId);
    if (!route) return;

    // Initialize position
    let currentLat = route.start.lat;
    let currentLng = route.start.lng;
    let currentHeading = route.heading;

    const interval = setInterval(() => {
      // Small random movement simulation
      if (route.status !== 'alert') {
        const delta = 0.00005;
        currentLat += (Math.random() - 0.5) * delta;
        currentLng += (Math.random() - 0.5) * delta;
        currentHeading += (Math.random() - 0.5) * 5;
      }

      setData({
        latitude: currentLat,
        longitude: currentLng,
        speed: route.status === 'alert' ? '0 km/h' : `${Math.floor(Math.random() * 10) + 35} km/h`,
        status: (route.status as any) || 'moving',
        heading: currentHeading,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [routeId]);

  return data;
}

export function useAIPerformanceSim() {
  const [score, setScore] = useState(86.4);
  const [trend, setTrend] = useState(4.2);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slow neural calculation changes
      setScore(prev => +(prev + (Math.random() - 0.5) * 0.1).toFixed(1));
      setTrend(prev => +(prev + (Math.random() - 0.5) * 0.05).toFixed(2));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { score, trend };
}
