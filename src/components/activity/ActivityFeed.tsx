"use client";

import { useState, useEffect } from "react";
import { Activity, UserPlus, CreditCard, BookOpen, FileText, Calendar, GraduationCap, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const [paymentsRes, enrollmentsRes, attendanceRes] = await Promise.all([
          supabase.from("payments").select("id, amount_paid, payment_date, student:profiles(full_name)").order("payment_date", { ascending: false }).limit(5),
          supabase.from("class_enrollments").select("id, student_id, class_id, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("attendance").select("id, date, status").order("date", { ascending: false }).limit(5),
        ]);

        const items: ActivityItem[] = [];

        paymentsRes.data?.forEach((p: any) => {
          items.push({
            id: `payment-${p.id}`,
            type: "payment",
            description: `Payment of ₹${p.amount_paid} received from ${p.student?.full_name || "Student"}`,
            timestamp: p.payment_date,
            icon: CreditCard,
            color: "emerald",
          });
        });

        enrollmentsRes.data?.forEach((e: any) => {
          items.push({
            id: `enroll-${e.id}`,
            type: "enrollment",
            description: `New student enrolled`,
            timestamp: e.created_at,
            icon: UserPlus,
            color: "blue",
          });
        });

        const sorted = items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
        setActivities(sorted);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivity();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Clock className="h-5 w-5 animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading activity...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Activity className="h-5 w-5 mx-auto mb-2 opacity-30" />
        <p className="text-xs">No recent activity</p>
      </div>
    );
  }

  const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  rose: { bg: "bg-rose-100", text: "text-rose-600" },
};

return (
    <div className="space-y-3 p-4">
      {activities.map((item) => {
        const colors = colorMap[item.color] || colorMap.blue;
        return (
          <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`h-8 w-8 rounded-full ${colors.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.description}</p>
              <p className="text-[10px] text-muted-foreground">{formatTime(item.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}