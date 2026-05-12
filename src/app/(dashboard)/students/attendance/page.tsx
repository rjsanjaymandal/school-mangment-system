"use client";

import { useState, useEffect } from "react";
import { 
    ClipboardCheck, Calendar as CalendarIcon, Filter, Save, 
    CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AttendanceService } from "@/lib/services/attendance";

export default function StudentAttendancePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});

    const supabase = createClient();

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            const { data } = await supabase.from("classes").select("id, name").order("name");
            if (data) {
                setClasses(data);
                if (data.length > 0) setSelectedClassId(data[0].id);
            }
        };
        fetchClasses();
    }, []);

    // Fetch students when class changes
    useEffect(() => {
        if (!selectedClassId) return;
        const fetchStudents = async () => {
            setIsLoading(true);
            const { data } = await supabase
                .from("students")
                .select(`
                    id, 
                    roll_number, 
                    profile:profiles(first_name, last_name)
                `)
                .eq("class_id", selectedClassId)
                .order("roll_number");
            
            if (data) {
                const mapped = (data as any[]).map(s => ({
                    id: s.id,
                    name: `${s.profile?.first_name || ""} ${s.profile?.last_name || ""}`.trim(),
                    roll: s.roll_number || "-"
                }));
                setStudents(mapped);
                setAttendance(Object.fromEntries(mapped.map(s => [s.id, "present"])));
            }
            setIsLoading(false);
        };
        fetchStudents();
    }, [selectedClassId]);

    const handleSave = async () => {
        if (students.length === 0) return;
        setIsSaving(true);
        try {
            const attendanceData = Object.entries(attendance).map(([student_id, status]) => ({
                student_id,
                class_id: selectedClassId,
                status,
                date: selectedDate
            }));

            const res = await AttendanceService.batchMarkAttendance(attendanceData);
            if (res && "error" in res) {
                toast.error("Failed to synchronize attendance.");
            } else {
                toast.success("Attendance Synchronized", {
                    description: `Successfully logged for ${students.length} students on ${selectedDate}.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                });
            }
        } catch (error) {
            toast.error("An unexpected error occurred during synchronization.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-emerald-50 flex items-center justify-center">
                        <ClipboardCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                        <p className="text-sm text-slate-500">Daily compliance monitor</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Input 
                        type="date" 
                        className="w-40"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Select 
                        value={selectedClassId}
                        onValueChange={setSelectedClassId}
                    >
                        <SelectTrigger className="w-48 h-12 rounded-md bg-white border-slate-200">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                            {classes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-6 rounded-md bg-emerald-600 text-white font-medium text-sm gap-2 shadow-sm hover:bg-emerald-700"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Syncing..." : "Save Daily Log"}
                    </Button>
                </div>

            {/* Attendance Logger Table */}
            <ERPCard accentColor="emerald">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase w-16 text-center">Roll</th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Student</th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-20 text-center text-slate-500">
                                        Querying student registry...
                                    </td>
                                </tr>
                            ) : students.length > 0 ? (
                                students.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-slate-500">{s.roll}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <StudentAvatar 
                                                    name={s.name} 
                                                    classId={selectedClassId} 
                                                    className="h-9 w-9 text-xs"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                                                    <p className="text-xs text-slate-400">{s.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-x-4">
                                                {[
                                                    { id: "present", label: "P", color: "emerald", icon: CheckCircle2 },
                                                    { id: "late", label: "L", color: "amber", icon: Clock },
                                                    { id: "absent", label: "A", color: "rose", icon: AlertCircle },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setAttendance(prev => ({ ...prev, [s.id]: opt.id }))}
                                                        className={cn(
                                                            "flex flex-col items-center gap-y-1 group/btn",
                                                            attendance[s.id] === opt.id ? "scale-110" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                            attendance[s.id] === opt.id 
                                                                ? `bg-${opt.color}-500 text-white shadow-lg shadow-${opt.color}-500/20` 
                                                                : `bg-slate-100 text-slate-400`
                                                        )}>
                                                            <opt.icon className="h-5 w-5" />
                                                        </div>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            attendance[s.id] === opt.id ? `text-${opt.color}-600` : "text-slate-400"
                                                        )}>
                                                            {opt.id}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-20 text-center text-slate-500">
                                        No students found in this class registry.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ERPCard>

            <div className="flex items-center justify-center">
                <ERPCard accentColor="slate">
                    <div className="flex items-center gap-x-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Present: {Object.values(attendance).filter(v => v === "present").length}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-x-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Late: {Object.values(attendance).filter(v => v === "late").length}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-x-3">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Absent: {Object.values(attendance).filter(v => v === "absent").length}</span>
                    </div>
                </ERPCard>
            </div>
        </div>
    );
}
