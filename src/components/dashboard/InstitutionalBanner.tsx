"use client";

import { LayoutGrid, Bus, Route, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionalBannerProps {
  metrics?: {
    classes: number;
    departments: number;
    transport?: {
      vehicles: number;
      routes: number;
      students: number;
    };
  };
}

const defaultMetrics = {
  classes: 0,
  departments: 0,
  transport: { vehicles: 0, routes: 0, students: 0 }
};

export function InstitutionalBanner({ metrics }: InstitutionalBannerProps) {
  const safeMetrics = { ...defaultMetrics, ...metrics };
  const transport = safeMetrics.transport || defaultMetrics.transport;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Academic Footprint */}
      <div className="glass futuristic-card border border-slate-200/60 rounded-2xl p-5 shadow-xl flex items-center gap-5 border-l-4 border-l-emerald-500">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
          <Building2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Classes</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{safeMetrics.classes}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active</span>
          </div>
        </div>
      </div>

      <div className="glass futuristic-card border border-slate-200/60 rounded-2xl p-5 shadow-xl flex items-center gap-5 border-l-4 border-l-blue-500">
        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
          <LayoutGrid className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Departments</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{safeMetrics.departments}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total</span>
          </div>
        </div>
      </div>

      {/* Transport Status */}
      <div className="glass futuristic-card border border-slate-200/60 rounded-2xl p-5 shadow-xl flex items-center gap-5 border-l-4 border-l-amber-500">
        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
          <Bus className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">School Buses</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{transport.vehicles}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active</span>
          </div>
        </div>
      </div>

      <div className="glass futuristic-card border border-slate-200/60 rounded-2xl p-5 shadow-xl flex items-center gap-5 border-l-4 border-l-purple-500">
        <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
          <Route className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Bus Routes</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">{transport.routes}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
