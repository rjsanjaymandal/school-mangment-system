"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, BookOpen, CheckCircle, IndianRupee, Calendar, FileText, AlertCircle, Users } from "lucide-react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ERPCard } from "@/components/ui/erp-card";

interface Student {
  id: string;
  admission_number: string;
  class: { name: string };
  profile: { full_name: string; avatar_url?: string };
}

interface FeeDue {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  fee_type: string;
}

interface AttendanceRecord {
  date: string;
  status: string;
}

export default function ParentDashboardPage() {
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [feeDues, setFeeDues] = useState<FeeDue[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParentData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentData } = await supabase
        .from("students")
        .select("id, admission_number, class:classes(name), profile:profiles(full_name, avatar_url)")
        .eq("profile_id", user.id)
        .single();

      if (studentData) {
        setStudent(studentData as any);

        const { data: dues } = await supabase
          .from("fee_installments")
          .select("id, amount, due_date, status, fee_type")
          .eq("student_id", studentData.id)
          .eq("status", "pending")
          .order("due_date");
        setFeeDues(dues || []);

        const { data: attendance } = await supabase
          .from("attendance")
          .select("date, status")
          .eq("student_id", studentData.id)
          .order("date", { ascending: false })
          .limit(7);
        setRecentAttendance(attendance || []);
      }
    } catch (error) {
      console.error("Error loading parent data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadParentData();
  }, [loadParentData]);

  const totalDue = feeDues.reduce((sum, f) => sum + (f.amount || 0), 0);
  const presentDays = recentAttendance.filter(a => a.status === "present").length;
  const attendancePercentage = recentAttendance.length > 0 
    ? Math.round((presentDays / recentAttendance.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-700">
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Welcome to Parent Portal</h1>
            <p className="text-purple-200 text-sm">Monitor your child&apos;s progress</p>
          </div>
        </div>
      </div>

      {student && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-blue-50">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Student Information</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
                    {student.profile?.full_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">{student.profile?.full_name}</h3>
                    <p className="text-sm text-slate-500">Adm No: {student.admission_number}</p>
                    <p className="text-sm text-slate-500">Class: {student.class?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5">
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">
                <CheckCircle className="h-4 w-4" />
                Attendance
              </div>
              <p className="text-3xl font-black text-slate-900">{attendancePercentage}%</p>
              <p className="text-xs text-slate-500">{presentDays}/{recentAttendance.length} days present</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5">
          <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <IndianRupee className="h-4 w-4" />
            Total Due
          </div>
          <p className="text-3xl font-black text-slate-900">₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{feeDues.length} pending fees</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5">
          <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <BookOpen className="h-4 w-4" />
            Academic Status
          </div>
          <p className="text-lg font-black tracking-tight text-slate-900">Active</p>
          <p className="text-xs text-slate-500">Current Session</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5">
          <div className="flex items-center gap-2 text-purple-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <Calendar className="h-4 w-4" />
            Next Event
          </div>
          <p className="text-lg font-black tracking-tight text-slate-900">Parent-Teacher</p>
          <p className="text-xs text-slate-500">Contact school for date</p>
        </div>
      </div>

      {feeDues.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-amber-50">
                <IndianRupee className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Pending Fee Dues</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Fee Type</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                  <th className="text-center p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {feeDues.map(fee => (
                  <tr key={fee.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 text-sm font-bold text-slate-700">{fee.fee_type || "Fee"}</td>
                    <td className="p-4 text-sm text-slate-600">{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : "-"}</td>
                    <td className="p-4 text-right text-sm font-black text-slate-900">₹{fee.amount?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-slate-700">View Report Card</span>
        </button>
        <button className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          <Calendar className="h-6 w-6 text-emerald-600" />
          <span className="text-sm text-slate-700">View Timetable</span>
        </button>
        <button className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          <IndianRupee className="h-6 w-6 text-amber-600" />
          <span className="text-sm text-slate-700">Pay Fees</span>
        </button>
        <button className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          <AlertCircle className="h-6 w-6 text-purple-600" />
          <span className="text-sm text-slate-700">Contact Teacher</span>
        </button>
      </div>
    </div>
  );
}