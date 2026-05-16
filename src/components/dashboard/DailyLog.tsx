"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentActivity } from "@/app/actions/get-recent-activity";
import { ClipboardCheck, CreditCard, BookOpen, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyLog() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: () => getRecentActivity(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const icons = {
    attendance: <ClipboardCheck className="h-4 w-4 text-emerald-600" />,
    payment: <CreditCard className="h-4 w-4 text-blue-600" />,
    library: <BookOpen className="h-4 w-4 text-purple-600" />,
    behavior: <Star className="h-4 w-4 text-amber-600" />,
  };

  const bgColors = {
    attendance: "bg-emerald-50 border-emerald-100",
    payment: "bg-blue-50 border-blue-100",
    library: "bg-purple-50 border-purple-100",
    behavior: "bg-amber-50 border-amber-100",
  };

  return (
    <div className="glass futuristic-card rounded-2xl border border-slate-200/60 overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-[0.15em]">
          <Clock className="h-4 w-4 text-slate-400" />
          Daily Log
        </h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
      </div>
      
      <div className="divide-y divide-slate-50 max-h-[400px] overflow-auto">
        {activity?.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">
            No activity logged yet
          </div>
        ) : (
          activity?.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
              <div className={cn("p-2 rounded-xl border shrink-0", bgColors[item.type])}>
                {icons[item.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{item.title}</p>
                <p className="text-sm font-bold text-slate-800 truncate leading-tight mt-0.5">{item.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {item.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
