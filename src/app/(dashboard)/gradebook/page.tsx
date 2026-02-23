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

// DSA: Grade Computing Logic (Weighted Average)
interface GradeComponent {
  id: string;
  label: string;
  weight: number; // e.g., 20 for 20%
  score: number; // e.g., 85
}

function calculateGPA(components: GradeComponent[]): number {
  const totalWeight = components.reduce((acc, c) => acc + c.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = components.reduce(
    (acc, c) => acc + c.score * (c.weight / 100),
    0,
  );
  return Number(weightedSum.toFixed(2));
}

function getGradeLetter(gpa: number): string {
  if (gpa >= 90) return "A+";
  if (gpa >= 80) return "A";
  if (gpa >= 70) return "B";
  if (gpa >= 60) return "C";
  return "D";
}

export default function GradebookPage() {
  const [components, setComponents] = useState<GradeComponent[]>([
    { id: "1", label: "Midterm Exam", weight: 30, score: 82 },
    { id: "2", label: "Final Project", weight: 40, score: 91 },
    { id: "3", label: "Quizzes / Classwork", weight: 20, score: 75 },
    { id: "4", label: "Attendance", weight: 10, score: 95 },
  ]);

  const gpa = useMemo(() => calculateGPA(components), [components]);
  const gradeLetter = useMemo(() => getGradeLetter(gpa), [gpa]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Advanced Gradebook
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Weighted Computation & Academic Analytics
          </p>
        </div>
        <div className="flex gap-x-2">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Download className="h-4 w-4" />
            Transcript PDF
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Save className="h-4 w-4" />
            Commit Grades
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* GPA Summary Card */}
        <Card className="lg:col-span-1 border-none glass futuristic-card bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">
              Cumulative Index (GPA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-x-4">
              <h3 className="text-7xl font-black tracking-tighter neon-blue">
                {gpa}
              </h3>
              <Badge className="bg-blue-500 text-white border-none text-xl px-4 py-1 rounded-xl">
                {gradeLetter}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold opacity-60">
                <span>MASTERY PROGRESS</span>
                <span>{gpa}%</span>
              </div>
              <Progress
                value={gpa}
                className="h-2 bg-white/10"
                indicatorClassName="bg-blue-500 neon-blue"
              />
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center gap-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-[10px] font-bold opacity-60">
                VALIDATED BY NEURAL ENGINE V2
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grade Weighting Calculator */}
        <Card className="lg:col-span-2 border-none glass futuristic-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black tracking-tight">
                Assessment Weights
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">
                Define parameters for academic computation
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-500 font-bold hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD SCHEMA
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {components.map((c, idx) => (
              <div
                key={c.id}
                className="group flex items-center gap-x-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400">
                  0{idx + 1}
                </div>
                <div className="flex-1">
                  <Input
                    value={c.label}
                    onChange={(e) => {
                      const newComp = [...components];
                      newComp[idx].label = e.target.value;
                      setComponents(newComp);
                    }}
                    className="bg-transparent border-none font-bold text-slate-900 focus-visible:ring-0 p-0 h-auto"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Weight: {c.weight}%
                  </p>
                </div>
                <div className="flex items-center gap-x-4">
                  <div className="w-24">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 text-right">
                      SCORE
                    </p>
                    <Input
                      type="number"
                      value={c.score}
                      onChange={(e) => {
                        const newComp = [...components];
                        newComp[idx].score = Number(e.target.value);
                        setComponents(newComp);
                      }}
                      className="text-right font-black text-slate-900 bg-white rounded-xl border-slate-100"
                    />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 opacity-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Insight */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none glass futuristic-card bg-blue-50/50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-sm font-black flex items-center gap-x-2 text-blue-900">
              <Calculator className="h-4 w-4" />
              Projection Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-x-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">
                  Projected Final Grade: A
                </p>
                <p className="text-xs text-blue-800/60 mt-1">
                  Based on current trajectory, the student will exceed class
                  average by **8.4%**.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none glass futuristic-card bg-orange-50/50 border-orange-100">
          <CardHeader>
            <CardTitle className="text-sm font-black flex items-center gap-x-2 text-orange-900">
              <AlertTriangle className="h-4 w-4" />
              Neural Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-x-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-orange-900">
                  Quizzes Below Threshold
                </p>
                <p className="text-xs text-orange-800/60 mt-1">
                  Foundational concepts in **Unit 3** require reinforcement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
