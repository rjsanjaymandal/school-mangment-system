"use client";

import { useState, useMemo } from "react";
import {
    Check, X, Clock, Search, Users, ClipboardCheck, Calendar, BarChart3,
    ChevronDown, UserCheck, UserX, AlertTriangle, TrendingUp, Filter, Download, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { markAttendance, getAttendanceByClassAndDate } from "@/app/actions/attendance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttendanceDashboardProps {
    classes: any[];
    students: any[];
    todayAttendance: any[];
    weekAttendance: any[];
    currentUserId: string;
    userRole?: string | null;
    isStudent?: boolean;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

export function AttendanceDashboard({
    classes, students, todayAttendance, weekAttendance, currentUserId, userRole, isStudent = false
}: AttendanceDashboardProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [studentRecords, setStudentRecords] = useState<Record<string, AttendanceStatus>>({});
    const [studentsLoaded, setStudentsLoaded] = useState(false);

    // History state
    const [historyClass, setHistoryClass] = useState(isStudent && classes.length > 0 ? classes[0].id : "");
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);
    const [historyRecords, setHistoryRecords] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Auto-load for students
    useState(() => {
        if (isStudent && classes.length > 0) {
            const fetchHistory = async () => {
                setHistoryLoading(true);
                const result = await getAttendanceByClassAndDate(classes[0].id, historyDate);
                if (result.success && result.data) {
                    // For student, filter to only their own record
                    const studentId = students[0]?.id;
                    setHistoryRecords(result.data.filter((r: any) => r.student_id === studentId));
                }
                setHistoryLoading(false);
            };
            fetchHistory();
        }
    });

    // Computed stats
    const weekTotal = weekAttendance.length;
    const weekPresent = weekAttendance.filter(a => a.status === "present").length;
    const weekAbsent = weekAttendance.filter(a => a.status === "absent").length;
    const weekLate = weekAttendance.filter(a => a.status === "late").length;
    const weekRate = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;

    const todayPresent = todayAttendance.filter(a => a.status === "present").length;
    const todayAbsent = todayAttendance.filter(a => a.status === "absent").length;
    const todayTotal = todayAttendance.length;

    // Filter students by class
    const classStudents = useMemo(() => {
        if (!selectedClass) return [];
        return students.filter(s => s.class_id === selectedClass);
    }, [selectedClass, students]);

    // Filter by search
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return classStudents;
        const q = searchQuery.toLowerCase();
        return classStudents.filter(s =>
            `${s.profile?.first_name} ${s.profile?.last_name}`.toLowerCase().includes(q) ||
            (s.admission_number || "").toLowerCase().includes(q)
        );
    }, [classStudents, searchQuery]);

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setStudentsLoaded(false);
        // Pre-fill with existing attendance for selected date
        loadExistingAttendance(classId, selectedDate);
    };

    const loadExistingAttendance = async (classId: string, date: string) => {
        setLoading(true);
        const result = await getAttendanceByClassAndDate(classId, date);
        const records: Record<string, AttendanceStatus> = {};
        if (result.success && result.data) {
            result.data.forEach((r: any) => {
                records[r.student_id] = r.status as AttendanceStatus;
            });
        }
        // Fill missing students as present by default
        students.filter(s => s.class_id === classId).forEach(s => {
            if (!records[s.id]) records[s.id] = "present";
        });
        setStudentRecords(records);
        setStudentsLoaded(true);
        setLoading(false);
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        if (selectedClass) {
            loadExistingAttendance(selectedClass, date);
        }
    };

    const setStatus = (studentId: string, status: AttendanceStatus) => {
        setStudentRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const markAllPresent = () => {
        const updated: Record<string, AttendanceStatus> = {};
        classStudents.forEach(s => { updated[s.id] = "present"; });
        setStudentRecords(updated);
    };

    const markAllAbsent = () => {
        const updated: Record<string, AttendanceStatus> = {};
        classStudents.forEach(s => { updated[s.id] = "absent"; });
        setStudentRecords(updated);
    };

    const handleSave = async () => {
        if (!selectedClass) return;
        setLoading(true);
        const records = Object.entries(studentRecords).map(([studentId, status]) => ({
            student_id: studentId,
            status,
        }));
        const result = await markAttendance({
            class_id: selectedClass,
            date: selectedDate,
            records,
            marked_by: currentUserId,
        });
        setLoading(false);
        if (result.success) {
            toast.success(`Attendance saved for ${records.length} students!`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to save attendance");
        }
    };

    const fetchHistory = async () => {
        if (!historyClass || !historyDate) return;
        setHistoryLoading(true);
        const result = await getAttendanceByClassAndDate(historyClass, historyDate);
        if (result.success) {
            setHistoryRecords(result.data || []);
        }
        setHistoryLoading(false);
    };

    const handleExportCSV = () => {
        if (historyRecords.length === 0) return;
        const rows = [
            ["Student", "Roll No", "Status", "Date"],
            ...historyRecords.map(r => [
                `${r.student?.profile?.first_name} ${r.student?.profile?.last_name}`,
                r.student?.admission_number || "N/A",
                r.status,
                historyDate,
            ]),
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-${historyDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const presentCount = Object.values(studentRecords).filter(s => s === "present").length;
    const absentCount = Object.values(studentRecords).filter(s => s === "absent").length;
    const lateCount = Object.values(studentRecords).filter(s => s === "late").length;
    const excusedCount = Object.values(studentRecords).filter(s => s === "excused").length;

    const statusButton = (studentId: string, status: AttendanceStatus, icon: React.ReactNode, label: string, activeColor: string) => (
        <button
            onClick={() => setStatus(studentId, status)}
            className={cn(
                "px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-x-1",
                studentRecords[studentId] === status
                    ? `${activeColor} text-white shadow-sm scale-105`
                    : "bg-background border border-border text-muted-foreground hover:bg-accent"
            )}
        >
            {icon}{label}
        </button>
    );

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
                <div className="flex items-center gap-x-8">
                    <div className="h-16 w-16 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-lg group hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                        <Users className="h-8 w-8 transition-all duration-300" />
                    </div>
                    <div>
                        <div className="relative">
                            <h2 className="text-4xl font-bold uppercase tracking-tight text-foreground leading-none">
                                Attendance <span className="text-primary italic">Records</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/40 mt-3 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" /> 
                            {isStudent ? "View your attendance" : "Mark today's attendance"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Matrix Stats Grid */}
            <div className="grid gap-8 md:grid-cols-4 reveal-2 relative z-10">
                <div className="group relative transition-all duration-300">
                    <div className="relative bg-card p-6 border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/50 transition-all">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-primary/60 mb-2 italic">Weekly Attendance</p>
                                <h3 className="text-4xl font-black text-foreground italic leading-none">{weekRate}%</h3>
                            </div>
                            <TrendingUp className="h-8 w-8 text-primary opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                        <div className="mt-6 h-[2px] w-full bg-primary/10 not-skew-x relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary emerald-glow transition-all duration-1000" style={{ width: `${weekRate}%` }} />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-primary group-hover:opacity-10 transition-all duration-700">RATE</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-primary/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative bg-card p-8 border border-border rounded-lg shadow-sm overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Today Present</p>
                                <h3 className="text-4xl font-black text-foreground italic leading-none">{todayPresent}</h3>
                            </div>
                            <UserCheck className="h-8 w-8 text-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse" />
                        </div>
                        <p className="text-[10px] font-mono font-black text-primary/60 uppercase tracking-[0.2em] mt-6 not-skew-x flex items-center gap-2">
                           <Check className="h-3 w-3" /> OF {todayTotal} MARKED
                        </p>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-primary/40 group-hover:opacity-10 transition-all duration-700">LIVE</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-red-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-red-500/10 group-hover:border-red-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Today Absent</p>
                                <h3 className="text-4xl font-black text-red-500 italic leading-none">{todayAbsent}</h3>
                            </div>
                            <UserX className="h-8 w-8 text-red-500/40 group-hover:text-red-500 transition-colors" />
                        </div>
                        <p className="text-[10px] font-mono font-black text-red-500/60 uppercase tracking-[0.2em] mt-6 not-skew-x flex items-center gap-2 italic">
                           <X className="h-3 w-3" /> Follow-up Required
                        </p>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-red-500/40 group-hover:opacity-10 transition-all duration-700">FAIL</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-amber-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-amber-500/10 group-hover:border-amber-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Weekly Late</p>
                                <h3 className="text-4xl font-black text-amber-500 italic leading-none">{weekLate}</h3>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <p className="text-[10px] font-mono font-black text-amber-500/60 uppercase tracking-[0.2em] mt-6 not-skew-x flex items-center gap-2 italic">
                           <Clock className="h-3 w-3" /> LAST 7 DAYS
                        </p>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-amber-500/40 group-hover:opacity-10 transition-all duration-700">WARN</div>
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <Tabs defaultValue={isStudent ? "history" : "mark"} className="space-y-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <TabsList className="bg-muted/50 border border-border p-1 rounded-lg h-auto w-fit">
                        <div className="not-skew-x flex gap-2">
                            {!isStudent && (
                                <TabsTrigger value="mark" className="rounded-md px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-wide text-[11px] transition-all gap-x-2 italic group">
                                    <ClipboardCheck className="h-4 w-4 group-data-[state=active]:animate-bounce" /> MARK ATTENDANCE
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="history" className="rounded-none px-10 py-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] transition-all gap-x-3 italic group">
                                <Calendar className="h-4 w-4 group-data-[state=active]:animate-spin-slow" /> ATTENDANCE HISTORY
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="rounded-none px-10 py-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] transition-all gap-x-3 italic group">
                                <BarChart3 className="h-4 w-4" /> ANALYTICS
                            </TabsTrigger>
                        </div>
                    </TabsList>

                    {isAdminOrTeacher && (
                        <div className="flex items-center gap-4">
                             <Button variant="outline" onClick={handleExportCSV} className="h-12 px-6 rounded-lg border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary uppercase font-bold tracking-wide text-[10px] transition-all">
                                <span className="flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</span>
                             </Button>
                        </div>
                    )}
                </div>

                {/* MARK ATTENDANCE TAB */}
                <TabsContent value="mark" className="space-y-10 animate-in slide-in-from-bottom-2 duration-700 mt-0">
                    <div className="glass-panel p-8 border-primary/10 skew-x-[-12deg] rounded-none">
                        <div className="not-skew-x flex flex-wrap gap-8 items-end">
                            <div className="space-y-4 flex-1 min-w-[240px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 bg-primary animate-pulse" /> SELECT CLASS
                                </Label>
                                <Select value={selectedClass} onValueChange={handleClassChange}>
                                    <SelectTrigger className="h-14 rounded-none bg-primary/5 border-primary/20 font-mono font-black uppercase text-[11px] tracking-widest focus:ring-primary/40">
                                        <SelectValue placeholder="SELECT CLASS NODE" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-3xl border-primary/20 rounded-none">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="font-mono font-black uppercase text-[10px] tracking-widest focus:bg-primary focus:text-primary-foreground">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4 flex-1 min-w-[240px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 bg-primary" /> SELECT DATE
                                </Label>
                                <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="h-14 rounded-none bg-primary/5 border-primary/20 font-mono font-black text-[11px] tracking-widest focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-4 flex-[2] min-w-[320px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 bg-primary" /> SEARCH STUDENT
                                </Label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="SEARCH BY NAME OR ADMISSION NO..." className="h-14 pl-12 rounded-none bg-primary/5 border-primary/20 font-mono font-black text-[11px] tracking-widest placeholder:text-foreground/10 focus:border-primary transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {studentsLoaded && classStudents.length > 0 && (
                        <div className="space-y-8 reveal-3">
                            {/* Matrix Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-6 glass-panel p-6 border-primary/5 skew-x-[-12deg] rounded-none">
                                <div className="not-skew-x flex items-center gap-4">
                                    <Button onClick={markAllPresent} variant="outline" className="h-12 px-6 rounded-none border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground font-black uppercase tracking-widest text-[9px] transition-all gap-2 italic">
                                        <Check className="h-3.5 w-3.5" /> MARK ALL PRESENT
                                    </Button>
                                    <Button onClick={markAllAbsent} variant="outline" className="h-12 px-6 rounded-none border-red-500/20 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white font-black uppercase tracking-widest text-[9px] transition-all gap-2 italic">
                                        <X className="h-3.5 w-3.5" /> MARK ALL ABSENT
                                    </Button>
                                </div>
                                <div className="not-skew-x flex items-center gap-8 border-l border-primary/10 pl-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-mono font-black text-primary/40 uppercase tracking-widest">PRESENT</span>
                                        <span className="text-xl font-black text-primary italic leading-none">{presentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-mono font-black text-red-500/40 uppercase tracking-widest">ABSENT</span>
                                        <span className="text-xl font-black text-red-500 italic leading-none">{absentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-mono font-black text-amber-500/40 uppercase tracking-widest">DELAYED</span>
                                        <span className="text-xl font-black text-amber-500 italic leading-none">{lateCount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Personnel Matrix List */}
                            <div className="space-y-4">
                                {filteredStudents.length === 0 ? (
                                    <div className="bg-card p-12 text-center border border-border rounded-xl shadow-sm">
                                        <div className="not-skew-x">
                                            <Search className="h-12 w-12 mx-auto text-foreground/10 mb-6" />
                                            <h3 className="font-black text-xl text-foreground/30 uppercase tracking-[0.3em] italic leading-none">NO STUDENTS FOUND</h3>
                                            <p className="text-[9px] font-mono font-black text-primary/40 uppercase tracking-[0.2em] mt-3 italic">TRY ANOTHER SEARCH TERM</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {filteredStudents.map((student, idx) => (
                                            <div key={student.id} className="group relative transition-all duration-300 hover:translate-x-2">
                                                <div className="absolute inset-y-0 -left-1 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="glass-panel p-6 border-primary/5 skew-x-[-12deg] rounded-none hover:border-primary/20 hover:bg-primary/[0.02] transition-all">
                                                    <div className="not-skew-x flex items-center justify-between">
                                                        <div className="flex items-center gap-8">
                                                            <div className="relative">
                                                                <div className={cn(
                                                                    "h-12 w-12 flex items-center justify-center font-bold text-white text-lg rounded-lg shadow-sm transition-all",
                                                                    studentRecords[student.id] === "present" ? "bg-primary" :
                                                                        studentRecords[student.id] === "absent" ? "bg-red-600" :
                                                                            studentRecords[student.id] === "late" ? "bg-amber-500" : "bg-blue-600"
                                                                )}>
                                                                    <span>{student.profile?.first_name?.[0] || "?"}</span>
                                                                </div>
                                                                <span className="absolute -top-2 -left-2 text-[8px] font-mono font-bold bg-foreground text-background px-1.5 py-0.5 rounded-sm">ID:{String(idx + 1).padStart(3, '0')}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-xl text-foreground tracking-tighter uppercase italic group-hover:text-primary transition-colors">{student.profile?.first_name} {student.profile?.last_name}</h4>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    <p className="text-[9px] font-mono font-black text-primary/60 uppercase tracking-[0.2em]">
                                                                        ADM_NO: {student.admission_number || "N/A"}
                                                                    </p>
                                                                    <div className="h-1 w-1 rounded-full bg-foreground/10" />
                                                                    <p className="text-[9px] font-mono font-black text-foreground/40 uppercase tracking-[0.2em]">
                                                                        CLASS: {student.class?.name || "N/A"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {statusButton(student.id, "present", <Check className="h-4 w-4" />, "PRESENT", "bg-primary")}
                                                            {statusButton(student.id, "absent", <X className="h-4 w-4" />, "ABSENT", "bg-red-600")}
                                                            {statusButton(student.id, "late", <Clock className="h-4 w-4" />, "LATE", "bg-amber-500")}
                                                            {statusButton(student.id, "excused", <ShieldCheck className="h-4 w-4" />, "EXCUSED", "bg-blue-600")}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Synchronization Trigger */}
                            {isAdminOrTeacher && (
                                <div className="flex justify-end pt-8">
                                    <Button 
                                        onClick={handleSave} 
                                        disabled={loading} 
                                        className="h-16 px-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-md hover:scale-105 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <ShieldCheck className="h-6 w-6" />}
                                            {loading ? "SAVING..." : `Save Attendance (${Object.keys(studentRecords).length} Students)`}
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedClass && studentsLoaded && classStudents.length === 0 && (
                        <div className="glass-panel p-24 text-center border-primary/5 skew-x-[-12deg] rounded-none opacity-50">
                            <div className="not-skew-x">
                                <AlertTriangle className="h-16 w-16 mx-auto text-primary/20 mb-8 animate-pulse" />
                                <h3 className="font-black text-2xl text-foreground/40 uppercase tracking-[0.4em] italic leading-none">ZERO_PERSONNEL_DETECTED</h3>
                                <p className="text-[10px] font-mono font-black text-primary/40 uppercase tracking-[0.2em] mt-4 italic">INITIALIZE_CLASS_SECTOR_DATA_FIRST</p>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="space-y-10 animate-in slide-in-from-bottom-2 duration-700 mt-0">
                    <div className="glass-panel p-8 border-primary/10 skew-x-[-12deg] rounded-none">
                        <div className="not-skew-x flex flex-wrap gap-8 items-end">
                            {!isStudent && (
                                <div className="space-y-4 flex-1 min-w-[240px]">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 italic">
                                        <div className="h-1.5 w-1.5 bg-primary" /> SELECT CLASS
                                    </Label>
                                    <Select value={historyClass} onValueChange={setHistoryClass}>
                                        <SelectTrigger className="h-14 rounded-none bg-primary/5 border-primary/20 font-mono font-black uppercase text-[11px] tracking-widest focus:ring-primary/40">
                                            <SelectValue placeholder="CHOOSE A CLASS" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background/95 backdrop-blur-3xl border-primary/20 rounded-none">
                                            {classes.map(c => <SelectItem key={c.id} value={c.id} className="font-mono font-black uppercase text-[10px] tracking-widest focus:bg-primary focus:text-primary-foreground">{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className={cn("space-y-4 flex-1 min-w-[240px]", isStudent ? "flex-[2]" : "")}>
                                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 italic">
                                    <div className="h-1.5 w-1.5 bg-primary" /> DATE
                                </Label>
                                <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="h-14 rounded-none bg-primary/5 border-primary/20 font-mono font-black text-[11px] tracking-widest focus:border-primary transition-all" />
                            </div>
                            <Button onClick={fetchHistory} disabled={(!isStudent && !historyClass) || historyLoading} className="h-14 px-10 rounded-none bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] transition-all gap-3 emerald-glow shadow-xl italic">
                                {historyLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Filter className="h-4 w-4" />}
                                {historyLoading ? "SEARCHING..." : "SEARCH HISTORY"}
                            </Button>
                        </div>
                    </div>

                    {/* History Summary Grid */}
                    {historyRecords.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-4 reveal-4">
                            {[
                                { label: "TOTAL PRESENT", val: historyRecords.filter(r => r.status === "present").length, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
                                { label: "TOTAL ABSENT", val: historyRecords.filter(r => r.status === "absent").length, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20" },
                                { label: "TOTAL LATE", val: historyRecords.filter(r => r.status === "late").length, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/20" },
                                { label: "TOTAL EXCUSED", val: historyRecords.filter(r => r.status === "excused").length, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" }
                            ].map((stat, i) => (
                                <div key={i} className={cn("p-6 skew-x-[-12deg] rounded-none border text-center transition-all hover:bg-white/[0.02]", stat.bg, stat.border)}>
                                    <div className="not-skew-x">
                                        <p className={cn("text-4xl font-black italic drop-shadow-sm leading-none", stat.color)}>{stat.val}</p>
                                        <p className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-foreground/30 mt-3">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* History Matrix Table */}
                    <div className="glass-panel border-primary/5 skew-x-[-12deg] rounded-none p-0 overflow-hidden reveal-5">
                        <div className="not-skew-x overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-primary/5 border-b border-primary/10">
                                        <th className="text-left py-6 px-8 font-mono font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">NO</th>
                                        <th className="text-left py-6 px-8 font-mono font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">STUDENT NAME</th>
                                        <th className="text-left py-6 px-8 font-mono font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">ADMISSION NUMBER</th>
                                        <th className="text-left py-6 px-8 font-mono font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">STATUS</th>
                                        <th className="text-left py-6 px-8 font-mono font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {historyRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="opacity-30">
                                                    <Search className="h-10 w-10 mx-auto mb-4 text-primary/20" />
                                                    <p className="font-mono font-black uppercase tracking-[0.4em] text-[10px] italic">
                                                        {historyClass ? "NO RECORDS FOUND" : "PLEASE SELECT FILTERS"}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        historyRecords.map((record, idx) => (
                                            <tr key={record.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                <td className="py-5 px-8 font-mono font-black text-[10px] text-foreground/20 italic">{String(idx + 1).padStart(3, '0')}</td>
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-10 w-10 flex items-center justify-center font-black text-[11px] text-white skew-x-[-12deg] shadow-lg transition-all",
                                                            record.status === "present" ? "bg-primary emerald-glow" :
                                                                record.status === "absent" ? "bg-red-600 shadow-red-500/20" :
                                                                    record.status === "late" ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-600 shadow-blue-500/20"
                                                        )}>
                                                            <span className="skew-x-[12deg]">{record.student?.profile?.first_name?.[0] || "?"}</span>
                                                        </div>
                                                        <span className="font-black text-[15px] text-foreground tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                                                            {record.student?.profile?.first_name} {record.student?.profile?.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 font-mono font-black text-[10px] tracking-widest text-primary/60">{record.student?.admission_number || "NO_ID"}</td>
                                                <td className="py-5 px-8">
                                                    <div className={cn(
                                                        "inline-flex items-center px-4 py-1.5 skew-x-[-12deg] rounded-none font-black text-[8px] uppercase tracking-widest border transition-all",
                                                        record.status === "present" ? "bg-primary/10 text-primary border-primary/20" :
                                                            record.status === "absent" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                                record.status === "late" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                                                    )}>
                                                        <span className="not-skew-x">{record.status}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 font-mono text-[10px] font-bold text-foreground/30 italic group-hover:text-foreground/60 transition-colors">
                                                    {record.remarks || "No remarks"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="stats" className="space-y-10 animate-in slide-in-from-bottom-2 duration-700 mt-0">
                    <div className="glass-panel p-24 text-center border-primary/5 skew-x-[-12deg] rounded-none min-h-[400px] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
                        <div className="not-skew-x relative z-10">
                            <BarChart3 className="h-20 w-20 mx-auto text-primary/20 mb-10 animate-pulse" />
                            <h3 className="font-black text-3xl text-foreground/30 uppercase tracking-[0.5em] italic leading-none">ANALYTICS COMING SOON</h3>
                            <p className="text-[11px] font-mono font-black text-primary/40 uppercase tracking-[0.3em] mt-6 italic max-w-md mx-auto leading-relaxed">
                                Data visualization and deep attendance insights will be available in the next update.
                            </p>
                            <div className="flex justify-center gap-6 mt-12">
                                <div className="h-1 w-20 bg-primary/10" />
                                <div className="h-1 w-20 bg-primary" />
                                <div className="h-1 w-20 bg-primary/10" />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

