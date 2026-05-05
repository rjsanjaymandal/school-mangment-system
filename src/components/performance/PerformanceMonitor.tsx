"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "first-contentful-paint") {
          setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
        }
        if (entry.entryType === "largest-contentful-paint") {
          setMetrics((prev) => ({ ...prev, lcp: entry.startTime }));
        }
        if (entry.entryType === "first-input") {
          setMetrics((prev) => ({ 
            ...prev, 
            fid: (entry as PerformanceEntry & { processingStart: number }).processingStart - entry.startTime 
          }));
        }
        if (entry.entryType === "layout-shift") {
          setMetrics((prev) => ({ 
            ...prev, 
            cls: (prev.cls || 0) + (entry as PerformanceEntry & { value: number }).value 
          }));
        }
      }
    });

    observer.observe({ 
      entryTypes: ["first-contentful-paint", "largest-contentful-paint", "first-input", "layout-shift"] 
    });

    const navTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming & { responseStart?: number; requestStart?: number };
    if (navTiming?.responseStart && navTiming.requestStart) {
      setMetrics((prev) => ({ 
        ...prev, 
        ttfb: navTiming.responseStart - navTiming.requestStart 
      }));
    }

    return () => observer.disconnect();
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white p-3 rounded-lg text-xs font-mono">
      <p className="font-bold mb-2 text-emerald-400">Performance</p>
      <div className="space-y-1">
        <p>FCP: {metrics.fcp?.toFixed(0) || "-"}ms</p>
        <p>LCP: {metrics.lcp?.toFixed(0) || "-"}ms</p>
        <p>FID: {metrics.fid?.toFixed(0) || "-"}ms</p>
        <p>CLS: {metrics.cls?.toFixed(2) || "-"}</p>
        <p>TTFB: {metrics.ttfb?.toFixed(0) || "-"}ms</p>
      </div>
    </div>
  );
}