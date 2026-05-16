"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Save, CheckCircle2, AlertCircle, Clock, Users, CalendarDays, ChevronLeft, ChevronRight, CheckCheck, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function StudentAttendancePage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: classesData, isLoading: classesLoading } = useQuery({
        queryKey: ['classes-attendance'],
        queryFn: async () => {
            const { data } = await supabase.from("classes").select("id, name").order("name");
            return data || [];
        }
    });
    const classes = classesData || [];

    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['students-attendance', selectedClassId],
        queryFn: async () => {
            if (!selectedClassId) return [];
            const { data } = await supabase
                .from("students")
                .select(`id, roll_number, profile:profiles(first_name, last_name)`)
                .eq("class_id", selectedClassId)
                .order("roll_number");
            
            return (data || []).map((s: any) => ({
                id: s.id,
                name: `${s.profile?.first_name || ""} ${s.profile?.last_name || ""}`.trim(),
                roll: s.roll_number || "-"
            }));
        },
        enabled: !!selectedClassId
    });

    const { data: existingAttendanceData } = useQuery({
        queryKey: ['attendance-check', selectedClassId, selectedDate],
        queryFn: async () => {
            if (!selectedClassId || !selectedDate) return [];
            const { data } = await supabase
                .from("attendance")
                .select("student_id, status")
                .eq("class_id", selectedClassId)
                .eq("date", selectedDate);
            return data || [];
        },
        enabled: !!selectedClassId && !!selectedDate
    });

    const students = studentsData || [];
    const existingAttendance = existingAttendanceData || [];

    const [attendance, setAttendance] = useState<Record<string, string>>({});

    // Initialize attendance only when data arrives or class changes
    useEffect(() => {
        // Guard: If we don't have students yet, just clear and wait
        if (students.length === 0) {
            setAttendance({});
            return;
        }

        if (existingAttendance.length > 0) {
            const mapped = Object.fromEntries(existingAttendance.map((a: any) => [a.student_id, a.status]));
            // Only update if the new data is different from current state
            setAttendance(prev => {
                const isDifferent = JSON.stringify(prev) !== JSON.stringify(mapped);
                return isDifferent ? mapped : prev;
            });
        } else {
            // No existing records, set default "present" for everyone
            setAttendance(prev => {
                const keys = Object.keys(prev);
                const allPresent = Object.fromEntries(students.map((s: any) => [s.id, "present"]));
                
                // If we already have the right number of students and they are initialized, don't reset
                if (keys.length === students.length && students.every(s => keys.includes(s.id))) {
                    return prev;
                }
                return allPresent;
            });
        }
    }, [existingAttendanceData, studentsData, selectedClassId, selectedDate]);

    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes, selectedClassId]);

    const filteredStudents = students.filter((s: any) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        present: Object.values(attendance).filter(v => v === "present").length,
        late: Object.values(attendance).filter(v => v === "late").length,
        absent: Object.values(attendance).filter(v => v === "absent").length,
    };

    const markAll = (status: string) => {
        const updated: Record<string, string> = {};
        students.forEach((s: any) => { updated[s.id] = status; });
        setAttendance(updated);
    };

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

            for (const record of attendanceData) {
                await supabase.from("attendance").upsert(record, { onConflict: 'student_id,date' });
            }

            toast.success("Attendance Saved", {
                description: `${stats.present} present, ${stats.late} late, ${stats.absent} absent`,
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            });
            queryClient.invalidateQueries({ queryKey: ['attendance-check'] });
        } catch (error) {
            toast.error("Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-emerald-100 flex items-center justify-center">
                        <ClipboardCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Student Attendance</h1>
                        <p className="text-sm text-slate-500">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => changeDate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Input type="date" className="w-36 h-10 border-0 text-center" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => changeDate(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-48 h-10 rounded-md"><SelectValue placeholder="Select Class" /></SelectTrigger>
                        <SelectContent>
                            {classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Total</p>
                        <p className="text-2xl font-bold">{students.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-slate-300" />
                </Card>
                <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Present</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </Card>
                <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Late</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500" />
                </Card>
                <Card className="p-4 flex items-center justify-between border-l-4 border-l-red-500">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500">Quick Mark:</span>
                <Button variant="outline" size="sm" className="gap-2 text-emerald-600" onClick={() => markAll("present")}>
                    <CheckCheck className="h-4 w-4" /> All Present
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600" onClick={() => markAll("absent")}>
                    <XCircle className="h-4 w-4" /> All Absent
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-amber-600" onClick={() => markAll("late")}>
                    <Clock className="h-4 w-4" /> All Late
                </Button>
                
                <div className="flex-1" />
                
                <div className="relative w-64">
                    <Input placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 pl-9" />
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
            </div>

            {/* Attendance List */}
            <Card className="overflow-hidden">
                <div className="flex items-center px-4 py-3 border-b bg-slate-50">
                    <div className="w-16 text-xs font-medium text-slate-500">Roll</div>
                    <div className="flex-1 text-xs font-medium text-slate-500">Student</div>
                    <div className="w-48 text-center text-xs font-medium text-slate-500">Status</div>
                </div>
                <div className="max-h-[60vh] overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-slate-500">Loading...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-slate-500">
                            {students.length === 0 ? "No students in this class" : "No matching students"}
                        </div>
                    ) : (
                        filteredStudents.map((s: any, idx: number) => (
                            <div key={s.id} className={cn("flex items-center px-4 py-3 border-b hover:bg-slate-50", idx % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                                <div className="w-16 text-center">
                                    <span className="text-sm font-mono text-slate-600">{s.roll}</span>
                                </div>
                                <div className="flex-1 flex items-center gap-3">
                                    <StudentAvatar name={s.name} size="sm" />
                                    <span className="font-medium text-sm">{s.name}</span>
                                </div>
                                <div className="w-48 flex justify-center gap-2">
                                    {[
                                        { id: "present", label: "Present", color: "emerald" },
                                        { id: "late", label: "Late", color: "amber" },
                                        { id: "absent", label: "Absent", color: "red" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setAttendance(prev => ({ ...prev, [s.id]: opt.id }))}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                                attendance[s.id] === opt.id
                                                    ? opt.color === "emerald" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                                                      opt.color === "amber" ? "bg-amber-100 text-amber-700 border border-amber-300" :
                                                      "bg-red-100 text-red-700 border border-red-300"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
                    <span className="text-sm text-slate-500">{filteredStudents.length} of {students.length} students</span>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 gap-2">
                        <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Attendance"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}