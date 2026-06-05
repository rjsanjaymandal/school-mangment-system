"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Filter, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Class } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AttendanceHistoryProps {
  classes: Class[];
}

async function readAttendanceHistory(classId: string, selectedDate: string) {
  const supabase = createClient();

  return supabase
    .from("attendance")
    .select(
      `
        *,
        student:students(
          id,
          roll_number,
          profile:profiles(first_name, last_name)
        )
      `,
    )
    .eq("class_id", classId)
    .eq("date", selectedDate);
}

export function AttendanceHistory({ classes }: AttendanceHistoryProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);

    const { data, error } = await readAttendanceHistory(selectedClass, selectedDate);

    if (error) {
      setRecords([]);
    } else {
      setRecords(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedClass) return;

    let active = true;

    const loadHistory = async () => {
      const { data, error } = await readAttendanceHistory(selectedClass, selectedDate);
      if (!active) return;

      if (error) {
        setRecords([]);
      } else {
        setRecords(data ?? []);
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [selectedClass, selectedDate]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
      absent: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400",
      late: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
      excused: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
    };
    return cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", styles[status] || "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400");
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
              <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Date</label>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-sm pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <button
            onClick={fetchHistory}
            disabled={!selectedClass}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Roll No</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student Name</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-8 w-8 rounded-xl bg-slate-200 animate-pulse" />
                      <div className="h-4 w-48 rounded-xl bg-slate-200 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="h-10 w-10 mb-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {selectedClass
                          ? "No records found for this date."
                          : "Select a class to view history."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-300">
                      {record.student?.roll_number || "N/A"}
                    </td>
                    <td className="py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-300">
                      {record.student?.profile?.first_name}{" "}
                      {record.student?.profile?.last_name}
                    </td>
                    <td className="py-4 px-4">
                      <span className={statusBadge(record.status)}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-bold">
                      {record.remarks || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}