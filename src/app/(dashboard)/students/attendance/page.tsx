"use client";

import { useState } from "react";
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
import { AttendanceService } from "@/lib/services/attendance";

export default function StudentAttendancePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState("10-A");
    const [isSaving, setIsSaving] = useState(false);

    // Mock student list for attendance (should ideally be fetched based on selectedClassId)
    const students = [
        { id: "ADM-2026-0001", name: "Ethan Hunt", roll: "22" },
        { id: "ADM-2026-0002", name: "Sarah Connor", roll: "14" },
        { id: "ADM-2026-0003", name: "James Bond", roll: "07" },
        { id: "ADM-2026-0004", name: "Ellen Ripley", roll: "18" },
        { id: "ADM-2026-0005", name: "Luke Skywalker", roll: "31" },
    ];

    const [attendance, setAttendance] = useState<Record<string, string>>(
        Object.fromEntries(students.map(s => [s.id, "present"]))
    );

    const handleSave = async () => {
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
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10-A">Grade 10-A</SelectItem>
                                <SelectItem value="09-B">Grade 09-B</SelectItem>
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
                            {students.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm font-medium text-slate-500">{s.roll}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <StudentAvatar 
                                                name={s.name} 
                                                classId="attendance-mock" 
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
                            ))}
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
