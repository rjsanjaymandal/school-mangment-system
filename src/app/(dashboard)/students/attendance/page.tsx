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
    Filter,
    Download,
    Activity,
    Search
} from "lucide-react";
import { 
    BarChart, Bar, 
    ResponsiveContainer, Tooltip, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { markAttendance, getAttendanceByClassAndDate } from "@/app/actions/attendance";

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
                toast.success("Attendance Recorded", {
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

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                        <ClipboardCheck className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                            Student <span className="text-emerald-600">Attendance</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl bg-white border-slate-200">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <Button variant="ghost" size="icon" className="h-12 w-10" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Input type="date" className="border-0 bg-transparent w-36 h-12 text-center font-bold" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-12 w-10" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatsCard title="Total Students" value={stats.total} icon={Users} color="slate" />
                <StatsCard title="Present" value={stats.present} icon={CheckCircle2} color="emerald" />
                <StatsCard title="Absent" value={stats.absent} icon={XCircle} color="rose" />
                <StatsCard title="Late" value={stats.late} icon={Clock} color="amber" />
            </div>

            <Tabs defaultValue="mark" onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto border border-slate-200">
                    <TabsTrigger value="mark" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest">
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Mark Attendance
                    </TabsTrigger>
                    <TabsTrigger value="history" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest">
                        <Calendar className="w-4 h-4 mr-2" /> View History
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest">
                        <BarChart3 className="w-4 h-4 mr-2" /> Insights
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: MARK ATTENDANCE --- */}
                <TabsContent value="mark" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl border-emerald-100 text-emerald-600 bg-emerald-50/30 hover:bg-emerald-50" onClick={() => markAll("present")}>
                                <CheckCheck className="h-4 w-4 mr-2" /> All Present
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-rose-100 text-rose-600 bg-rose-50/30 hover:bg-rose-50" onClick={() => markAll("absent")}>
                                <XCircle className="h-4 w-4 mr-2" /> All Absent
                            </Button>
                        </div>
                        <div className="relative w-full md:w-72 group">
                            <Input placeholder="Search student name or roll..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 pl-11 rounded-xl border-slate-200 group-focus-within:border-emerald-500 transition-all shadow-sm" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                    </div>

                    <Card className="glass futuristic-card rounded-2xl overflow-hidden border-slate-200/60 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-4">Roll</th>
                                        <th className="px-8 py-4">Student</th>
                                        <th className="px-8 py-4 text-center">Mark Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 animate-pulse uppercase font-bold">Fetching class data...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No matching students</td></tr>
                                    ) : (
                                        filteredStudents.map((s: any) => (
                                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{s.roll}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
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
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || students.length === 0} 
                            className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                        >
                            {isSaving ? (
                                <Activity className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <Save className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                            )}
                            {isSaving ? "Saving..." : "Save Daily Records"}
                        </Button>
                    </div>
                </TabsContent>

                {/* --- TAB: HISTORY LOG --- */}
                <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Historical Date</label>
                            <Input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" className="h-12 rounded-xl w-full border-slate-200 gap-2 font-bold uppercase text-[10px] tracking-widest">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                    </div>

                    <Card className="glass futuristic-card rounded-2xl overflow-hidden border-slate-200/60 shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyLoading ? (
                                    <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 animate-pulse">Scanning records...</td></tr>
                                ) : historyData?.length === 0 ? (
                                    <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No records for this date</td></tr>
                                ) : (
                                    historyData?.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-800 text-sm">{r.student?.profile?.full_name}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-tighter",
                                                    r.status === "present" ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === "absent" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                                )}>{r.status}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-400">{r.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Card>
                </TabsContent>

                {/* --- TAB: CHARTS & TRENDS --- */}
                <TabsContent value="charts" className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 glass futuristic-card rounded-2xl border-slate-200/60 shadow-xl">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" /> Weekly Presence Trend
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="p-6 glass futuristic-card rounded-2xl border-slate-200/60 shadow-xl bg-emerald-50/20">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Weekly Performance</h4>
                                <p className="text-3xl font-black text-slate-900">92% <span className="text-xs font-bold text-emerald-500 tracking-tight">↑ 4% this week</span></p>
                                <div className="mt-4 h-2 bg-white rounded-full overflow-hidden border border-emerald-100">
                                    <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
                                </div>
                            </Card>
                            <Card className="p-6 glass futuristic-card rounded-2xl border-slate-200/60 shadow-xl bg-rose-50/20">
                                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Chronic Absenteeism</h4>
                                <p className="text-3xl font-black text-slate-900">3 <span className="text-xs font-bold text-rose-500 tracking-tight">Students Flagged</span></p>
                                <p className="text-[10px] text-slate-500 mt-2 font-medium italic">System detected 3 students with {">"} 3 days of consecutive absence.</p>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function StatsCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        slate: "text-slate-600 bg-slate-50 border-slate-200",
    };

    return (
        <Card className="glass futuristic-card p-5 rounded-2xl border-slate-200/60 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
            <div className={cn("p-3 rounded-xl border", colors[color])}>
                <Icon className="h-5 w-5" />
            </div>
        </Card>
    );
}

function StatusButton({ studentId, status, active, onClick }: { studentId: string; status: string; active: string; onClick: any }) {
    const isActive = active === status;
    const colors: Record<string, string> = {
        present: isActive ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500",
        absent: isActive ? "bg-rose-500 text-white shadow-rose-200" : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500",
        late: isActive ? "bg-amber-500 text-white shadow-amber-200" : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500",
        excused: isActive ? "bg-blue-500 text-white shadow-blue-200" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-500",
    };

    return (
        <button
            onClick={() => onClick((prev: any) => ({ ...prev, [studentId]: status }))}
            className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                colors[status]
            )}
        >
            {status}
        </button>
    );
}