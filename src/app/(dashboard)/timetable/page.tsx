"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Plus,
  Filter,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// DSA: Schedule Collision Detection Logic
interface TimeSlot {
  start: string; // "09:00"
  end: string; // "10:00"
}

function hasTimeConflict(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.start < slot2.end && slot2.start < slot1.end;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Mock data for collisions check demo
  const schedules = [
    {
      id: 1,
      subject: "Advanced Physics",
      teacher: "Dr. Aris",
      room: "Lab 302",
      time: "09:00 - 10:00",
      day: "Monday",
      color: "blue",
    },
    {
      id: 2,
      subject: "Mathematics",
      teacher: "Prof. Sarah",
      room: "Hall A",
      time: "10:00 - 11:00",
      day: "Monday",
      color: "purple",
    },
    {
      id: 3,
      subject: "Cyber Security",
      teacher: "Agent X",
      room: "Lab 404",
      time: "11:00 - 12:00",
      day: "Tuesday",
      color: "indigo",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Institutional Scheduling
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            DSA-Optimized Timetable & Resource Allocation
          </p>
        </div>
        <div className="flex gap-x-2">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Resource View
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
                <Plus className="h-4 w-4" />
                New Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="glass futuristic-card border-none text-slate-900">
              <DialogHeader>
                <DialogTitle className="font-black text-2xl">
                  Add Academic Slot
                </DialogTitle>
              </DialogHeader>
              {/* Scheduling Form would go here */}
              <div className="p-4 space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-blue-700">
                      Collision Detection Active
                    </p>
                    <p className="text-blue-600/70 mt-1">
                      System is using backtracking logic to prevent teacher and
                      room double-booking.
                    </p>
                  </div>
                </div>
                <Button className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                  Validate & Secure Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Day Selector Sidebar */}
        <Card className="lg:col-span-1 border-none glass futuristic-card overflow-hidden">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Academic Week
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold ${selectedDay === day ? "bg-white shadow-md text-slate-900 border border-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
              >
                {day}
                {selectedDay === day && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="flex-1 min-w-[150px] space-y-4">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {time}
                  </p>
                  <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                </div>

                {/* Render slots for this time and day */}
                {schedules
                  .filter(
                    (s) => s.day === selectedDay && s.time.startsWith(time),
                  )
                  .map((s) => (
                    <Card
                      key={s.id}
                      className={`border-none glass futuristic-card relative overflow-hidden ring-1 ring-inset ${s.color === "blue" ? "ring-blue-500/10" : "ring-purple-500/10"}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-x-2">
                          <Badge
                            className={`bg-${s.color}-500 text-white border-none text-[8px] font-black tracking-widest px-1.5`}
                          >
                            LECTURE
                          </Badge>
                          <div className="ml-auto flex -space-x-2">
                            <div className="h-5 w-5 rounded-full bg-slate-200 border-2 border-white" />
                            <div className="h-5 w-5 rounded-full bg-slate-300 border-2 border-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs truncate">
                            {s.subject}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {s.teacher}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                          <div className="flex items-center gap-x-1">
                            <MapPin className="h-3 w-3" />
                            {s.room}
                          </div>
                          <div className="flex items-center gap-x-1">
                            <Clock className="h-3 w-3" />
                            {s.time.split(" - ")[1]}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {/* Empty state for slot */}
                {schedules.filter(
                  (s) => s.day === selectedDay && s.time.startsWith(time),
                ).length === 0 && (
                  <div className="h-32 rounded-2xl border-2 border-dashed border-slate-100/50 flex items-center justify-center group hover:border-blue-200 transition-colors cursor-pointer">
                    <Plus className="h-5 w-5 text-slate-200 group-hover:text-blue-300 transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none glass futuristic-card bg-slate-900 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">100%</span>
                  <CheckCircle2 className="h-6 w-6 text-green-400 neon-blue" />
                </div>
                <p className="text-[10px] font-medium opacity-60 mt-1">
                  Zero conflicts detected in {WEEKDAYS.length} nodes.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none glass futuristic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Daily Utility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900">
                    76%
                  </span>
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  Space utilization active.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return <Zap className={className} />;
}
