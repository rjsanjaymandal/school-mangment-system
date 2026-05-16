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
    PieChart as PieChartIcon
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip, 
    XAxis, YAxis, CartesianGrid,
    Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { markAttendance, getAttendanceByClassAndDate } from "@/app/actions/attendance";
import { ERPCard } from "@/components/ui/erp-card";

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
        <div className="p-6 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                        <ClipboardCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-full md:w-44 h-10 rounded-xl bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm transition-all">
                            <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {classes.map(c => (<SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <Button variant="ghost" size="icon" className="h-10 w-9" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronLeft className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Input type="date" className="border-0 bg-transparent w-32 h-10 text-center text-[10px] font-black uppercase tracking-tighter" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-10 w-9" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <DashboardStatCard title="Total Students" value={stats.total} icon={Users} color="emerald" />
                <DashboardStatCard title="Present Today" value={stats.present} icon={CheckCircle2} color="emerald" />
                <DashboardStatCard title="Absent Today" value={stats.absent} icon={XCircle} color="rose" />
                <DashboardStatCard title="Late" value={stats.late} icon={Clock} color="amber" />
                <DashboardStatCard title="Leave" value={stats.excused} icon={ShieldCheck} color="blue" />
            </div>

            <Tabs defaultValue="mark" onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100/50 backdrop-blur-sm p-1 rounded-xl h-auto border border-slate-200/60 w-fit">
                    <TabsTrigger value="mark" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-[0.1em]">
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Mark
                    </TabsTrigger>
                    <TabsTrigger value="history" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-[0.1em]">
                        <Calendar className="w-4 h-4 mr-2" /> History
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-[0.1em]">
                        <TrendingUp className="w-4 h-4 mr-2" /> Trends
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: MARK --- */}
                <TabsContent value="mark" className="space-y-6 outline-none">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl border-emerald-500/20 text-emerald-600 bg-emerald-500/5 text-[10px] font-black uppercase tracking-widest shadow-sm" onClick={() => markAll("present")}>
                                <CheckCheck className="h-4 w-4 mr-2" /> All Present
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-rose-500/20 text-rose-600 bg-rose-500/5 text-[10px] font-black uppercase tracking-widest shadow-sm" onClick={() => markAll("absent")}>
                                <XCircle className="h-4 w-4 mr-2" /> All Absent
                            </Button>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 pl-11 rounded-xl border-slate-200 bg-white/80 shadow-sm text-xs font-bold" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    <ERPCard
                        title="Students"
                        description="Mark daily attendance for students"
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        color="emerald"
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-4">Roll</th>
                                        <th className="px-8 py-4">Student</th>
                                        <th className="px-8 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No matching records</td></tr>
                                    ) : (
                                        filteredStudents.map((s: any) => (
                                            <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-5">
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">{s.roll}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-slate-900 text-sm tracking-tight">{s.name}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center gap-2">
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

                    <div className="flex justify-end pt-2">
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || students.length === 0} 
                            className="h-12 px-10 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
                        >
                            {isSaving ? (
                                <Activity className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            )}
                            {isSaving ? "Saving..." : "Save Records"}
                        </Button>
                    </div>
                </TabsContent>

                {/* --- TAB: HISTORY --- */}
                <TabsContent value="history" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Date</label>
                            <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="h-10 rounded-xl border-slate-200 bg-white shadow-sm text-xs font-bold" />
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" className="h-10 rounded-xl w-full border-slate-200 gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                    </div>

                    <ERPCard
                        title="History"
                        description="Past attendance records"
                        icon={<Calendar className="h-5 w-5" />}
                        color="blue"
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyLoading ? (
                                    <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading...</td></tr>
                                ) : historyData?.length === 0 ? (
                                    <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No Logs Found</td></tr>
                                ) : (
                                    historyData?.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-900 text-sm tracking-tight">{r.student?.profile?.full_name}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter",
                                                    r.status === "present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    r.status === "absent" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                                )}>{r.status}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right text-[10px] font-mono font-bold text-slate-400">{r.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </ERPCard>
                </TabsContent>

                {/* --- TAB: TRENDS --- */}
                <TabsContent value="charts" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Weekly Trend Radar */}
                        <ERPCard
                            title="Weekly Radar"
                            icon={<Activity className="h-5 w-5" />}
                            color="amber"
                            className="lg:col-span-2 glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden p-8"
                        >
                            <div className="h-[300px] w-full mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
                                        <Bar dataKey="Present" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                                        <Bar dataKey="Absent" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ERPCard>

                        {/* Distribution Breakdown */}
                        <ERPCard
                            title="Distribution"
                            icon={<PieChartIcon className="h-5 w-5" />}
                            color="blue"
                            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden p-8"
                        >
                            <div className="h-[200px] w-full mt-4 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-black text-slate-900">{stats.total}</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Total</span>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                {distributionData.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{d.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">{Math.round((d.value / stats.total) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </ERPCard>

                        {/* Growth & Flags */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ERPCard
                                title="Growth"
                                color="emerald"
                                className="glass futuristic-card border-none shadow-2xl rounded-2xl overflow-hidden p-8 group hover:scale-[1.02] transition-transform"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">92%</p>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" /> ↑ 4% Progress
                                        </p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:rotate-12 transition-transform">
                                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="mt-6 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: '92%' }} />
                                </div>
                            </ERPCard>
                            
                            <ERPCard
                                title="Flags"
                                color="red"
                                className="glass futuristic-card border-none shadow-2xl rounded-2xl overflow-hidden p-8 group hover:scale-[1.02] transition-transform"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">3</p>
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Alerts Detected</p>
                                    </div>
                                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 group-hover:shake transition-transform">
                                        <XCircle className="h-8 w-8 text-rose-600" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-tight leading-relaxed">
                                    Critical anomalies detected in consecutive absence density.
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

function DashboardStatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        slate: "text-slate-600 bg-slate-50 border-slate-200",
    };

    return (
        <div className="glass futuristic-card p-6 rounded-2xl border-none shadow-xl flex items-center justify-between group hover:scale-[1.05] transition-all duration-300 cursor-pointer hover:shadow-2xl">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{title}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
            <div className={cn("p-3 rounded-xl border-2 transition-all group-hover:rotate-12", colors[color])}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );
}

function StatusButton({ studentId, status, active, onClick }: { studentId: string; status: string; active: string; onClick: any }) {
    const isActive = active === status;
    const colors: Record<string, string> = {
        present: isActive ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600",
        absent: isActive ? "bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]" : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600",
        late: isActive ? "bg-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]" : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600",
        excused: isActive ? "bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600",
    };

    return (
        <button
            onClick={() => onClick((prev: any) => ({ ...prev, [studentId]: status }))}
            className={cn(
                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                colors[status]
            )}
        >
            {status}
        </button>
    );
}