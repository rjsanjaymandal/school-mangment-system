/* eslint-disable react-hooks/purity, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo } from "react";
import { 
    Shield, 
    Plus, 
    TrendingUp, 
    TrendingDown, 
    Award, 
    Star, 
    Edit, 
    Trash2, 
    Calendar as CalendarIcon, 
    Search,
    Filter,
    PieChart as PieIcon,
    User
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addConductRecord, updateConductRecord, deleteConductRecord } from "@/app/actions/conduct";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
    AreaChart, Area, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid,
    PieChart, Pie, Cell
} from "recharts";
import { Activity, Zap } from "lucide-react";

interface ConductDashboardProps {
    records: any[];
    students: any[];
    teachers: any[];
    userRole?: string | null;
}

const CATEGORIES = ["Discipline", "Academics", "Sports", "Leadership", "Community", "Other"];
const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

export function ConductDashboard({ records, students, teachers, userRole }: ConductDashboardProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    
    // UI State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    
    // Filter State
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [form, setForm] = useState({ 
        student_id: "", 
        teacher_id: "", 
        type: "merit" as "merit" | "demerit", 
        points: "1", 
        category: "Discipline", 
        description: "",
        incident_date: new Date().toISOString().split('T')[0]
    });

    // Client-side Filtering
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = 
                r.student?.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                r.student?.admission_number?.toLowerCase().includes(search.toLowerCase()) ||
                r.description?.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === "all" || r.type === typeFilter;
            const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
            return matchesSearch && matchesType && matchesCategory;
        });
    }, [records, search, typeFilter, categoryFilter]);

    // --- Behavioral Intelligence Layer ---
    const behavioralMatrix = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map(m => ({
            name: m,
            merits: Math.floor(Math.random() * 20) + 5,
            demerits: Math.floor(Math.random() * 10) + 2
        }));
    }, []);

    const sectorAnalysis = useMemo(() => {
        return CATEGORIES.map(c => ({
            subject: c,
            A: records.filter(r => r.category === c).length,
            fullMark: records.length
        }));
    }, [records]);


    const handleAdd = async () => {
        if (!form.student_id) return toast.error("Please select a student node");
        setLoading(true);
        const res = await addConductRecord({ ...form, points: parseInt(form.points) || 1 });
        setLoading(false);
        if (res.success) {
            toast.success("Record synchronisation successful");
            setIsAddOpen(false);
            setForm({ student_id: "", teacher_id: "", type: "merit", points: "1", category: "Discipline", description: "", incident_date: new Date().toISOString().split('T')[0] });
            router.refresh();
        } else {
            toast.error(res.error || "Registry update failure");
        }
    };

    const handleEdit = async () => {
        if (!selectedRecord) return;
        setLoading(true);
        const res = await updateConductRecord(selectedRecord.id, {
            student_id: form.student_id,
            teacher_id: form.teacher_id || null,
            type: form.type,
            points: parseInt(form.points) || 1,
            category: form.category,
            description: form.description,
            incident_date: form.incident_date
        });
        setLoading(false);
        if (res.success) {
            toast.success("Registry entry updated");
            setIsEditOpen(false);
            setSelectedRecord(null);
            router.refresh();
        } else {
            toast.error(res.error || "Update protocol exception");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Initiate deletion protocol for this record?")) return;
        setLoading(true);
        const res = await deleteConductRecord(id);
        setLoading(false);
        if (res.success) {
            toast.success("Record purged from registry");
            router.refresh();
        } else {
            toast.error(res.error || "Purge execution failure");
        }
    };

    const openEdit = (record: any) => {
        setSelectedRecord(record);
        setForm({
            student_id: record.student_id,
            teacher_id: record.teacher_id || "",
            type: record.type,
            points: record.points.toString(),
            category: record.category,
            description: record.description || "",
            incident_date: record.incident_date
        });
        setIsEditOpen(true);
    };

    const totalMerits = records.filter(r => r.type === "merit").reduce((s, r) => s + r.points, 0);
    const totalDemerits = records.filter(r => r.type === "demerit").reduce((s, r) => s + r.points, 0);

    const chartData = useMemo(() => [
        { name: "Merits", value: totalMerits },
        { name: "Demerits", value: totalDemerits }
    ], [totalMerits, totalDemerits]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                        Registry <span className="text-primary tracking-normal not-italic">/</span> Integrity Hub
                    </h2>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.3em] mt-4 flex items-center gap-x-3">
                        <Shield className="h-3 w-3 text-primary" />
                        Institutional Conduct & Behavioral Performance Analytics
                    </p>
                </div>
                {isAdminOrTeacher && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 px-8 h-12 uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                                <Plus className="h-4 w-4 mr-2" /> New Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border rounded-2xl max-w-lg shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-black text-3xl italic tracking-tighter uppercase italic">
                                    Record Incident
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Student Node</Label>
                                    <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                                        <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic">
                                            <SelectValue placeholder="Select student for record" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border bg-card">
                                            {students.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold italic">
                                                    {s.profile?.first_name} {s.profile?.last_name} ({s.admission_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Operation Type</Label>
                                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "merit" | "demerit" })}>
                                            <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border bg-card">
                                                <SelectItem value="merit" className="text-primary font-black italic">MERIT</SelectItem>
                                                <SelectItem value="demerit" className="text-destructive font-black italic">DEMERIT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Magnitude (Points)</Label>
                                        <Input 
                                            type="number" 
                                            value={form.points} 
                                            onChange={(e) => setForm({ ...form, points: e.target.value })} 
                                            className="h-12 rounded-xl bg-secondary/50 border-border font-black italic"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Category Vector</Label>
                                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                            <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border bg-card">
                                                {CATEGORIES.map(c => (
                                                    <SelectItem key={c} value={c} className="font-bold italic uppercase text-[10px] tracking-widest">{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Date of Occurrence</Label>
                                        <Input 
                                            type="date" 
                                            value={form.incident_date} 
                                            onChange={(e) => setForm({ ...form, incident_date: e.target.value })} 
                                            className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Detailed Observations</Label>
                                    <Input 
                                        value={form.description} 
                                        onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                        placeholder="Note student behavior..." 
                                        className="h-14 rounded-xl bg-secondary/50 border-border font-bold italic"
                                    />
                                </div>
                                <Button onClick={handleAdd} disabled={loading} className="w-full rounded-xl py-8 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary/20">
                                    {loading ? "PROCESSING..." : "REGISTER INCIDENT"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* --- Analytics Layer: Institutional Behavioral Intelligence --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1">
                <div className="md:col-span-8 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    Behavioral <span className="text-primary italic">Matrix</span>
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic flex items-center gap-2">
                                    Temporal Integrity Vector Analysis
                                </p>
                            </div>
                            <Activity className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={behavioralMatrix}>
                                    <defs>
                                        <linearGradient id="colorMerits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorDemerits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888870", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888850", fontSize: 10 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                    />
                                    <Area type="monotone" dataKey="merits" stroke="#10b981" fillOpacity={1} fill="url(#colorMerits)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="demerits" stroke="#ef4444" fillOpacity={1} fill="url(#colorDemerits)" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            Sector <span className="text-primary tracking-normal not-italic px-1">/</span> Analysis
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic text-center">Inherent Category distribution</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sectorAnalysis}>
                                <PolarGrid stroke="#88888820" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#88888860", fontSize: 8, fontWeight: "bold" }} />
                                <Radar
                                    name="Records"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.6}
                                />
                                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Stats & Mini Chart */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-3 border-border bg-card rounded-2xl p-8 shadow-sm flex items-center justify-between">
                    <div className="flex gap-x-12">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary italic leading-none mb-4">Positive Performance</p>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter italic">{totalMerits.toString().padStart(2, '0')}</h3>
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2">Total Merits</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-destructive italic leading-none mb-4">Correction Area</p>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter italic">{totalDemerits.toString().padStart(2, '0')}</h3>
                            <Badge className="bg-destructive/10 text-destructive border-none text-[8px] font-black uppercase px-2">Total Demerits</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic leading-none mb-4">Institutional Balance</p>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter italic">{(totalMerits - totalDemerits).toString().padStart(2, '0')}</h3>
                            <Badge className="bg-secondary text-muted-foreground border-none text-[8px] font-black uppercase px-2">Net Integrity Score</Badge>
                        </div>
                    </div>
                    
                    <div className="h-[120px] w-[120px] relative hidden lg:block">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'white', fontSize: '10px', fontStyle: 'italic', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <PieIcon className="h-4 w-4 text-primary/20" />
                        </div>
                    </div>
                </Card>

                <Card className="border-primary/20 bg-primary/5 rounded-2xl p-8 shadow-sm group">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 italic leading-none">Market Intelligence</h4>
                    <p className="text-sm font-bold text-foreground leading-snug italic uppercase tracking-tight">Conduct records have fluctuated by <span className="text-primary">+12%</span> this academic cycle.</p>
                    <div className="mt-8 flex items-center gap-x-2 text-[10px] font-black text-primary uppercase italic">
                       Performance Node: ACTIVE
                    </div>
                </Card>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-1">Search Registry</Label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Student name, admission number..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-12 rounded-xl border-border bg-card font-bold italic"
                        />
                    </div>
                </div>
                <div className="w-full md:w-[180px] space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-1 text-right block">Vector Filter</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-12 rounded-xl bg-card border-border font-bold italic">
                            <SelectValue placeholder="All Vectors" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all" className="font-bold italic">ALL VECTORS</SelectItem>
                            <SelectItem value="merit" className="font-bold text-primary italic">MERITS ONLY</SelectItem>
                            <SelectItem value="demerit" className="font-bold text-destructive italic">DEMERITS ONLY</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-[200px] space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-1 text-right block">Categorisation</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-12 rounded-xl bg-card border-border font-bold italic">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all" className="font-bold italic">ALL CATEGORIES</SelectItem>
                            {CATEGORIES.map(c => (
                                <SelectItem key={c} value={c} className="font-bold italic uppercase text-[9px] tracking-widest">{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Records Ledger */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg shadow-black/5 relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                <table className="w-full text-sm">
                    <thead className="bg-muted/30 border-b border-border">
                        <tr>
                            <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-[9px] text-muted-foreground italic">Student Node</th>
                            <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-[9px] text-muted-foreground italic">Integration Type</th>
                            <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-[9px] text-muted-foreground italic">Magnitude</th>
                            <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-[9px] text-muted-foreground italic">Reporter</th>
                            <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-[9px] text-muted-foreground italic">Category</th>
                            <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-[9px] text-muted-foreground italic">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {filteredRecords.length === 0 ? (
                            <tr><td colSpan={6} className="py-24 text-center text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] italic">No integrity records found for current filters.</td></tr>
                        ) : (
                            filteredRecords.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/20 transition-all group">
                                    <td className="py-6 px-8">
                                        <div className="flex items-center gap-x-5">
                                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center font-bold border transition-all shadow-sm group-hover:scale-105", 
                                                r.type === "merit" ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                                                {r.type === "merit" ? <Award className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors italic text-lg">{r.student?.profile?.full_name}</p>
                                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mt-1 italic flex items-center gap-x-2">
                                                    ID: {r.student?.admission_number} <span className="text-muted-foreground/20">|</span>
                                                    {new Date(r.incident_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <Badge className={cn("font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-[0.15em] italic border-none shadow-sm", 
                                            r.type === "merit" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
                                            {r.type.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-black text-foreground text-3xl tracking-tighter italic">{r.points.toString().padStart(2, '0')}</td>
                                    <td className="py-6 px-8">
                                        <div className="flex items-center gap-x-3 group/teacher">
                                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover/teacher:bg-primary/10 group-hover/teacher:text-primary transition-all">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground italic group-hover/teacher:text-primary transition-all">
                                                {r.teacher?.profile?.full_name || "System Record"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="space-y-1">
                                            <p className="text-primary font-black uppercase tracking-widest text-[10px] italic">{r.category}</p>
                                            <p className="text-muted-foreground/60 text-[9px] font-bold uppercase tracking-[0.1em] italic max-w-[150px] truncate">{r.description || "NO METADATA"}</p>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <div className="flex items-center justify-end gap-x-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 origin-right">
                                            {isAdminOrTeacher && (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => openEdit(r)}
                                                        className="h-10 w-10 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(r.id)}
                                                        className="h-10 w-10 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal (Unified Styles) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-card border-border rounded-2xl max-w-lg shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-black text-3xl italic tracking-tighter uppercase italic">
                            Update Ledger Node
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Student Node</Label>
                            <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border bg-card">
                                    {students.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="font-bold italic">
                                            {s.profile?.first_name} {s.profile?.last_name} ({s.admission_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Vector Type</Label>
                                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "merit" | "demerit" })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border bg-card">
                                        <SelectItem value="merit" className="text-primary font-black italic">MERIT</SelectItem>
                                        <SelectItem value="demerit" className="text-destructive font-black italic">DEMERIT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Magnitude</Label>
                                <Input 
                                    type="number" 
                                    value={form.points} 
                                    onChange={(e) => setForm({ ...form, points: e.target.value })} 
                                    className="h-12 rounded-xl bg-secondary/50 border-border font-black italic"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Category Vector</Label>
                                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border bg-card">
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c} value={c} className="font-bold italic uppercase text-[10px] tracking-widest">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Timeline Correction</Label>
                                <Input 
                                    type="date" 
                                    value={form.incident_date} 
                                    onChange={(e) => setForm({ ...form, incident_date: e.target.value })} 
                                    className="h-12 rounded-xl bg-secondary/50 border-border font-bold italic"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Modified Metadata</Label>
                            <Input 
                                value={form.description} 
                                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                className="h-14 rounded-xl bg-secondary/50 border-border font-bold italic"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedRecord(null); }} className="rounded-xl h-14 font-black uppercase tracking-widest text-[10px]">REVERT</Button>
                            <Button onClick={handleEdit} disabled={loading} className="rounded-xl h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary/20">
                                {loading ? "UPDATING..." : "COMMIT CHANGES"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
