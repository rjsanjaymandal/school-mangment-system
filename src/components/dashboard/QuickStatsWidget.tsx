"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Users, BookOpen, CreditCard, Clock, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: any;
}

export function QuickStatsWidget() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        
        const [studentsRes, feesRes, attendanceRes, examsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
          supabase.from("payments").select("amount_paid").eq("status", "completed").gte("payment_date", weekAgo),
          supabase.from("attendance").select("id", { count: "exact", head: true }).eq("date", today).eq("status", "present"),
          supabase.from("exams").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
        ]);

        const totalCollected = feesRes.data?.reduce((sum, f) => sum + (f.amount_paid || 0), 0) || 0;

        setStats([
          { label: "Students", value: studentsRes.count || 0, change: 5, trend: "up", icon: GraduationCap },
          { label: "Fee Collected (7d)", value: `₹${totalCollected.toLocaleString()}`, change: 12, trend: "up", icon: CreditCard },
          { label: "Present Today", value: attendanceRes.count || 0, trend: "neutral", icon: Users },
          { label: "Upcoming Exams", value: examsRes.count || 0, trend: "down", icon: BookOpen },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-muted h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className="h-5 w-5 text-muted-foreground" />
            {stat.change !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-rose-500" : "text-muted-foreground"}`}>
                {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3" />}
                {stat.trend === "neutral" && <Minus className="h-3 w-3" />}
                <span>{stat.change > 0 ? "+" : ""}{stat.change}%</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}