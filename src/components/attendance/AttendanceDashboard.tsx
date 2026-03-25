"use client";

import { useState, useMemo } from "react";
import {
    Check, X, Clock, Search, Users, ClipboardCheck, Calendar, BarChart3,
    ChevronDown, UserCheck, UserX, AlertTriangle, TrendingUp, Filter, Download,
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
    const [historyClass, setHistoryClass] = useState("");
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);
    const [historyRecords, setHistoryRecords] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

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
                    ? `${activeColor} text-white shadow-lg shadow-emerald-500/10 scale-105`
                    : "bg-background border border-border text-muted-foreground hover:bg-accent"
            )}
        >
            {icon}{label}
        </button>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 mb-4">
                        <span className="h-1.5 w-1.5 rounded-sm bg-primary animate-pulse shadow-sm shadow-primary/50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Registry</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Attendance Portal</h2>
                    <p className="text-foreground/60 font-medium tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">Real-Time Precision Tracking & Analytics</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Weekly Rate</p>
                            <h3 className="text-3xl font-black mt-2 text-foreground">{weekRate}%</h3>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-primary/10 rounded-sm overflow-hidden relative z-10">
                        <div className="h-full bg-primary rounded-sm emerald-glow transition-all duration-1000" style={{ width: `${weekRate}%` }} />
                    </div>
                </div>
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Today Present</p>
                            <h3 className="text-3xl font-black mt-2 text-foreground">{todayPresent}</h3>
                        </div>
                        <UserCheck className="h-8 w-8 text-primary shadow-emerald-500/20" />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-3">of {todayTotal} marked</p>
                </div>
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Today Absent</p>
                            <h3 className="text-3xl font-black mt-2 text-red-500">{todayAbsent}</h3>
                        </div>
                        <UserX className="h-8 w-8 text-red-500/40 group-hover:text-red-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-3">needs follow-up</p>
                </div>
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Weekly Late</p>
                            <h3 className="text-3xl font-black mt-2 text-amber-500">{weekLate}</h3>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-3">last 7 days</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={isStudent ? "history" : "mark"} className="space-y-6">
                <TabsList className="bg-card/40 backdrop-blur-xl border border-border p-1 rounded-sm h-14 w-fit">
                    {!isStudent && (
                        <TabsTrigger value="mark" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow">
                            <ClipboardCheck className="h-4 w-4" /> Mark
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="history" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2">
                        <Calendar className="h-4 w-4" /> {isStudent ? "My Attendance" : "Logs"}
                    </TabsTrigger>
                </TabsList>

                {/* MARK ATTENDANCE TAB */}
                <TabsContent value="mark" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm">
                        <div className="flex flex-wrap gap-6 items-end">
                            <div className="space-y-3 flex-1 min-w-[200px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Class</Label>
                                <Select value={selectedClass} onValueChange={handleClassChange}>
                                    <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card/90 border-border">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 flex-1 min-w-[200px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Date Node</Label>
                                <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="rounded-sm bg-background/50 border-border font-bold" />
                            </div>
                            <div className="space-y-3 flex-1 min-w-[200px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Identity Query</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name or admission..." className="pl-10 rounded-sm bg-background/50 border-border font-bold placeholder:text-foreground/20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {studentsLoaded && classStudents.length > 0 && (
                        <>
                            {/* Quick Actions & Summary */}
                            <div className="flex flex-wrap items-center justify-between gap-4 glass-dark p-4 rounded-sm border border-border/50">
                                <div className="flex items-center gap-x-3">
                                    <Button onClick={markAllPresent} variant="outline" size="sm" className="rounded-sm font-black uppercase tracking-widest text-[10px] gap-x-1 border-primary/20 text-primary hover:bg-primary/10">
                                        <Check className="h-3 w-3" /> All Present
                                    </Button>
                                    <Button onClick={markAllAbsent} variant="outline" size="sm" className="rounded-sm font-black uppercase tracking-widest text-[10px] gap-x-1 border-red-500/20 text-red-500 hover:bg-red-500/10">
                                        <X className="h-3 w-3" /> All Absent
                                    </Button>
                                </div>
                                <div className="flex items-center gap-x-4 text-[10px] font-black uppercase tracking-widest">
                                    <span className="flex items-center gap-x-2 text-primary">Present: {presentCount}</span>
                                    <span className="flex items-center gap-x-2 text-red-500">Absent: {absentCount}</span>
                                    <span className="flex items-center gap-x-2 text-amber-500">Late: {lateCount}</span>
                                    <span className="flex items-center gap-x-2 text-blue-400">Excused: {excusedCount}</span>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden">
                                <div className="divide-y divide-border">
                                    {filteredStudents.length === 0 ? (
                                        <div className="p-12 text-center text-foreground/40 font-black uppercase tracking-widest text-xs">No personnel records found.</div>
                                    ) : (
                                        filteredStudents.map((student, idx) => (
                                            <div key={student.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="relative">
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-sm flex items-center justify-center font-black text-white transition-all shadow-xl",
                                                            studentRecords[student.id] === "present" ? "bg-primary emerald-glow" :
                                                                studentRecords[student.id] === "absent" ? "bg-red-500" :
                                                                    studentRecords[student.id] === "late" ? "bg-amber-500" : "bg-blue-500"
                                                        )}>
                                                            {student.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <span className="absolute -top-1 -left-1 text-[8px] font-black bg-foreground text-background rounded-sm px-1.5 py-0.5">{idx + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-foreground tracking-tight">{student.profile?.first_name} {student.profile?.last_name}</h4>
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-0.5 opacity-60">
                                                            {student.admission_number || "NO-ID"} • {student.class?.name || "UNASSIGNED"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-x-2">
                                                    {statusButton(student.id, "present", <Check className="h-3 w-3" />, "P", "bg-primary")}
                                                    {statusButton(student.id, "absent", <X className="h-3 w-3" />, "A", "bg-red-500")}
                                                    {statusButton(student.id, "late", <Clock className="h-3 w-3" />, "L", "bg-amber-500")}
                                                    {statusButton(student.id, "excused", <Calendar className="h-3 w-3" />, "E", "bg-blue-400")}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Save Button */}
                            {isAdminOrTeacher && (
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave} disabled={loading} className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] px-12 py-7 h-auto emerald-glow shadow-2xl text-[11px]">
                                        <ClipboardCheck className="h-5 w-5" />
                                        {loading ? "Synchronizing..." : `Commit Attendance (${Object.keys(studentRecords).length} Nodes)`}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {selectedClass && studentsLoaded && classStudents.length === 0 && (
                        <div className="bg-card/40 backdrop-blur-xl border border-border p-16 text-center rounded-sm">
                            <Users className="h-12 w-12 mx-auto text-foreground/10 mb-6" />
                            <h3 className="font-black text-xl text-foreground/40 uppercase tracking-widest">No nodes detected</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">Initialize personnel in this class sector first.</p>
                        </div>
                    )}
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm">
                        <div className="flex flex-wrap gap-6 items-end">
                            <div className="space-y-3 flex-1 min-w-[200px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">History Class</Label>
                                <Select value={historyClass} onValueChange={setHistoryClass}>
                                    <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card/90 border-border">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 flex-1 min-w-[200px]">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Log Date</Label>
                                <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="rounded-sm bg-background/50 border-border font-bold" />
                            </div>
                            <Button onClick={fetchHistory} disabled={!historyClass || historyLoading} className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-8 h-10 emerald-glow shadow-lg">
                                <Filter className="h-4 w-4" /> {historyLoading ? "Fetching..." : "Retrieve Logs"}
                            </Button>
                            {historyRecords.length > 0 && (
                                <Button variant="outline" onClick={handleExportCSV} className="rounded-sm font-black uppercase tracking-widest text-[10px] px-8 h-10 border-border hover:bg-accent">
                                    <Download className="h-4 w-4" /> Export CSV
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* History Summary */}
                    {historyRecords.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="p-5 rounded-sm bg-primary/5 border border-primary/20 text-center">
                                <p className="text-3xl font-black text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{historyRecords.filter(r => r.status === "present").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">Present</p>
                            </div>
                            <div className="p-5 rounded-sm bg-red-500/5 border border-red-500/20 text-center">
                                <p className="text-3xl font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">{historyRecords.filter(r => r.status === "absent").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mt-1">Absent</p>
                            </div>
                            <div className="p-5 rounded-sm bg-amber-500/5 border border-amber-500/20 text-center">
                                <p className="text-3xl font-black text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{historyRecords.filter(r => r.status === "late").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mt-1">Late</p>
                            </div>
                            <div className="p-5 rounded-sm bg-blue-400/5 border border-blue-400/20 text-center">
                                <p className="text-3xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">{historyRecords.filter(r => r.status === "excused").length}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mt-1">Excused</p>
                            </div>
                        </div>
                    )}

                    {/* History Table */}
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">ID</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Personnel</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Registry No</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Status</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Telemetry/Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {historyRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">
                                                {historyClass ? "No data shards found in selected registry." : "Select Class + Date to retrieve history shards."}
                                            </td>
                                        </tr>
                                    ) : (
                                        historyRecords.map((record, idx) => (
                                            <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-4 px-6 font-black text-[10px] text-foreground/40">{idx + 1}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-x-3">
                                                        <div className={cn(
                                                            "h-9 w-9 rounded-sm flex items-center justify-center text-white font-black text-[11px] shadow-lg",
                                                            record.status === "present" ? "bg-primary emerald-glow" :
                                                                record.status === "absent" ? "bg-red-500" :
                                                                    record.status === "late" ? "bg-amber-500" : "bg-blue-400"
                                                        )}>
                                                            {record.student?.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <span className="font-black text-foreground tracking-tight">{record.student?.profile?.first_name} {record.student?.profile?.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-black text-[10px] tracking-widest text-primary/60">{record.student?.admission_number || "NO-ID"}</td>
                                                <td className="py-4 px-6">
                                                    <div className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest",
                                                        record.status === "present" ? "bg-primary/10 text-primary border border-primary/20" :
                                                            record.status === "absent" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                                record.status === "late" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                                                    )}>
                                                        {record.status}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-[11px] font-bold text-foreground/50 italic group-hover:text-foreground/70 transition-colors">{record.remarks || "No data telemetry recorded."}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

