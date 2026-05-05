"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-md w-full border-l-4 border-l-red-500 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          
          <p className="text-sm text-slate-600">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          <div className="flex gap-3 pt-2">
            <Button onClick={reset} className="flex-1 rounded-md">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full rounded-md">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}