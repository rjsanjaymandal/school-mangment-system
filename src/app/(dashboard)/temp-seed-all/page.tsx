"use client";

import { useState } from "react";
import { triggerAllSeeding } from "@/app/actions/seed-all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Database } from "lucide-react";

export default function TempSeedAllPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    const res = await triggerAllSeeding();
    setLoading(false);
    if (res.success) {
      setResults(res.results || []);
    } else {
      setError(res.error || "Unknown error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <Card className="w-full max-w-xl border-none glass shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/10 border-b border-primary/20 p-8">
          <div className="flex items-center gap-x-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center emerald-glow">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Data Genesis Relay</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Institutional Synthetic Data Seeding Protocol</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <p className="text-sm text-foreground/60 font-medium leading-relaxed">
            This utility will populate the **Library**, **Conduct**, and **Health** modules with realistic synthetic data. 
            It requires existing student and teacher profiles to establish relational integrity.
          </p>

          {!results && !error && (
            <Button 
              onClick={handleSeed} 
              disabled={loading}
              className="w-full py-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl emerald-glow border-none"
            >
              {loading ? "Initializing Protocols..." : "Commence Data Genesis"}
            </Button>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-x-4">
              <XCircle className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="font-black text-[10px] uppercase tracking-widest">Error Intercepted</span>
                <span className="text-sm font-bold">{error}</span>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-foreground/40">Seeding Results</h3>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 uppercase text-[9px] font-black">Success</Badge>
              </div>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-border group hover:border-primary transition-all">
                    <div className="flex items-center gap-x-3">
                      {r.success ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="font-bold text-sm uppercase tracking-tight">{r.module} Module</span>
                    </div>
                    {r.error && <span className="text-[9px] font-black text-destructive uppercase tracking-widest">Error</span>}
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-primary mt-6 animate-pulse">
                Data Integration Complete. Redirecting...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
