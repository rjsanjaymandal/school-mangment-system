"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bug, 
  Clock,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent?: string;
}

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  // Track online status
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      toast.success("Connection restored");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Some features may not work.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorLog: ErrorLog = {
        id: `err-${Date.now()}`,
        message: event.message || "Unknown error",
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      setErrors(prev => [...prev.slice(-9), errorLog]); // Keep last 10 errors
      
      // Show toast for critical errors
      if (!errorLog.message.includes("ResizeObserver")) {
        toast.error(`Error: ${errorLog.message.substring(0, 100)}`);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorLog: ErrorLog = {
        id: `err-${Date.now()}`,
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
      };

      setErrors(prev => [...prev.slice(-9), errorLog]);
      toast.error("Something went wrong. Please refresh the page.");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Retry mechanism for failed requests
  const retryFailedRequests = useCallback(() => {
    // Trigger a page refresh for now
    window.location.reload();
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 z-50 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You are offline. Some features may be unavailable.</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4 bg-white text-amber-600 hover:bg-amber-50"
            onClick={retryFailedRequests}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Back Online Notification */}
      {isOnline && lastOnline && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Connection restored</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Summary (Development Only) */}
      {process.env.NODE_ENV === "development" && errors.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Recent Errors ({errors.length})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearErrors} className="h-6 text-xs">
                  Clear
                </Button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {errors.slice(-3).map(err => (
                  <div key={err.id} className="text-xs text-red-700 truncate">
                    {err.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {children}
    </>
  );
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Measure latency
    const measureLatency = async () => {
      try {
        const start = Date.now();
        await fetch("/api/health", { method: "HEAD", cache: "no-store" });
        setLatency(Date.now() - start);
      } catch {
        setLatency(null);
      }
    };

    measureLatency();
    const interval = setInterval(measureLatency, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, latency };
}

// Performance metrics hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const newMetrics = { ...metrics };
      
      for (const entry of list.getEntries()) {
        if (entry.entryType === "first-contentful-paint") {
          newMetrics.fcp = entry.startTime;
        }
        if (entry.entryType === "largest-contentful-paint") {
          newMetrics.lcp = entry.startTime;
        }
        if (entry.entryType === "first-input") {
          newMetrics.fid = (entry as any).processingStart - entry.startTime;
        }
        if (entry.entryType === "layout-shift") {
          newMetrics.cls += (entry as any).value;
        }
      }
      
      setMetrics(newMetrics);
    });

    observer.observe({ 
      entryTypes: ["first-contentful-paint", "largest-contentful-paint", "first-input", "layout-shift"] 
    });

    return () => observer.disconnect();
  }, []);

  return metrics;
}