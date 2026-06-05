"use client";

import { useState } from "react";
import { Check, X, Search, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Class } from "@/types/database";
import { AttendanceService } from "@/lib/services/attendance";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AttendanceFormProps {
  classes: Class[];
}

export function AttendanceForm({ classes }: AttendanceFormProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (classId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: studentsData, error } = await supabase
        .from("students")
        .select("*, profile:profiles(*)")
        .eq("class_id", classId);

      if (error) {
        throw error;
      }

      if (studentsData) {
        setStudents(studentsData.map((s) => ({ ...s, status: "present" })));
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    fetchStudents(val);
  };

  const toggleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s: any) =>
        s.id === studentId
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s,
      ),
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const date = new Date().toISOString().split("T")[0];
      const attendanceData = students.map((s) => ({
        student_id: s.id,
        class_id: selectedClass,
        status: s.status,
        date: date,
      }));

      const result =
        await AttendanceService.batchMarkAttendance(attendanceData);
      if (result) {
        toast.success(
          `Attendance for ${students.length} students recorded successfully!`,
        );
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 -mx-5 -mt-5 mb-5">
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Select Class & Date</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Class</label>
            <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
              <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Date</label>
            <div className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              disabled={loading || !selectedClass}
              className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Check List
            </button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-700">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Student List ({students.filter((s) => s.status === "present").length}/{students.length} Present)
            </h3>
            <button onClick={handleSave} disabled={loading} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
          <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student) => (
              <div
                key={student.id}
                className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-x-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 text-sm">
                    {student.profile?.first_name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      {student.profile?.first_name} {student.profile?.last_name}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Roll No: {student.roll_number || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-x-2">
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={cn(
                      "h-10 rounded-xl font-black text-[10px] uppercase tracking-widest px-4 transition-all flex items-center gap-2",
                      student.status === "present"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                        : "border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Check className="h-4 w-4" /> Present
                  </button>
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={cn(
                      "h-10 rounded-xl font-black text-[10px] uppercase tracking-widest px-4 transition-all flex items-center gap-2",
                      student.status === "absent"
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                        : "border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <X className="h-4 w-4" /> Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}