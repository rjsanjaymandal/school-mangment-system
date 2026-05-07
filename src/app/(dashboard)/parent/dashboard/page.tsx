"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, BookOpen, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  useEffect(() => {
    loadParentData();
  }, []);

  async function loadParentData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get parent's linked students
      const { data: studentData } = await supabase
        .from("students")
        .select("id, admission_number, class:classes(name), profile:profiles(full_name, avatar_url)")
        .eq("profile_id", user.id)
        .single();

      if (studentData) {
        setStudent(studentData as any);

        // Get fee dues
        const { data: dues } = await supabase
          .from("fee_installments")
          .select("id, amount, due_date, status, fee_type")
          .eq("student_id", studentData.id)
          .eq("status", "pending")
          .order("due_date");
        setFeeDues(dues || []);

        // Get recent attendance
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
  }

  const totalDue = feeDues.reduce((sum, f) => sum + (f.amount || 0), 0);
  const presentDays = recentAttendance.filter(a => a.status === "present").length;
  const attendancePercentage = recentAttendance.length > 0 
    ? Math.round((presentDays / recentAttendance.length) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome to Parent Portal</h1>
            <p className="text-purple-100">Monitor your child's progress</p>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      {student && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <ERPCard accentColor="blue">
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {student.profile?.full_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{student.profile?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Adm No: {student.admission_number}</p>
                    <p className="text-sm text-muted-foreground">Class: {student.class?.name}</p>
                  </div>
                </div>
              </CardContent>
            </ERPCard>
          </div>
          
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Attendance</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{attendancePercentage}%</p>
              <p className="text-xs text-emerald-600">{presentDays}/{recentAttendance.length} days present</p>
            </div>
          </div>
        </div>
      )}

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <DollarSign className="h-5 w-5" />
            <span className="font-medium">Total Due</span>
          </div>
          <p className="text-3xl font-bold text-amber-700 mt-1">₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-amber-600">{feeDues.length} pending fees</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Academic Status</span>
          </div>
          <p className="text-xl font-bold text-blue-700 mt-1">Active</p>
          <p className="text-xs text-blue-600">Current Session</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Next Event</span>
          </div>
          <p className="text-xl font-bold text-purple-700 mt-1">Parent-Teacher</p>
          <p className="text-xs text-purple-600">Contact school for date</p>
        </div>
      </div>

      {/* Fee Dues Table */}
      {feeDues.length > 0 && (
        <ERPCard accentColor="amber">
          <CardHeader>
            <CardTitle>Pending Fee Dues</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-medium">Fee Type</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {feeDues.map(fee => (
                  <tr key={fee.id} className="border-t">
                    <td className="p-4">{fee.fee_type || "Fee"}</td>
                    <td className="p-4">{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : "-"}</td>
                    <td className="p-4 text-right font-medium">₹{fee.amount?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </ERPCard>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-sm">View Report Card</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Calendar className="h-6 w-6 text-green-600" />
          <span className="text-sm">View Timetable</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <DollarSign className="h-6 w-6 text-amber-600" />
          <span className="text-sm">Pay Fees</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <AlertCircle className="h-6 w-6 text-purple-600" />
          <span className="text-sm">Contact Teacher</span>
        </Button>
      </div>
    </div>
  );
}