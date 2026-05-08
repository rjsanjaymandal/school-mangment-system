"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, FileText, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Event {
  id: string;
  title: string;
  date: string;
  type: "exam" | "holiday" | "event";
}

export function UpcomingEventsWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const today = new Date().toISOString().split("T")[0];
        
        const [examsRes, eventsRes] = await Promise.all([
          supabase
            .from("exams")
            .select("id, exam_date, subject:subjects(name)")
            .gte("exam_date", today)
            .eq("status", "scheduled")
            .order("exam_date", { ascending: true })
            .limit(3),
          supabase
            .from("events")
            .select("id, title, event_date")
            .gte("event_date", today)
            .order("event_date", { ascending: true })
            .limit(2),
        ]);

        const combined: Event[] = [
          ...(examsRes.data?.map((e: any) => ({
            id: e.id,
            title: e.subject?.name ? `${e.subject.name} Exam` : "Exam",
            date: e.exam_date,
            type: "exam" as const,
          })) || []),
          ...(eventsRes.data?.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.event_date,
            type: "event" as const,
          })) || []),
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

        setEvents(combined);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "exam":
        return FileText;
      case "holiday":
        return Calendar;
      default:
        return Calendar;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-rose-100 text-rose-600";
      case "holiday":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const Icon = getIcon(event.type);
        const colorClass = getColor(event.type);
        return (
          <div
            key={event.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(event.date)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}