"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    ClipboardCheck, 
    Save, 
    CheckCircle2, 
    Clock, 
    Users, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    CheckCheck, 
    XCircle,
    BarChart3,
    Search,
    Activity,
    Download,
    ShieldCheck,
    TrendingUp,
    PieChart as PieChartIcon,
    History as HistoryIcon
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip, 
    XAxis, YAxis, CartesianGrid,
    Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { markAttendance, getAttendanceByClassAndDate } from "@/app/actions/attendance";
import { ERPCard } from "@/components/ui/erp-card";

// Shared UI Framework
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

export default function StudentAttendancePage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    
    // Core State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("mark");

    // 1. Fetch Classes
    const { data: classesData } = useQuery({
        queryKey: ['classes-attendance'],
        queryFn: async () => {
            const { data } = await supabase.from("classes").select("id, name").order("name");
            return data || [];
        }
    });
    const classes = classesData || [];

    // 2. Fetch Students
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
    const students = studentsData || [];

    // 3. Fetch Existing Attendance
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
    const existingAttendance = existingAttendanceData || [];

    const [attendance, setAttendance] = useState<Record<string, string>>({});

    // Sync state with server data
    useEffect(() => {
        if (students.length === 0) {
            setAttendance({});
            return;
        }

        if (existingAttendance.length > 0) {
            const mapped = Object.fromEntries(existingAttendance.map((a: any) => [a.student_id, a.status]));
            setAttendance(prev => {
                const isDifferent = JSON.stringify(prev) !== JSON.stringify(mapped);
                return isDifferent ? mapped : prev;
            });
        } else {
            setAttendance(prev => {
                const keys = Object.keys(prev);
                if (keys.length === students.length && students.every(s => keys.includes(s.id))) {
                    return prev;
                }
                return Object.fromEntries(students.map((s: any) => [s.id, "present"]));
            });
        }
    }, [existingAttendanceData, studentsData, selectedClassId, selectedDate]);

    // Auto-select first class
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes, selectedClassId]);

    const filteredStudents = useMemo(() => students.filter((s: any) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll.toLowerCase().includes(searchQuery.toLowerCase())
    ), [students, searchQuery]);

    const stats = useMemo(() => ({
        present: Object.values(attendance).filter(v => v === "present").length,
        absent: Object.values(attendance).filter(v => v === "absent").length,
        late: Object.values(attendance).filter(v => v === "late").length,
        excused: Object.values(attendance).filter(v => v === "excused").length,
        total: students.length
    }), [attendance, students]);

    const markAll = (status: string) => {
        const updated: Record<string, string> = {};
        students.forEach((s: any) => { updated[s.id] = status; });
        setAttendance(updated);
    };

    const handleSave = async () => {
        if (!selectedClassId || students.length === 0) return;
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const records = Object.entries(attendance).map(([student_id, status]) => ({
                student_id,
                status
            }));

            const result = await markAttendance({
                class_id: selectedClassId,
                date: selectedDate,
                records,
                marked_by: user?.id || ""
            });

            if (result.success) {
                toast.success("Attendance Saved", {
                    description: `${stats.present} Present, ${stats.absent} Absent`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                });
                queryClient.invalidateQueries({ queryKey: ['attendance-check'] });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error("Save Failed", { description: "There was an error saving records." });
        } finally {
            setIsSaving(false);
        }
    };

    // --- History Feature ---
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['attendance-history', selectedClassId, historyDate],
        queryFn: async () => {
            const res = await getAttendanceByClassAndDate(selectedClassId, historyDate);
            return res.data || [];
        },
        enabled: activeTab === "history" && !!selectedClassId
    });

    const historyStats = useMemo(() => {
        if (!historyData) return null;
        return {
            present: historyData.filter((r: any) => r.status === "present").length,
            absent: historyData.filter((r: any) => r.status === "absent").length,
            late: historyData.filter((r: any) => r.status === "late").length,
            total: historyData.length
        };
    }, [historyData]);

    // --- Charts Feature ---
    const chartData = [
        { name: "Mon", Present: 45, Absent: 5 },
        { name: "Tue", Present: 48, Absent: 2 },
        { name: "Wed", Present: 42, Absent: 8 },
        { name: "Thu", Present: 50, Absent: 0 },
        { name: "Fri", Present: 47, Absent: 3 },
    ];

    const distributionData = [
        { name: 'Present', value: stats.present, color: '#10b981' },
        { name: 'Absent', value: stats.absent, color: '#f43f5e' },
        { name: 'Late', value: stats.late, color: '#f59e0b' },
        { name: 'Leave', value: stats.excused, color: '#3b82f6' },
    ].filter(d => d.value > 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Students</span>
                        <span>/</span>
                        <span className="text-foreground font-medium">Attendance</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">Student Attendance</h1>
                    <p className="text-sm text-muted-foreground">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-full md:w-40 h-10 rounded-md">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-10 w-8" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Input type="date" className="border-0 bg-transparent w-28 h-10 text-center text-sm" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-10 w-8" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-5">
                <ERPCard accentColor="emerald">
                    <div className="p-4 space-y-2">
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                    </div>
                </ERPCard>
                <ERPCard accentColor="emerald">
                    <div className="p-4 space-y-2">
                        <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
                        <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                </ERPCard>
                <ERPCard accentColor="rose">
                    <div className="p-4 space-y-2">
                        <p className="text-2xl font-bold text-rose-600">{stats.absent}</p>
                        <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                </ERPCard>
                <ERPCard accentColor="amber">
                    <div className="p-4 space-y-2">
                        <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
                        <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                </ERPCard>
                <ERPCard accentColor="blue">
                    <div className="p-4 space-y-2">
                        <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                        <p className="text-xs text-muted-foreground">Excused</p>
                    </div>
                </ERPCard>
            </div>

            <Tabs defaultValue="mark" onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-md h-auto border border-slate-200 w-fit">
                    <TabsTrigger value="mark" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Mark Attendance
                    </TabsTrigger>
                    <TabsTrigger value="history" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                        <HistoryIcon className="w-4 h-4 mr-2" /> History
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                        <TrendingUp className="w-4 h-4 mr-2" /> Trends
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: MARK --- */}
                <TabsContent value="mark" className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-md" onClick={() => markAll("present")}>
                                <CheckCheck className="h-4 w-4 mr-2" /> All Present
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-md" onClick={() => markAll("absent")}>
                                <XCircle className="h-4 w-4 mr-2" /> All Absent
                            </Button>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 pl-10 rounded-md border-slate-200" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    <ERPCard
                        title="Student Attendance"
                        description="Mark daily attendance for students"
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        color="emerald"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Roll</th>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No students found</td></tr>
                                    ) : (
                                        filteredStudents.map((s: any) => (
                                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{s.roll}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900 text-sm">{s.name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-1">
                                                        <StatusButton studentId={s.id} status="present" active={attendance[s.id]} onClick={setAttendance} />
                                                        <StatusButton studentId={s.id} status="absent" active={attendance[s.id]} onClick={setAttendance} />
                                                        <StatusButton studentId={s.id} status="late" active={attendance[s.id]} onClick={setAttendance} />
                                                        <StatusButton studentId={s.id} status="excused" active={attendance[s.id]} onClick={setAttendance} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ERPCard>

                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || students.length === 0} 
                            className="h-10 px-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                            {isSaving ? (
                                <Activity className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isSaving ? "Saving..." : "Save Records"}
                        </Button>
                    </div>
                </TabsContent>

                {/* --- TAB: HISTORY --- */}
                <TabsContent value="history" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-600">Select Date</label>
                            <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="h-10 rounded-md border-slate-200" />
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" className="h-10 rounded-md w-full border-slate-200 gap-2">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" className="h-10 rounded-md w-full border-slate-200 gap-2">
                                <Search className="h-4 w-4" /> Filter
                            </Button>
                        </div>
                    </div>

                    {/* Historical Snapshot Bar */}
                    {historyStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <HistoryStatMini label="Total Logged" value={historyStats.total} color="slate" />
                            <HistoryStatMini label="Present" value={historyStats.present} color="emerald" />
                            <HistoryStatMini label="Absent" value={historyStats.absent} color="rose" />
                            <HistoryStatMini label="Late" value={historyStats.late} color="amber" />
                        </div>
                    )}

                    <ERPCard
                        title="Attendance History"
                        description="Past attendance records for selected date"
                        icon={<Calendar className="h-5 w-5" />}
                        color="blue"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyLoading ? (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                                ) : historyData?.length === 0 ? (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No records found</td></tr>
                                ) : (
                                    historyData?.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 text-sm">{r.student?.profile?.full_name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    "text-xs font-medium uppercase px-2 py-1 rounded",
                                                    r.status === "present" ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === "absent" ? "bg-rose-50 text-rose-600" : 
                                                    r.status === "late" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                                )}>{r.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-slate-500">{r.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </ERPCard>
                </TabsContent>

                {/* --- TAB: TRENDS --- */}
                <TabsContent value="charts" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Weekly Trend */}
                        <ERPCard
                            title="Weekly Attendance"
                            icon={<Activity className="h-5 w-5" />}
                            color="emerald"
                            className="lg:col-span-2"
                        >
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                        <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ERPCard>

                        {/* Distribution Breakdown */}
                        <ERPCard
                            title="Status Distribution"
                            icon={<PieChartIcon className="h-5 w-5" />}
                            color="blue"
                        >
                            <div className="h-[180px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-bold text-slate-900">{stats.total}</span>
                                    <span className="text-xs text-slate-500">Total</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {distributionData.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-xs text-slate-600">{d.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">{Math.round((d.value / stats.total) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </ERPCard>

                        {/* Growth & Flags */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ERPCard
                                title="Weekly Performance"
                                color="emerald"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-slate-900">92%</p>
                                        <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" /> 4% increase
                                        </p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                                </div>
                            </ERPCard>
                            
                            <ERPCard
                                title="Chronic Absenteeism"
                                color="red"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-slate-900">3</p>
                                        <p className="text-sm text-rose-600 mt-1">Students flagged</p>
                                    </div>
                                    <div className="p-3 bg-rose-50 rounded-md border border-rose-100">
                                        <XCircle className="h-6 w-6 text-rose-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-3">
                                    Students with more than 3 days of consecutive absence
                                </p>
                            </ERPCard>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function HistoryStatMini({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        slate: "text-slate-600 bg-slate-50 border-slate-200",
    };

    return (
        <Card className={cn("p-4 rounded-md border flex flex-col gap-1", colors[color])}>
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xl font-bold text-slate-900">{value}</span>
        </Card>
    );
}

function StatusButton({ studentId, status, active, onClick }: { studentId: string; status: string; active: string; onClick: any }) {
    const isActive = active === status;
    const colors: Record<string, string> = {
        present: isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600",
        absent: isActive ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600",
        late: isActive ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600",
        excused: isActive ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600",
    };

    return (
        <button
            onClick={() => onClick((prev: any) => ({ ...prev, [studentId]: status }))}
            className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                colors[status]
            )}
        >
            {status}
        </button>
    );
}