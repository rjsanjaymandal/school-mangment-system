"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IndianRupee, TrendingUp } from "lucide-react";

export function LiveCollectionPill() {
  const supabase = createClient();
  const [todayCollection, setTodayCollection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodayCollection = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from("payments")
        .select("amount_paid")
        .eq("status", "completed")
        .gte("payment_date", today);

      const total = data?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
      setTodayCollection(total);
      setIsLoading(false);
    };

    fetchTodayCollection();

    // Set up real-time subscription
    const channel = supabase
      .channel('live-payments')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'payments',
        filter: "status=eq.completed"
      }, (payload) => {
        setTodayCollection(prev => prev + (payload.new.amount_paid || 0));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
        <div className="h-2 w-2 bg-slate-300 rounded-full" />
        <span className="text-xs text-slate-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
      <div className="flex items-center gap-1.5">
        <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700">
          ₹{todayCollection.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-1 text-emerald-600">
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs">Today</span>
      </div>
    </div>
  );
}