"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Save,
  Download,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { GradebookService, GradeComponent } from "@/lib/services/gradebook";

interface GradebookDashboardProps {
    userRole?: string | null;
    isStudent?: boolean;
    initialGrades?: any[];
}

export default function GradebookDashboard({ 
  userRole, 
  isStudent = false, 
  initialGrades = [] 
}: GradebookDashboardProps) {
  const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
  
  const [components, setComponents] = useState<GradeComponent[]>(
    isStudent && initialGrades.length > 0
      ? initialGrades.map((g: any) => ({
          id: g.id,
          label: g.exam?.name || "Assessment",
          weight: 100 / initialGrades.length,
          score: g.marks_obtained,
        }))
      : [
          { id: "1", label: "Midterm Exam", weight: 30, score: 82 },
          { id: "2", label: "Final Project", weight: 40, score: 91 },
          { id: "3", label: "Quizzes / Classwork", weight: 20, score: 75 },
          { id: "4", label: "Attendance", weight: 10, score: 95 },
        ]
  );

  const gpa = useMemo(
    () => GradebookService.calculateGPA(components),
    [components],
  );
  const gradeLetter = useMemo(
    () => GradebookService.getGradeLetter(gpa),
    [gpa],
  );

  return (
    <div className="space-y-12 reveal-1 w-full max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Statistics Pillar */}
        <div className="lg:w-[400px] space-y-8">
            <div className="relative group glass-card p-10 transition-all duration-700 hover:emerald-border-glow overflow-hidden shadow-2xl shadow-emerald-500/5">
                <div className="absolute -right-6 -bottom-6 h-48 w-48 text-emerald-500 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                    <GraduationCap className="h-full w-full" />
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-10 group-hover:tracking-[0.6em] transition-all italic">
                    Master_GPA_Protocol
                </p>

                <div className="flex items-baseline gap-x-6 mb-12">
                    <h3 className="text-9xl font-black tracking-tighter text-foreground italic leading-none group-hover:text-emerald-500 transition-colors">
                        {gpa}
                    </h3>
                    <div className="px-6 py-3 bg-emerald-500 text-white text-2xl font-black italic rounded-sm shadow-[0_0_40px_oklch(var(--emerald-500)/0.3)] skew-x-[-12deg]">
                        <span className="not-skew-x inline-block">{gradeLetter}</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">
                        <span>Computational Integrity</span>
                        <span className="text-emerald-500">{gpa}% Optimal</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-none overflow-hidden skew-x-[-12deg]">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_20px_oklch(var(--emerald-500))] transition-all duration-1000"
                            style={{ width: `${gpa}%` }}
                        />
                    </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2 italic">Global Percentile</p>
                        <p className="text-2xl font-black italic text-foreground tracking-tighter leading-none decoration-emerald-500/30 underline underline-offset-8">Top 2%</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2 italic">Current Batch</p>
                        <p className="text-2xl font-black italic text-emerald-500 tracking-tighter leading-none">PRIME</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-2 rounded-sm border border-emerald-500/10 group hover:border-emerald-500/30 transition-all duration-700">
                <div className="p-6 bg-white/5 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Registry Ops</h4>
                        <TrendingUp className="h-4 w-4 text-emerald-500 animate-pulse" />
                    </div>
                    <Button variant="ghost" className="w-full justify-start h-16 bg-white/5 border border-white/5 hover:border-emerald-500/40 rounded-none font-black text-[10px] uppercase tracking-[0.3em] gap-x-4 transition-all hover:translate-x-2 skew-x-[-12deg]">
                        <span className="not-skew-x flex items-center gap-x-4">
                            <Download className="h-4 w-4 text-emerald-500" />
                            Decrypt PDF Transcript
                        </span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-16 bg-white/5 border border-white/5 hover:border-emerald-500/40 rounded-none font-black text-[10px] uppercase tracking-[0.3em] gap-x-4 transition-all hover:translate-x-2 skew-x-[-12deg]">
                        <span className="not-skew-x flex items-center gap-x-4">
                            <Save className="h-4 w-4 text-emerald-500" />
                            Force Institutional Sync
                        </span>
                    </Button>
                </div>
            </div>
        </div>

        {/* Evaluation Pillar */}
        <div className="lg:flex-1 space-y-12">
            <div className="glass-panel p-2 rounded-sm border border-white/10 overflow-hidden shadow-2xl shadow-emerald-500/5">
                <div className="bg-background/40 backdrop-blur-3xl p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Academic <span className="text-emerald-500">Performance</span></h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic">Protocol: Weighted Assessment Allocation</p>
                        </div>
                        {isAdminOrTeacher && (
                            <Button className="h-14 px-10 bg-emerald-500 text-white font-black rounded-sm shadow-[0_0_40px_oklch(var(--emerald-500)/0.2)] emerald-border-glow uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg] transition-all hover:scale-105">
                                <span className="not-skew-x flex items-center gap-x-3">
                                    Initialize Segment
                                    <Plus className="h-4 w-4" />
                                </span>
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {components.map((c, idx) => (
                            <div key={c.id} className="group relative flex items-center justify-between p-8 rounded-none bg-white/5 border border-white/5 hover:border-emerald-500/40 hover:bg-white/10 transition-all duration-500 overflow-hidden skew-x-[-8deg] ml-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="not-skew-x flex items-center gap-x-8 relative z-10 w-full justify-between">
                                    <div className="flex items-center gap-x-8">
                                        <div className="h-14 w-14 rounded-none bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xs italic group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-[0_0_20px_oklch(var(--emerald-500)/0)] group-hover:shadow-[0_0_20px_oklch(var(--emerald-500)/0.4)]">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground uppercase tracking-tight text-lg group-hover:text-emerald-500 transition-colors italic">
                                                {c.label}
                                            </p>
                                            <div className="flex items-center gap-x-4 mt-2 opacity-30 group-hover:opacity-100 transition-opacity font-bold italic">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Weight: {c.weight}%</span>
                                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Node-UID: {c.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-12">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2 italic">Grade Score</p>
                                            <div className="flex items-baseline gap-x-3">
                                                <span className="text-4xl font-black italic text-foreground leading-none group-hover:text-emerald-500 transition-colors tracking-tighter">{c.score}</span>
                                                <span className="text-emerald-500/40 font-black text-[12px] leading-none uppercase italic">/ 100</span>
                                            </div>
                                        </div>
                                        <div className="h-12 w-px bg-white/10 group-hover:bg-emerald-500/30 transition-colors" />
                                        <ChevronRight className="h-5 w-5 text-emerald-500/20 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-12 group relative border-l-4 border-l-emerald-500/50 overflow-hidden shadow-2xl shadow-emerald-500/5">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                        <TrendingUp className="h-24 w-24 text-emerald-500" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-8 italic">Master Projection</h4>
                    <p className="text-lg font-black text-foreground uppercase tracking-tight italic leading-tight max-w-[280px]">
                        Projected Path: <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-sm shadow-[0_0_20px_oklch(var(--emerald-500)/0.2)] italic underline decoration-emerald-500/30 font-black tracking-tighter">Prime Distinction (92%)</span>
                    </p>
                </div>
                <div className="glass-card p-12 group relative border-l-4 border-l-orange-500/50 overflow-hidden shadow-2xl shadow-orange-500/5">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                        <AlertTriangle className="h-24 w-24 text-orange-500" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-8 italic">Neural Optimization</h4>
                    <p className="text-lg font-black text-foreground uppercase tracking-tight italic leading-tight max-w-[280px]">
                        Heuristic Alert: <span className="text-white bg-orange-500 px-3 py-1 rounded-sm italic shadow-[0_0_20px_oklch(var(--orange-500)/0.2)] font-black tracking-tighter">Anomaly Module 4</span>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
