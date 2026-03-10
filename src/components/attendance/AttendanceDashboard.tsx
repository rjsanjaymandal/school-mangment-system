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
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

export function AttendanceDashboard({
    classes, students, todayAttendance, weekAttendance, currentUserId,
}: AttendanceDashboardProps) {
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
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-x-1",
                studentRecords[studentId] === status
                    ? `${activeColor} text-white shadow-lg scale-105`
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
        >
            {icon}{label}
        </button>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Attendance Nexus</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Real-Time Precision Tracking & Analytics</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Weekly Rate</p>
                            <h3 className="text-3xl font-black mt-2">{weekRate}%</h3>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full neon-blue transition-all duration-1000" style={{ width: `${weekRate}%` }} />
                    </div>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Today Present</p>
                            <h3 className="text-3xl font-black mt-2 text-slate-900">{todayPresent}</h3>
                        </div>
                        <UserCheck className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-3">of {todayTotal} marked</p>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Today Absent</p>
                            <h3 className="text-3xl font-black mt-2 text-slate-900">{todayAbsent}</h3>
                        </div>
                        <UserX className="h-8 w-8 text-red-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-3">needs follow-up</p>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Weekly Late</p>
                            <h3 className="text-3xl font-black mt-2 text-slate-900">{weekLate}</h3>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-3">last 7 days</p>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="mark" className="space-y-6">
                <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14 w-fit">
                    <TabsTrigger value="mark" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <ClipboardCheck className="h-4 w-4" /> Mark Attendance
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <Calendar className="h-4 w-4" /> Attendance Logs
                    </TabsTrigger>
                </TabsList>

                {/* MARK ATTENDANCE TAB */}
                <TabsContent value="mark" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 mt-0">
                    <Card className="border-none glass futuristic-card">
                        <CardContent className="flex flex-wrap gap-4 items-end p-6">
                            <div className="space-y-2 flex-1 min-w-[200px]">
                                <Label className="text-xs font-bold uppercase text-slate-400">Class</Label>
                                <Select value={selectedClass} onValueChange={handleClassChange}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a class" /></SelectTrigger>
                                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 flex-1 min-w-[200px]">
                                <Label className="text-xs font-bold uppercase text-slate-400">Date</Label>
                                <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-2 flex-1 min-w-[200px]">
                                <Label className="text-xs font-bold uppercase text-slate-400">Search Student</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name or admission no..." className="pl-9 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {studentsLoaded && classStudents.length > 0 && (
                        <>
                            {/* Quick Actions & Summary */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-x-3">
                                    <Button onClick={markAllPresent} variant="outline" size="sm" className="rounded-xl font-bold gap-x-1 border-green-200 text-green-600 hover:bg-green-50">
                                        <Check className="h-3 w-3" /> All Present
                                    </Button>
                                    <Button onClick={markAllAbsent} variant="outline" size="sm" className="rounded-xl font-bold gap-x-1 border-red-200 text-red-400 hover:bg-red-50">
                                        <X className="h-3 w-3" /> All Absent
                                    </Button>
                                </div>
                                <div className="flex items-center gap-x-4 text-xs font-bold">
                                    <span className="flex items-center gap-x-1"><div className="h-2.5 w-2.5 rounded-full bg-green-500" /> Present: {presentCount}</span>
                                    <span className="flex items-center gap-x-1"><div className="h-2.5 w-2.5 rounded-full bg-red-500" /> Absent: {absentCount}</span>
                                    <span className="flex items-center gap-x-1"><div className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Late: {lateCount}</span>
                                    <span className="flex items-center gap-x-1"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Excused: {excusedCount}</span>
                                </div>
                            </div>

                            {/* Student List */}
                            <Card className="border-none glass futuristic-card overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {filteredStudents.length === 0 ? (
                                        <div className="p-12 text-center text-slate-400 font-medium">No students found.</div>
                                    ) : (
                                        filteredStudents.map((student, idx) => (
                                            <div key={student.id} className="p-5 flex items-center justify-between hover:bg-white/40 transition-all group">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="relative">
                                                        <div className={cn(
                                                            "h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white transition-colors",
                                                            studentRecords[student.id] === "present" ? "bg-green-500" :
                                                                studentRecords[student.id] === "absent" ? "bg-red-500" :
                                                                    studentRecords[student.id] === "late" ? "bg-amber-500" : "bg-blue-500"
                                                        )}>
                                                            {student.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <span className="absolute -top-1 -left-1 text-[8px] font-black bg-slate-900 text-white rounded px-1">{idx + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{student.profile?.first_name} {student.profile?.last_name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {student.admission_number || "N/A"} • {student.class?.name || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-x-2">
                                                    {statusButton(student.id, "present", <Check className="h-3 w-3" />, "P", "bg-green-500")}
                                                    {statusButton(student.id, "absent", <X className="h-3 w-3" />, "A", "bg-red-500")}
                                                    {statusButton(student.id, "late", <Clock className="h-3 w-3" />, "L", "bg-amber-500")}
                                                    {statusButton(student.id, "excused", <Calendar className="h-3 w-3" />, "E", "bg-blue-500")}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={loading} className="rounded-2xl bg-slate-900 text-white font-bold px-12 py-6 gap-x-2 neon-blue text-sm">
                                    <ClipboardCheck className="h-5 w-5" />
                                    {loading ? "Saving..." : `Save Attendance (${Object.keys(studentRecords).length} students)`}
                                </Button>
                            </div>
                        </>
                    )}

                    {selectedClass && studentsLoaded && classStudents.length === 0 && (
                        <Card className="border-none glass futuristic-card p-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                            <h3 className="font-black text-lg text-slate-300">No students in this class</h3>
                            <p className="text-xs text-slate-400 mt-1">Add students to this class first.</p>
                        </Card>
                    )}
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 mt-0">
                    <Card className="border-none glass futuristic-card">
                        <CardContent className="flex flex-wrap gap-4 items-end p-6">
                            <div className="space-y-2 flex-1 min-w-[200px]">
                                <Label className="text-xs font-bold uppercase text-slate-400">Class</Label>
                                <Select value={historyClass} onValueChange={setHistoryClass}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a class" /></SelectTrigger>
                                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 flex-1 min-w-[200px]">
                                <Label className="text-xs font-bold uppercase text-slate-400">Date</Label>
                                <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="rounded-xl" />
                            </div>
                            <Button onClick={fetchHistory} disabled={!historyClass || historyLoading} className="rounded-xl bg-slate-900 text-white font-bold gap-x-2">
                                <Filter className="h-4 w-4" /> {historyLoading ? "Loading..." : "Fetch Records"}
                            </Button>
                            {historyRecords.length > 0 && (
                                <Button variant="outline" onClick={handleExportCSV} className="rounded-xl font-bold gap-x-2 border-slate-200">
                                    <Download className="h-4 w-4" /> Export CSV
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Summary */}
                    {historyRecords.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center">
                                <p className="text-2xl font-black text-green-700">{historyRecords.filter(r => r.status === "present").length}</p>
                                <p className="text-[10px] font-black uppercase text-green-500">Present</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                                <p className="text-2xl font-black text-red-700">{historyRecords.filter(r => r.status === "absent").length}</p>
                                <p className="text-[10px] font-black uppercase text-red-500">Absent</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                                <p className="text-2xl font-black text-amber-700">{historyRecords.filter(r => r.status === "late").length}</p>
                                <p className="text-[10px] font-black uppercase text-amber-500">Late</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                                <p className="text-2xl font-black text-blue-700">{historyRecords.filter(r => r.status === "excused").length}</p>
                                <p className="text-[10px] font-black uppercase text-blue-500">Excused</p>
                            </div>
                        </div>
                    )}

                    {/* History Table */}
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <div className="bg-white/40 backdrop-blur-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/50">
                                    <tr className="border-b">
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">#</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Student</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Admission No</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                                        <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {historyRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                                {historyClass ? "No records found. Select a class and date, then click Fetch." : "Select a class and date to view attendance logs."}
                                            </td>
                                        </tr>
                                    ) : (
                                        historyRecords.map((record, idx) => (
                                            <tr key={record.id} className="hover:bg-white/60 transition-colors">
                                                <td className="py-4 px-6 font-mono text-xs text-slate-400">{idx + 1}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-x-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs",
                                                            record.status === "present" ? "bg-green-500" :
                                                                record.status === "absent" ? "bg-red-500" :
                                                                    record.status === "late" ? "bg-amber-500" : "bg-blue-500"
                                                        )}>
                                                            {record.student?.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <span className="font-bold text-slate-900">{record.student?.profile?.first_name} {record.student?.profile?.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-xs text-slate-500">{record.student?.admission_number || "—"}</td>
                                                <td className="py-4 px-6">
                                                    <Badge className={cn(
                                                        "font-bold text-[10px] border-none",
                                                        record.status === "present" ? "bg-green-50 text-green-600" :
                                                            record.status === "absent" ? "bg-red-50 text-red-600" :
                                                                record.status === "late" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {record.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-slate-400 text-xs italic">{record.remarks || "—"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
