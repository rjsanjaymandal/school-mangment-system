"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white">
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <Card className="max-w-md w-full border-l-4 border-l-red-500 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Critical Error</h2>
              </div>
              <p className="text-sm text-slate-600">
                {error.message || "A critical error occurred."}
              </p>
              <Button onClick={reset} className="w-full rounded-md">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}