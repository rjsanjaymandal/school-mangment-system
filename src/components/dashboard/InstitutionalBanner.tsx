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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Academic Footprint */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Footprint</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">{safeMetrics.classes}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Classes / Sections</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <LayoutGrid className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departments</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">{safeMetrics.departments}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Units</span>
          </div>
        </div>
      </div>

      {/* Transport Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
        <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
          <Bus className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transport Fleet</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">{transport.vehicles}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Vans/Buses</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500">
        <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
          <Route className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Routes</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">{transport.routes}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Routes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
