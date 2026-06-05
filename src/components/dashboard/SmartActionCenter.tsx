"use client";

import { AlertCircle, ArrowRight, Bell, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardAlert } from "@/app/actions/dashboard-metrics";

interface SmartActionCenterProps {
  alerts: DashboardAlert[];
}

export function SmartActionCenter({ alerts }: SmartActionCenterProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-[0.15em]">
          <Bell className="h-4 w-4 text-rose-500 animate-pulse" />
          Smart Action Center
        </h3>
        <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full uppercase">
          {alerts.length} Pending Actions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(
              "glass futuristic-card rounded-2xl p-4 border flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-lg",
              alert.type === 'critical' ? "border-l-4 border-l-rose-500 bg-rose-50/30" : 
              alert.type === 'warning' ? "border-l-4 border-l-amber-500 bg-amber-50/30" : 
              "border-l-4 border-l-blue-500 bg-blue-50/30"
            )}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  alert.type === 'critical' ? "bg-rose-100 text-rose-600" : 
                  alert.type === 'warning' ? "bg-amber-100 text-amber-600" : 
                  "bg-blue-100 text-blue-600"
                )}>
                  {alert.type === 'critical' ? <TriangleAlert className="h-4 w-4" /> : 
                   alert.type === 'warning' ? <AlertCircle className="h-4 w-4" /> : 
                   <Info className="h-4 w-4" />}
                </div>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{alert.title}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">{alert.description}</p>
            </div>
            
            {alert.action && (
              <button className={cn(
                "mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest group",
                alert.type === 'critical' ? "text-rose-600" : 
                alert.type === 'warning' ? "text-amber-600" : 
                "text-blue-600"
              )}>
                {alert.action}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
