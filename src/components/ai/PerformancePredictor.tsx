"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAIPerformanceSim } from "@/lib/simulation/telemetry";

export function PerformancePredictor() {
  const [analyzing, setAnalyzing] = useState(true);
  const { score, trend } = useAIPerformanceSim();

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (analyzing) {
    return (
      <Card className="border-border bg-card/40 backdrop-blur-md min-h-[400px] flex items-center justify-center rounded-sm shadow-2xl">
        <div className="flex flex-col items-center gap-y-4">
          <div className="relative">
            <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 bg-primary blur-2xl opacity-20 animate-pulse" />
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">
            Neural Analysis in Progress...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/60 backdrop-blur-xl text-foreground overflow-hidden group rounded-sm shadow-2xl relative">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Sparkles className="h-32 w-32 text-primary" />
      </div>
      <CardHeader className="relative z-10 pb-8">
        <div className="flex items-center gap-x-3 mb-3">
          <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-black uppercase tracking-[0.3em] rounded-xs px-2 py-1 emerald-glow">
            AI INSIGHT
          </Badge>
          <div className="h-1.5 w-1.5 rounded-sm bg-primary animate-ping emerald-glow shadow-sm shadow-primary/50" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight uppercase">
          Performance Predictor
        </CardTitle>
        <p className="text-[10px] text-foreground/60 font-black uppercase tracking-[0.2em] mt-1 group-hover:text-primary transition-colors">
          Predictive telemetry for Term 2 orchestration
        </p>
      </CardHeader>
      <CardContent className="space-y-8 relative z-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                Predicted Aggregate Grade
              </span>
              <span className="text-3xl font-black text-primary tracking-tighter emerald-glow">
                A- ({score}%)
              </span>
            </div>
            <div className="relative h-3 w-full bg-accent/20 rounded-none overflow-hidden border border-border/50">
              <div 
                className="h-full bg-primary emerald-glow transition-all duration-1000 shadow-[0_0_15px_oklch(var(--primary)/0.4)]"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xs bg-accent/30 border border-border backdrop-blur-sm group-hover:bg-accent/50 transition-all duration-300">
              <div className="flex items-center gap-x-2 text-[10px] font-black text-primary uppercase mb-2 tracking-widest">
                <TrendingUp className="h-3 w-3" />
                Growth Path
              </div>
              <p className="text-2xl font-black tracking-tighter">+{trend}%</p>
              <p className="text-[10px] font-black uppercase tracking-tighter text-foreground/50 mt-1">vs Last Quarter</p>
            </div>
            <div className="p-4 rounded-xs bg-accent/30 border border-border backdrop-blur-sm group-hover:bg-accent/50 transition-all duration-300">
              <div className="flex items-center gap-x-2 text-[10px] font-black text-destructive uppercase mb-2 tracking-widest">
                <AlertCircle className="h-3 w-3" />
                Risk Factor
              </div>
              <p className="text-2xl font-black tracking-tighter text-destructive">Low</p>
              <p className="text-[10px] font-black uppercase tracking-tighter text-foreground/50 mt-1">Anomalies Detected: 0</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-sm bg-primary/5 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Zap className="h-12 w-12 text-primary" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-x-2 mb-4 text-primary">
            Neural Recommendations
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-x-3 text-[11px] font-bold leading-relaxed text-foreground/80">
              <div className="mt-1 h-1.5 w-1.5 rounded-none bg-primary shrink-0 rotate-45" />
              Attendance is top 5%—maintain engagement for stable results.
            </li>
            <li className="flex items-start gap-x-3 text-[11px] font-bold leading-relaxed text-foreground/80">
              <div className="mt-1 h-1.5 w-1.5 rounded-none bg-primary shrink-0 rotate-45" />
              Science marks trending upward, focus on Advanced Lab modules.
            </li>
          </ul>
        </div>

        <button className="w-full py-5 rounded-xs bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary/90 transition-all flex items-center justify-center gap-x-3 group shadow-2xl emerald-glow">
          Generate Neural Report
          <BrainCircuit className="h-4 w-4 group-hover:rotate-12 transition-transform" />
        </button>
      </CardContent>
    </Card>

  );
}

