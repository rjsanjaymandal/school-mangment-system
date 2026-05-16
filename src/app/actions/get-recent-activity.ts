"use server";

import { createClient } from "@/lib/supabase/server";

export type ActivityItem = {
  id: string;
  type: 'attendance' | 'payment' | 'library' | 'behavior';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
};

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();

  // Fetch latest events from 4 different areas
  const [attendanceRes, paymentsRes, libraryRes, behaviorRes] = await Promise.all([
    supabase.from("attendance").select("id, status, date, profiles(full_name)").order("created_at", { ascending: false }).limit(3),
    supabase.from("payments").select("id, amount_paid, payment_date, students(profiles(full_name))").eq("status", "completed").order("created_at", { ascending: false }).limit(3),
    supabase.from("library_transactions").select("id, status, library_books(title), profiles(full_name)").order("created_at", { ascending: false }).limit(3),
    supabase.from("student_conduct").select("id, type, points, profiles(full_name)").order("created_at", { ascending: false }).limit(3)
  ]);

  const activities: ActivityItem[] = [];

  // 1. Process Attendance
  (attendanceRes.data || []).forEach((a: any) => {
    activities.push({
      id: `att-${a.id}`,
      type: 'attendance',
      title: `Attendance Marked`,
      subtitle: `${a.profiles?.full_name || 'Student'} was marked ${a.status}`,
      time: a.date,
      status: a.status
    });
  });

  // 2. Process Payments
  (paymentsRes.data || []).forEach((p: any) => {
    activities.push({
      id: `pay-${p.id}`,
      type: 'payment',
      title: `Fee Received`,
      subtitle: `₹${p.amount_paid.toLocaleString()} paid by ${p.students?.profiles?.full_name || 'Student'}`,
      time: p.payment_date,
    });
  });

  // 3. Process Library
  (libraryRes.data || []).forEach((l: any) => {
    activities.push({
      id: `lib-${l.id}`,
      type: 'library',
      title: `Library Update`,
      subtitle: `"${l.library_books?.title}" ${l.status} to ${l.profiles?.full_name || 'Member'}`,
      time: 'Recent',
      status: l.status
    });
  });

  // 4. Process Behavior
  (behaviorRes.data || []).forEach((b: any) => {
    activities.push({
      id: `beh-${b.id}`,
      type: 'behavior',
      title: `Conduct Logged`,
      subtitle: `${b.type} (${b.points > 0 ? '+' : ''}${b.points} pts) for ${b.profiles?.full_name || 'Student'}`,
      time: 'Recent',
    });
  });

  // Return sorted by type/relevance (simple for now)
  return activities.slice(0, 8);
}
