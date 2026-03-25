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
          weight: 100 / initialGrades.length, // Rough distribution for now
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
            Academic Performance Ledger
          </h2>
          <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
            Weighted Computation & Neural Academic Analytics
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-sm border-border bg-transparent font-black uppercase tracking-widest text-[10px] px-6 h-12 hover:bg-primary/5 transition-all flex items-center gap-x-2"
          >
            <Download className="h-4 w-4" />
            Export Transcript
          </Button>
          {isAdminOrTeacher && (
            <Button className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-8 h-12 emerald-glow transition-all hover:bg-primary/90 flex items-center gap-x-2">
              <Save className="h-4 w-4" />
              Synchronize Grades
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* GPA Summary Card */}
        <Card className="lg:col-span-1 border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute right-[-10px] bottom-[-10px] h-32 w-32 text-primary opacity-10 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-full w-full" />
          </div>
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Cumulative Index (GPA)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-8">
            <div className="flex items-baseline gap-x-4">
              <h3 className="text-7xl font-black tracking-tighter text-primary group-hover:emerald-glow transition-all italic">
                {gpa}
              </h3>
              <Badge className="bg-primary text-primary-foreground emerald-glow border-none text-xl font-black px-4 py-1 rounded-sm uppercase tracking-widest italic">
                {gradeLetter}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
                <span>MASTERY PROGRESSION</span>
                <span>{gpa}%</span>
              </div>
              <Progress
                value={gpa}
                className="h-2 bg-primary/10 rounded-none"
                indicatorClassName="bg-primary emerald-glow"
              />
            </div>
            <div className="pt-6 border-t border-border/50 flex items-center gap-x-3">
              <div className="h-2 w-2 rounded-full bg-primary emerald-glow animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">
                VALIDATED BY NEURAL ENGINE V2.4
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grade Weighting Calculator */}
        <Card className="lg:col-span-2 border-border bg-card/40 backdrop-blur-xl rounded-sm shadow-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-border/50 flex flex-row items-center justify-between bg-primary/5">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-x-2">
                <Calculator className="h-4 w-4" />
                Assessment Parameters
              </CardTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-1">
                Weighted Allocation Matrix
              </p>
            </div>
            {isAdminOrTeacher && (
              <Button
                size="sm"
                variant="ghost"
                className="font-black text-[10px] tracking-widest uppercase hover:bg-primary/10 text-primary hover:text-primary transition-all rounded-sm px-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Initialize Schema
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {components.map((c, idx) => (
                <div
                  key={c.id}
                  className="group flex items-center gap-x-6 p-6 hover:bg-primary/5 transition-colors border-border/50"
                >
                  <div className="h-12 w-12 shrink-0 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-lg group-hover:emerald-glow-sm transition-all italic">
                    0{idx + 1}
                  </div>
                  <div className="flex-1">
                    <Input
                      readOnly={!isAdminOrTeacher}
                      value={c.label}
                      onChange={(e) => {
                        const newComp = [...components];
                        newComp[idx].label = e.target.value;
                        setComponents(newComp);
                      }}
                      className={cn(
                        "bg-transparent border-none font-black text-foreground uppercase tracking-tight focus-visible:ring-0 p-0 h-auto text-sm italic",
                        !isAdminOrTeacher && "cursor-default"
                      )}
                    />
                    <div className="flex items-center gap-x-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">ALGORITHM WEIGHT:</span>
                        <span className="text-[10px] font-black text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-sm">{c.weight}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-6">
                    <div className="w-32">
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2 text-right">
                        COMPUTED SCORE
                      </p>
                      <Input
                        readOnly={!isAdminOrTeacher}
                        type="number"
                        value={c.score}
                        onChange={(e) => {
                          const newComp = [...components];
                          newComp[idx].score = Number(e.target.value);
                          setComponents(newComp);
                        }}
                        className={cn(
                          "text-right font-black text-foreground uppercase tracking-widest bg-card/40 backdrop-blur-md rounded-sm border-border h-10 text-xs focus:border-primary transition-all shadow-xl",
                          !isAdminOrTeacher && "cursor-default border-transparent bg-transparent shadow-none"
                        )}
                      />
                    </div>
                    {isAdminOrTeacher && <ChevronRight className="h-4 w-4 text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Insight */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute right-[-10px] top-[-10px] h-24 w-24 text-primary opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-full w-full" />
          </div>
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-2">
              <Calculator className="h-4 w-4" />
              Projection Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-start gap-x-6">
              <div className="h-12 w-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg emerald-glow">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight italic">
                  Projected Final Grade: <span className="text-primary italic animate-pulse">A</span>
                </p>
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-2 leading-loose">
                  Current trajectory indicates a <span className="text-primary font-black underline underline-offset-4 decoration-primary/30">8.4%</span> deviation above the standard institutional average.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden group shadow-2xl border-l-4 border-l-red-500/50">
          <div className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-red-500 opacity-5 group-hover:scale-110 transition-transform text-red-500">
            <AlertTriangle className="h-full w-full" />
          </div>
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80 flex items-center gap-x-2">
              <AlertTriangle className="h-4 w-4" />
              Neural Anomaly Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-start gap-x-6">
              <div className="h-12 w-12 rounded-sm bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 shadow-lg border border-red-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight italic">
                  Critical Threshold Anomaly
                </p>
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-2 leading-loose">
                  Syntactic pattern recognition in <span className="text-red-500/80 font-black px-2 py-0.5 bg-red-500/5 rounded-sm border border-red-500/10">UNIT 3</span> requires immediate reinforcement protocol.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
