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
  Activity, Zap
} from "lucide-react";
import { 
    AreaChart, Area, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

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

  // --- Academic Intelligence Layer ---
  const performanceDistribution = useMemo(() => {
    return components.map((component) => ({
      name: component.label.length > 16 ? `${component.label.slice(0, 16)}…` : component.label,
      score: component.score,
      average: gpa,
    }));
  }, [components, gpa]);

  const competencyProfiling = useMemo(() => {
    return components.map(c => ({
        subject: c.label,
        A: c.score,
        fullMark: 100
    }));
  }, [components]);

  return (
    <div className="space-y-12 w-full max-w-7xl mx-auto">
        <div className="lg:w-[400px] space-y-6">
            <div className="relative bg-card border border-slate-200 dark:border-slate-800 p-8 rounded-xl transition-all duration-300 shadow-sm overflow-hidden">
                <div className="absolute -right-4 -bottom-4 h-32 w-32 text-primary opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <GraduationCap className="h-full w-full" />
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-6">
                    Overall Performance
                </p>

                <div className="flex items-baseline gap-x-4 mb-8">
                    <h3 className="text-8xl font-black tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors">
                        {gpa}
                    </h3>
                    <div className="px-4 py-2 bg-primary text-primary-foreground text-xl font-bold rounded-lg shadow-sm">
                        <span className="inline-block">{gradeLetter}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Current Progress</span>
                        <span className="text-primary">{gpa}% Accuracy</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${gpa}%` }}
                        />
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Percentile</p>
                        <p className="text-xl font-black text-foreground tracking-tight leading-none">Top 2%</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Status</p>
                        <p className="text-xl font-black text-primary tracking-tight leading-none uppercase">Excellent</p>
                    </div>
                </div>
            </div>

            </div>

            {/* --- Analytics Layer: Institutional Academic Intelligence --- */}
            <div className="bg-card border border-slate-200 dark:border-slate-800 p-10 rounded-xl relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col">
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                Performance <span className="text-primary">Distribution</span>
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-3 flex items-center gap-2">
                                Temporal Academic Velocity analysis
                            </p>
                        </div>
                        <Activity className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceDistribution}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: "bold" }}
                                    stroke="var(--muted-foreground)"
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} stroke="var(--muted-foreground)" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "10px" }}
                                    labelStyle={{ color: "var(--foreground)" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                <Area type="monotone" dataKey="average" stroke="var(--muted)" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-slate-200 dark:border-slate-800 p-10 rounded-xl relative overflow-hidden group">
                <div className="mb-8 relative z-10 text-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                        Competency <span className="text-primary tracking-normal px-1">/</span> Profiling
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-3 text-center">Inherent Academic Strength Distribution</p>
                </div>
                <div className="h-[280px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyProfiling}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 8, fontWeight: "bold" }} />
                            <Radar
                                name="Grades"
                                dataKey="A"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.6}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "10px" }}
                                labelStyle={{ color: "var(--foreground)" }}
                                itemStyle={{ color: "var(--foreground)" }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        {/* Evaluation Pillar */}
        <div className="lg:flex-1 space-y-10">
            <div className="bg-card border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Grade <span className="text-primary">Breakdown</span></h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-3">Academic Assessment Distribution</p>
                    </div>
                    {isAdminOrTeacher && (
                        <button className="h-12 px-8 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm uppercase tracking-widest text-[9px] transition-all hover:scale-105 flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Assessment
                        </button>
                    )}
                </div>

                    <div className="space-y-4">
                        {components.map((c, idx) => (
                            <div key={c.id} className="group relative flex items-center justify-between p-6 rounded-xl bg-secondary/30 border border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-secondary/50 transition-all duration-300 overflow-hidden">
                                <div className="flex items-center gap-x-6 relative z-10 w-full justify-between">
                                    <div className="flex items-center gap-x-6">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground uppercase tracking-tight text-lg group-hover:text-primary transition-colors">
                                                {c.label}
                                            </p>
                                            <div className="flex items-center gap-x-3 mt-1 text-muted-foreground font-bold">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Weight: {c.weight}%</span>
                                                <div className="h-1 w-1 rounded-full bg-primary/30" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">ID: {c.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-8">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Score</p>
                                            <div className="flex items-baseline gap-x-2">
                                                <span className="text-3xl font-black text-foreground leading-none group-hover:text-primary transition-colors tracking-tighter">{c.score}</span>
                                                <span className="text-muted-foreground/30 font-bold text-[10px] leading-none uppercase">/ 100</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-slate-200 dark:border-slate-800 p-8 rounded-xl group relative border-l-4 border-l-primary/50 overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                        <TrendingUp className="h-20 w-20 text-primary" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Performance Projection</h4>
                    <p className="text-lg font-bold text-foreground uppercase tracking-tight leading-tight max-w-[280px]">
                        Predicted Outcome: <span className="text-primary bg-primary/10 px-3 py-1 rounded-lg font-black tracking-tighter">Distinction (92%)</span>
                    </p>
                </div>
                <div className="bg-card border border-slate-200 dark:border-slate-800 p-8 rounded-xl group relative border-l-4 border-l-orange-500/50 overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                        <AlertTriangle className="h-20 w-20 text-orange-500" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-6">Academic Focus</h4>
                    <p className="text-lg font-bold text-foreground uppercase tracking-tight leading-tight max-w-[280px]">
                        Improvement Area: <span className="text-white bg-orange-500 px-3 py-1 rounded-lg shadow-sm font-black tracking-tighter">Module 4 Performance</span>
                    </p>
                </div>
            </div>
    </div>
  );
}
