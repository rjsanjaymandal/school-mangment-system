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
      <Card className="border-none glass futuristic-card min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-y-4">
          <div className="relative">
            <BrainCircuit className="h-12 w-12 text-blue-500 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 bg-blue-400 blur-xl opacity-20 animate-pulse" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Running Neural Analysis...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none glass futuristic-card bg-slate-900 text-white overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-50 transition-opacity">
        <Sparkles className="h-24 w-24 text-blue-400" />
      </div>
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-x-2 mb-2">
          <Badge className="bg-blue-500 text-white border-none text-[10px] font-black uppercase tracking-widest">
            AI INSIGHT
          </Badge>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
        </div>
        <CardTitle className="text-xl font-black">
          Performance Predictor
        </CardTitle>
        <p className="text-xs text-blue-200/60 font-medium">
          Predicting Term 2 Results based on current telemetry
        </p>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold">
                Predicted Aggregate Grade
              </span>
              <span className="text-2xl font-black text-blue-400 tracking-tighter">
                A- ({score}%)
              </span>
            </div>
            <Progress
              value={score}
              className="h-2.5 bg-white/10"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-x-2 text-xs font-bold text-blue-300 uppercase mb-2">
                <TrendingUp className="h-3 w-3" />
                Growth Path
              </div>
              <p className="text-lg font-black">+{trend}%</p>
              <p className="text-[10px] opacity-60">vs Last Quarter</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-x-2 text-xs font-bold text-orange-300 uppercase mb-2">
                <AlertCircle className="h-3 w-3" />
                Risk Factor
              </div>
              <p className="text-lg font-black text-orange-400">Low</p>
              <p className="text-[10px] opacity-60">Dropout probability</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 ring-1 ring-blue-500/10">
          <h4 className="text-sm font-bold flex items-center gap-x-2 mb-2 text-blue-300">
            <Zap className="h-4 w-4" />
            AI Recommendations
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-x-2 text-[11px] font-medium leading-relaxed opacity-80">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
              Attendance is top 5%—maintain engagement for stable results.
            </li>
            <li className="flex items-start gap-x-2 text-[11px] font-medium leading-relaxed opacity-80">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
              Science marks trending upward, focus on Advanced Lab modules.
            </li>
          </ul>
        </div>

        <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-x-2 group">
          Generate Detailed Neural Report
          <BrainCircuit className="h-4 w-4 group-hover:rotate-12 transition-transform" />
        </button>
      </CardContent>
    </Card>
  );
}
