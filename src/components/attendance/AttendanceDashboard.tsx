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
            (s.profile?.full_name || "").toLowerCase().includes(q) ||
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
                r.student?.profile?.full_name || "N/A",
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
                "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-x-1.5",
                studentRecords[studentId] === status
                    ? `${activeColor} text-white shadow-sm`
                    : "bg-secondary text-muted-foreground hover:bg-secondary/40"
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
                            <h2 className="text-3xl font-bold text-foreground leading-none">
                                Attendance
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 
                            {isStudent ? "View your attendance status" : "Record daily student attendance"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Matrix Stats Grid */}
            <div className="grid gap-8 md:grid-cols-4 reveal-2 relative z-10">
                <div className="group relative">
                    <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Weekly Rate</p>
                                <h3 className="text-3xl font-bold text-foreground leading-none">{weekRate}%</h3>
                            </div>
                            <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div className="mt-6 h-[2px] w-full bg-secondary relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary transition-all duration-1000" style={{ width: `${weekRate}%` }} />
                        </div>
                    </div>
                </div>

                <div className="group relative transition-all duration-200">
                    <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Today Present</p>
                                <h3 className="text-3xl font-bold text-foreground leading-none">{todayPresent}</h3>
                            </div>
                            <UserCheck className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-[10px] font-medium text-primary mt-4 flex items-center gap-2">
                           <Check className="h-3 w-3" /> {todayTotal} students marked
                        </p>
                    </div>
                </div>

                <div className="group relative transition-all duration-200">
                    <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-red-500 transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Today Absent</p>
                                <h3 className="text-3xl font-bold text-red-500 leading-none">{todayAbsent}</h3>
                            </div>
                            <UserX className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-[10px] font-medium text-red-500 mt-4 flex items-center gap-2">
                           <X className="h-3 w-3" /> Action required
                        </p>
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
                    <TabsList className="bg-secondary/40 border border-border p-1 rounded-lg h-auto w-fit">
                        <div className="flex gap-2">
                            {!isStudent && (
                                <TabsTrigger value="mark" className="rounded-md px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs transition-all gap-x-2 group">
                                    <ClipboardCheck className="h-4 w-4" /> Mark
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="history" className="rounded-md px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs transition-all gap-x-2 group">
                                <Calendar className="h-4 w-4" /> History
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="rounded-md px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs transition-all gap-x-2 group">
                                <BarChart3 className="h-4 w-4" /> Analytics
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
                <TabsContent value="mark" className="space-y-6 animate-in slide-in-from-bottom-2 mt-0">
                    <div className="bg-card p-6 border border-border rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Select Class
                                </Label>
                                <Select value={selectedClass} onValueChange={handleClassChange}>
                                    <SelectTrigger className="h-11 rounded-md bg-secondary border-border font-medium text-sm">
                                        <SelectValue placeholder="Choose class..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border rounded-md">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="text-sm">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Date
                                </Label>
                                <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="h-11 rounded-md bg-secondary border-border font-medium text-sm" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Search Student
                                </Label>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name or roll no..." className="h-11 pl-10 rounded-md bg-secondary border-border font-medium text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {studentsLoaded && classStudents.length > 0 && (
                        <div className="space-y-8 reveal-3">
                            {/* Matrix Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 border border-border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Button onClick={markAllPresent} variant="outline" className="h-10 px-4 rounded-md border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground font-semibold text-xs transition-all gap-2">
                                        <Check className="h-3.5 w-3.5" /> Mark Present
                                    </Button>
                                    <Button onClick={markAllAbsent} variant="outline" className="h-10 px-4 rounded-md border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white font-semibold text-xs transition-all gap-2">
                                        <X className="h-3.5 w-3.5" /> Mark Absent
                                    </Button>
                                </div>
                                <div className="flex items-center gap-6 border-l border-border pl-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest">PRESENT</span>
                                        <span className="text-lg font-bold text-primary leading-none">{presentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest">ABSENT</span>
                                        <span className="text-lg font-bold text-red-500 leading-none">{absentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest">LATE</span>
                                        <span className="text-lg font-bold text-amber-500 leading-none">{lateCount}</span>
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
                                                <div className="bg-card p-5 border border-border rounded-lg hover:border-primary/40 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="relative">
                                                                <div className={cn(
                                                                    "h-10 w-10 flex items-center justify-center font-bold text-white text-sm rounded-md shadow-sm transition-all",
                                                                    studentRecords[student.id] === "present" ? "bg-primary" :
                                                                        studentRecords[student.id] === "absent" ? "bg-red-500" :
                                                                            studentRecords[student.id] === "late" ? "bg-amber-500" : "bg-blue-500"
                                                                )}>
                                                                    <span>{student.profile?.full_name?.[0] || "?"}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">{student.profile?.full_name}</h4>
                                                                <div className="flex items-center gap-3 mt-0.5">
                                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                                        ADM: {student.admission_number || "N/A"}
                                                                    </p>
                                                                    <div className="h-1 w-1 rounded-full bg-border" />
                                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                                        Class: {student.class?.name || "N/A"}
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
                                        className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <ShieldCheck className="h-5 w-5" />}
                                            {loading ? "Saving..." : `Save Records (${Object.keys(studentRecords).length})`}
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedClass && studentsLoaded && classStudents.length === 0 && (
                        <div className="bg-card p-24 text-center border border-dashed border-border rounded-lg opacity-60">
                            <div>
                                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-6" />
                                <h3 className="font-bold text-xl text-foreground tracking-tight">No students found</h3>
                                <p className="text-xs text-muted-foreground mt-2">Please ensure students are assigned to this class sector first.</p>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="space-y-6 animate-in slide-in-from-bottom-2 mt-0">
                    <div className="bg-card p-6 border border-border rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            {!isStudent && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Select Class
                                    </Label>
                                    <Select value={historyClass} onValueChange={setHistoryClass}>
                                        <SelectTrigger className="h-11 rounded-md bg-secondary border-border font-medium text-sm">
                                            <SelectValue placeholder="Choose class..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border rounded-md">
                                            {classes.map(c => <SelectItem key={c.id} value={c.id} className="text-sm">{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Date
                                </Label>
                                <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="h-11 rounded-md bg-secondary border-border font-medium text-sm" />
                            </div>
                            <Button onClick={fetchHistory} disabled={(!isStudent && !historyClass) || historyLoading} className="h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-xs transition-all gap-2">
                                {historyLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Filter className="h-3.5 w-3.5" />}
                                {historyLoading ? "Searching..." : "Search History"}
                            </Button>
                        </div>
                    </div>

                    {/* History Summary Grid */}
                    {historyRecords.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-4 reveal-4">
                            {[
                                { label: "Present", val: historyRecords.filter(r => r.status === "present").length, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
                                { label: "Absent", val: historyRecords.filter(r => r.status === "absent").length, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20" },
                                { label: "Late", val: historyRecords.filter(r => r.status === "late").length, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/20" },
                                { label: "Excused", val: historyRecords.filter(r => r.status === "excused").length, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" }
                            ].map((stat, i) => (
                                <div key={i} className={cn("p-4 rounded-lg border text-center transition-all", stat.bg, stat.border)}>
                                    <div>
                                        <p className={cn("text-2xl font-bold leading-none", stat.color)}>{stat.val}</p>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-2">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* History Matrix Table */}
                    <div className="bg-card border border-border rounded-lg p-0 overflow-hidden shadow-sm reveal-5">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Student Name</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Admission No</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Remarks</th>
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
                                                            "h-8 w-8 flex items-center justify-center font-bold text-[10px] text-white rounded-md shadow-sm transition-all",
                                                            record.status === "present" ? "bg-primary" :
                                                                record.status === "absent" ? "bg-red-500" :
                                                                    record.status === "late" ? "bg-amber-500" : "bg-blue-500"
                                                        )}>
                                                            <span className="">{record.student?.profile?.full_name?.[0] || "?"}</span>
                                                        </div>
                                                        <span className="font-semibold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                            {record.student?.profile?.full_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-[11px] font-medium text-muted-foreground tracking-wider uppercase">{record.student?.admission_number || "N/A"}</td>
                                                <td className="py-4 px-6">
                                                    <div className={cn(
                                                        "inline-flex items-center px-2.5 py-1 rounded-full font-semibold text-[9px] uppercase tracking-wide border transition-all",
                                                        record.status === "present" ? "bg-primary/10 text-primary border-primary/20" :
                                                            record.status === "absent" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                                record.status === "late" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    )}>
                                                        <span>{record.status}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-xs text-muted-foreground italic">
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
                <TabsContent value="stats" className="space-y-6 animate-in slide-in-from-bottom-2 mt-0">
                    <div className="bg-card p-24 text-center border border-dashed border-border rounded-lg min-h-[400px] flex items-center justify-center">
                        <div className="">
                            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-8 opacity-40" />
                            <h3 className="font-bold text-2xl text-foreground tracking-tight">Analytics coming soon</h3>
                            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                                Comprehensive reports and attendance trends will be available in the next system update.
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

