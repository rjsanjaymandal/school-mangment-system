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
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastOnline, setLastOnline] = useState<Date | null>(() => new Date());

  useEffect(() => {
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

      setErrors(prev => [...prev.slice(-9), errorLog]);
      
      if (!errorLog.message.includes("ResizeObserver")) {
        toast.error(`Error: ${errorLog.message.substring(0, 100)}`);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorLog: ErrorLog = {
        id: `rej-${Date.now()}`,
        message: event.reason?.message || "Unhandled Promise Rejection",
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      setErrors(prev => [...prev.slice(-9), errorLog]);
      toast.error(`Error: ${errorLog.message.substring(0, 100)}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (errors.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg m-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <Bug className="h-5 w-5" />
            <h2 className="font-semibold">Something went wrong</h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {errors.slice(-3).map((err) => (
              <div key={err.id} className="p-2 bg-slate-50 rounded text-sm">
                <p className="font-mono text-xs">{err.message}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setErrors([])}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

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