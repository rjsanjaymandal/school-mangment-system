"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Check, X, Clock, Search, Users, ClipboardCheck, Calendar, BarChart3,
    UserCheck, UserX, AlertTriangle, TrendingUp, Filter, Download, ShieldCheck,
    Activity, Zap
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    useEffect(() => {
        if (!isStudent || classes.length === 0) return;

        let active = true;

        const loadStudentHistory = async () => {
            setHistoryLoading(true);
            const result = await getAttendanceByClassAndDate(classes[0].id, historyDate);

            if (!active) return;

            if (result.success && result.data) {
                const studentId = students[0]?.id;
                setHistoryRecords(result.data.filter((record: any) => record.student_id === studentId));
            } else {
                setHistoryRecords([]);
            }

            setHistoryLoading(false);
        };

        void loadStudentHistory();

        return () => {
            active = false;
        };
    }, [classes, historyDate, isStudent, students]);

    // Computed stats
    const weekTotal = weekAttendance.length;
    const weekPresent = weekAttendance.filter(a => a.status === "present").length;
    const weekAbsent = weekAttendance.filter(a => a.status === "absent").length;
    const weekLate = weekAttendance.filter(a => a.status === "late").length;
    const weekExcused = weekAttendance.filter(a => a.status === "excused").length;
    const weekRate = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;

    const todayPresent = todayAttendance.filter(a => a.status === "present").length;
    const todayAbsent = todayAttendance.filter(a => a.status === "absent").length;
    const todayLate = todayAttendance.filter(a => a.status === "late").length;
    const todayExcused = todayAttendance.filter(a => a.status === "excused").length;
    const todayTotal = todayAttendance.length;

    // --- Presence Intelligence Layer ---
    const presenceMatrix = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const baseline = days.reduce<Record<string, { name: string; Present: number; Absent: number; Late: number; Excused: number }>>((acc, day) => {
            acc[day] = { name: day, Present: 0, Absent: 0, Late: 0, Excused: 0 };
            return acc;
        }, {});

        weekAttendance.forEach((entry: any) => {
            const sourceDate = entry.date || entry.created_at;
            if (!sourceDate) return;

            const dayLabel = new Date(sourceDate).toLocaleDateString("en-US", { weekday: "short" });
            const bucket = baseline[dayLabel];

            if (!bucket) return;

            if (entry.status === "present") bucket.Present += 1;
            if (entry.status === "absent") bucket.Absent += 1;
            if (entry.status === "late") bucket.Late += 1;
            if (entry.status === "excused") bucket.Excused += 1;
        });

        return days.map((day) => baseline[day]);
    }, [weekAttendance]);

    const institutionalDensity = useMemo(() => {
        return [
            { name: "Present", value: todayPresent, color: "#10b981" },
            { name: "Absent", value: todayAbsent, color: "#ef4444" },
            { name: "Late", value: todayLate, color: "#f59e0b" },
            { name: "Excused", value: todayExcused, color: "#3b82f6" }
        ];
    }, [todayPresent, todayAbsent, todayLate, todayExcused]);

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
        const updated: Record<string, AttendanceStatus> = { ...studentRecords };
        classStudents.forEach(s => { updated[s.id] = "present"; });
        setStudentRecords(updated);
    };

    const markAllAbsent = () => {
        const updated: Record<string, AttendanceStatus> = { ...studentRecords };
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

    const statusButton = (studentId: string, status: AttendanceStatus, icon: React.ReactNode, label: string, activeClass: string) => (
        <button
            onClick={() => setStatus(studentId, status)}
            className={cn(
                "px-4 py-2 rounded-sm text-xs font-medium transition-all flex items-center gap-x-2 capitalize",
                studentRecords[studentId] === status
                    ? `${activeClass} text-white shadow-md`
                    : "bg-muted text-muted-foreground hover:bg-accent border border-transparent hover:border-border"
            )}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border pb-8 relative z-10">
                <div className="flex items-center gap-x-6">
                    <div className="h-14 w-14 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-sm transition-all duration-300">
                        <Users className="h-7 w-7 transition-all duration-300" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Daily Attendance
                        </h2>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-primary" /> 
                            {isStudent ? "Individual Attendance Record" : "Student Attendance Board"}
                        </p>
                    </div>
                </div>

                {isAdminOrTeacher && (
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={handleExportCSV} className="h-10 px-4 font-medium transition-all group">
                            <Download className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" /> Export Data
                        </Button>
                    </div>
                )}
            </div>

            {/* Matrix Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4 reveal-2 relative z-10">
                <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Weekly Attendance Rate</p>
                    <h3 className="text-4xl font-bold text-foreground leading-none">{weekRate}%</h3>
                    <div className="mt-8 h-1.5 w-full bg-muted relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-primary transition-all duration-1000" style={{ width: `${weekRate}%` }} />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserCheck className="h-20 w-20 text-emerald-500" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Present Today</p>
                    <h3 className="text-4xl font-bold text-foreground leading-none">{todayPresent}</h3>
                    <p className="text-xs font-medium text-emerald-500 mt-6 flex items-center gap-2">
                       <Check className="h-3.5 w-3.5" /> Verified
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserX className="h-20 w-20 text-red-500" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Absent Today</p>
                    <h3 className="text-4xl font-bold text-red-500 leading-none">{todayAbsent}</h3>
                    <p className="text-xs font-medium text-red-500 mt-6 flex items-center gap-2">
                       <X className="h-3.5 w-3.5" /> Action Required
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="h-20 w-20 text-amber-500" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Late Today</p>
                    <h3 className="text-4xl font-bold text-amber-500 leading-none">{weekLate}</h3>
                    <p className="text-xs font-medium text-amber-500 mt-6 flex items-center gap-2">
                       <Clock className="h-3.5 w-3.5" /> Arrived Late
                    </p>
                </div>
            </div>

            <Tabs defaultValue={isStudent ? "history" : "mark"} className="space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <TabsList className="bg-muted border border-border p-1 rounded-sm h-auto w-fit">
                        <div className="flex gap-1">
                            {!isStudent && (
                                <TabsTrigger value="mark" className="px-6 py-2 rounded-sm text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all focus:ring-0">
                                    <ClipboardCheck className="h-4 w-4 mr-2" /> Mark Attendance
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="history" className="px-6 py-2 rounded-sm text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all focus:ring-0">
                                <Calendar className="h-4 w-4 mr-2" /> History
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="px-6 py-2 rounded-sm text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all focus:ring-0">
                                <BarChart3 className="h-4 w-4 mr-2" /> Charts
                            </TabsTrigger>
                        </div>
                    </TabsList>
                </div>

                {/* ANALYTICS TAB CONTENT */}
                <TabsContent value="stats" className="space-y-8 animate-in slide-in-from-bottom-2 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 reveal-1 w-full">
                        <div className="md:col-span-8 border border-border bg-card/40 rounded-sm overflow-hidden group">
                           <div className="p-6 border-b border-border bg-card/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Weekly Attendance
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground mt-1 text-left">
                                        Daily breakdown of attendance statuses
                                    </p>
                                </div>
                                <Activity className="h-5 w-5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-all" />
                           </div>
                           <div className="p-6 h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={presenceMatrix}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888810" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: "#888888", fontSize: 12 }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
                                        <Tooltip 
                                            cursor={{ fill: "rgba(0,0,0,0.05)" }}
                                            contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", fontSize: "12px", color: "#fff" }}
                                        />
                                        <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs font-semibold text-muted-foreground capitalize">{value}</span>}/>
                                        <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                        <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                           </div>
                        </div>

                        <div className="md:col-span-4 border border-border bg-card/40 rounded-sm overflow-hidden group">
                            <div className="p-6 border-b border-border bg-card/50 text-center">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Today's Status
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground mt-1">Distribution of active records</p>
                            </div>
                            <div className="p-6 h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={institutionalDensity}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {institutionalDensity.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", fontSize: "12px", color: "#fff" }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-semibold text-muted-foreground capitalize">{value}</span>}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* MARK ATTENDANCE TAB */}
                <TabsContent value="mark" className="space-y-8 animate-in slide-in-from-bottom-2 mt-4">
                    <div className="border border-border bg-card/40 p-6 rounded-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Select Class</Label>
                                <Select value={selectedClass} onValueChange={handleClassChange}>
                                    <SelectTrigger className="h-11 rounded-sm bg-background border-border font-medium text-sm">
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border rounded-sm">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="text-sm font-medium">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Date</Label>
                                <div className="relative">
                                    <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="h-11 rounded-sm bg-background border-border font-medium text-sm pl-10" />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Search Students</Label>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or roll no..." className="h-11 pl-10 rounded-sm bg-background border-border font-medium text-sm focus:bg-background transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {studentsLoaded && classStudents.length > 0 && (
                        <div className="space-y-6 reveal-3">
                            <div className="flex flex-wrap items-center justify-between gap-6 p-6 border border-border bg-card/40 rounded-sm backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <Button onClick={markAllPresent} variant="outline" className="h-10 px-4 font-medium transition-all gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200">
                                        <Check className="h-4 w-4" /> Mark All Present
                                    </Button>
                                    <Button onClick={markAllAbsent} variant="outline" className="h-10 px-4 font-medium transition-all gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                        <X className="h-4 w-4" /> Mark All Absent
                                    </Button>
                                </div>
                                <div className="flex items-center gap-8 border-l border-border pl-8">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Present</span>
                                        <span className="text-xl font-bold text-foreground mt-1 leading-none">{presentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Absent</span>
                                        <span className="text-xl font-bold text-foreground mt-1 leading-none">{absentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Late</span>
                                        <span className="text-xl font-bold text-foreground mt-1 leading-none">{lateCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-border bg-card/40 rounded-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Student Name</th>
                                                <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Admission No</th>
                                                <th className="py-3 px-6 text-sm font-semibold text-muted-foreground text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="group hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-8 w-8 flex items-center justify-center font-bold text-white text-xs rounded-full bg-primary/20 border border-primary/20">
                                                                {student.profile?.full_name?.[0] || "?"}
                                                            </div>
                                                            <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                                {student.profile?.full_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground font-medium">
                                                        {student.admission_number || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {statusButton(student.id, "present", <Check className="h-4 w-4" />, "Present", "bg-emerald-600")}
                                                            {statusButton(student.id, "absent", <X className="h-4 w-4" />, "Absent", "bg-red-600")}
                                                            {statusButton(student.id, "late", <Clock className="h-4 w-4" />, "Late", "bg-amber-500")}
                                                            {statusButton(student.id, "excused", <ShieldCheck className="h-4 w-4" />, "Excused", "bg-blue-600")}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {isAdminOrTeacher && (
                                <div className="flex justify-end pt-4">
                                    <Button 
                                        onClick={handleSave} 
                                        disabled={loading} 
                                        className="h-11 px-8 font-medium transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                            {loading ? "Saving..." : `Save Attendance (${Object.keys(studentRecords).length})`}
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* ARCHIVE TAB */}
                <TabsContent value="history" className="space-y-8 animate-in slide-in-from-bottom-2 mt-4">
                    <div className="border border-border bg-card/40 p-6 rounded-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            {!isStudent && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Select Class</Label>
                                    <Select value={historyClass} onValueChange={setHistoryClass}>
                                        <SelectTrigger className="h-11 rounded-sm bg-background border-border font-medium text-sm">
                                            <SelectValue placeholder="Select a class" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-border rounded-sm">
                                            {classes.map(c => <SelectItem key={c.id} value={c.id} className="text-sm font-medium">{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Date</Label>
                                <div className="relative">
                                    <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="h-11 rounded-sm bg-background border-border font-medium text-sm pl-10" />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <Button onClick={fetchHistory} disabled={(!isStudent && !historyClass) || historyLoading} className="h-11 px-6 font-medium transition-all gap-2">
                                {historyLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
                                {historyLoading ? "Loading..." : "View History"}
                            </Button>
                        </div>
                    </div>

                    <div className="border border-border bg-card/40 rounded-sm overflow-hidden reveal-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">ID</th>
                                        <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Student Name</th>
                                        <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Admission No</th>
                                        <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {historyRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Search className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        No attendance records found for this date.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        historyRecords.map((record, idx) => (
                                            <tr key={record.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="py-4 px-6 font-mono text-sm text-muted-foreground">
                                                    {String(idx + 1).padStart(3, '0')}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-8 w-8 flex items-center justify-center font-bold text-xs text-white rounded-full",
                                                            record.status === "present" ? "bg-emerald-600" :
                                                                record.status === "absent" ? "bg-red-600" :
                                                                    record.status === "late" ? "bg-amber-500" : "bg-blue-600"
                                                        )}>
                                                            {record.student?.profile?.full_name?.[0] || "?"}
                                                        </div>
                                                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                            {record.student?.profile?.full_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-sm text-muted-foreground font-medium">
                                                    {record.student?.admission_number || "N/A"}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize",
                                                        record.status === "present" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                                                            record.status === "absent" ? "bg-red-50 text-red-600 border border-red-200" :
                                                                record.status === "late" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-blue-50 text-blue-600 border border-blue-200"
                                                    )}>
                                                        {record.status}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted-foreground">
                                                    {record.remarks || "-"}
                                                </td>
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
