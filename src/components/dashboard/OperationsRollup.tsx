"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ERPCard } from "@/components/ui/erp-card";
import { Users, UserSquare2, Zap } from "lucide-react";

interface AttendanceSnapProps {
  title: string;
  data: {
    present: number;
    absent: number;
    leave: number;
    total: number;
  };
  icon: any;
  color: string;
}

function AttendanceSnap({ title, data, icon: Icon, color }: AttendanceSnapProps) {
  const chartData = [
    { name: "Present", value: data.present, color: "#10b981" }, // Emerald 500
    { name: "Absent", value: data.absent, color: "#ef4444" },  // Red 500
    { name: "Leave", value: data.leave, color: "#f59e0b" },    // Amber 500
  ].filter(d => d.value > 0);

  const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;

  return (
    <div className="flex items-center gap-6 p-4">
      <div className="relative h-24 w-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={30}
              outerRadius={45}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-slate-900">{percentage}%</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 rounded-lg bg-${color}-50 text-${color}-600`}>
            <Icon className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">{title}</h4>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Present</span>
            <span className="text-xs font-black text-emerald-600">{data.present}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Absent</span>
            <span className="text-xs font-black text-red-600">{data.absent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Leave</span>
            <span className="text-xs font-black text-amber-600">{data.leave}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
            <span className="text-xs font-black text-slate-900">{data.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OperationsRollup({ metrics }: { metrics: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ERPCard 
        title="Student Attendance" 
        description="Daily presence of students" 
        icon={<Users className="h-4 w-4" />}
        color="emerald"
        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
      >
        <AttendanceSnap 
          title="Student Today" 
          data={metrics.attendance.student} 
          icon={Users} 
          color="emerald" 
        />
      </ERPCard>
      
      <ERPCard 
        title="Staff Attendance" 
        description="Daily presence of staff members" 
        icon={<UserSquare2 className="h-4 w-4" />}
        color="blue"
        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
      >
        <AttendanceSnap 
          title="Staff Today" 
          data={metrics.attendance.staff} 
          icon={UserSquare2} 
          color="blue" 
        />
      </ERPCard>
    </div>
  );
}
