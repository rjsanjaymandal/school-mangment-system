"use client";

import { useState } from "react";
import {
  Heart,
  GraduationCap,
  DollarSign,
  ShieldCheck,
  Calendar,
  Bell,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const studentSummary = {
  name: "Alexander Pierce",
  gpa: 3.84,
  attendance: 98,
  conductBalance: 35,
  feesStatus: "Fully Paid",
  nextExam: "Advanced Physics (Oct 28)",
};

export default function ParentPulseDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white neon-blue">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Parent Pulse
            </h2>
            <p className="text-slate-500 font-medium tracking-tight">
              Ecosystem Transparency for {studentSummary.name}'s Journey
            </p>
          </div>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2 relative"
          >
            <Bell className="h-4 w-4" />
            Alerts
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">
              2
            </span>
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Activity className="h-4 w-4" />
            Engage Neural Feed
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none glass futuristic-card p-6 bg-linear-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex justify-between items-start mb-4">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <Badge className="bg-blue-500 border-none text-[10px] font-black">
              TOP 5%
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Academic Standing
          </p>
          <h3 className="text-3xl font-black mt-1">{studentSummary.gpa} GPA</h3>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <div className="flex justify-between items-start mb-4">
            <Activity className="h-8 w-8 text-green-500" />
            <Badge className="bg-green-50 text-green-600 border-none text-[10px] font-black">
              CONSISTENT
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Attendance Rate
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">
            {studentSummary.attendance}%
          </h3>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-blue-100">
          <div className="flex justify-between items-start mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-black">
              EXCEPTIONAL
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Conduct Balance
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">
            +{studentSummary.conductBalance}
          </h3>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <div className="flex justify-between items-start mb-4">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <Badge className="bg-purple-50 text-purple-600 border-none text-[10px] font-black">
              CLEARED
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Fiscal Status
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">PAY-OFF</h3>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Academic Pulse */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Neural Progress feed
          </h3>

          <div className="space-y-4">
            {[
              {
                subject: "Advanced Mathematics",
                progress: 92,
                status: "A+",
                teacher: "Prof. Aris Thorne",
              },
              {
                subject: "Theoretical Physics",
                progress: 88,
                status: "A",
                teacher: "Dr. Elena Vance",
              },
              {
                subject: "Neuro-Biology",
                progress: 74,
                status: "B",
                teacher: "Prof. Xavier",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-none glass futuristic-card p-6 group cursor-pointer hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-black text-slate-900">
                      {item.subject}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {item.teacher}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">
                      {item.status}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400">
                      CURRENT GRADE
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">Curriculum Mastery</span>
                    <span className="text-slate-900">{item.progress}%</span>
                  </div>
                  <Progress
                    value={item.progress}
                    className="h-1.5 bg-slate-100"
                    indicatorClassName="bg-slate-900"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tactical Feed */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Tactical Schedule
          </h3>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                High-Priority Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-5 flex items-start gap-x-4 hover:bg-slate-50 transition-colors">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-black">OCT</span>
                    <span className="text-xl font-black">28</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Physics Midterms
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Exam Hall B • 09:00 AM
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                </div>
                <div className="p-5 flex items-start gap-x-4 hover:bg-slate-50 transition-colors">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-black">NOV</span>
                    <span className="text-xl font-black">02</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Parent Teacher Summit
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Main Auditorium • 04:30 PM
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none glass futuristic-card bg-linear-to-br from-blue-600 to-blue-500 text-white p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 transition-transform group-hover:scale-175">
              <Zap className="h-24 w-24" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              Digital Clearance
            </h4>
            <p className="text-xs opacity-80 font-medium leading-relaxed">
              A new report card batch is ready for your signature. Approve
              digitally to finalize term credentials.
            </p>
            <Button className="mt-6 w-full bg-white text-blue-600 font-black rounded-xl hover:bg-white/90 gap-x-2">
              <ShieldCheck className="h-4 w-4" />
              SIGN CREDENTIALS
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
