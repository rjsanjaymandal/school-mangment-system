"use client";

import { useState, useMemo } from "react";
import { 
    Shield, 
    Plus, 
    Award, 
    Star, 
    Edit, 
    Trash2, 
    Search,
    User,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Activity,
    MoreHorizontal,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addConductRecord, updateConductRecord, deleteConductRecord } from "@/app/actions/conduct";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ConductDashboardProps {
    records: any[];
    students: any[];
    teachers: any[];
    userRole?: string | null;
}

const CATEGORIES = ["Discipline", "Academics", "Sports", "Leadership", "Community", "Other"];

export function ConductDashboard({ records, students, teachers, userRole }: ConductDashboardProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    
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

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = 
                r.student?.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                r.student?.admission_number?.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === "all" || r.type === typeFilter;
            const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
            return matchesSearch && matchesType && matchesCategory;
        });
    }, [records, search, typeFilter, categoryFilter]);

    const stats = useMemo(() => {
        const merits = records.filter(r => r.type === "merit").length;
        const demerits = records.filter(r => r.type === "demerit").length;
        const totalPoints = records.reduce((acc, r) => acc + (r.points || 0), 0);
        return { merits, demerits, totalPoints };
    }, [records]);

    const handleAdd = async () => {
        if (!form.student_id || !form.description) {
            toast.error("Please fill required fields");
            return;
        }
        setLoading(true);
        const result = await addConductRecord({
            ...form,
            points: parseInt(form.points) || 1,
            teacher_id: form.teacher_id || undefined,
            description: form.description || undefined,
            incident_date: form.incident_date || undefined
        });
        setLoading(false);
        if (result.success) {
            toast.success("Record added");
            setIsAddOpen(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleEdit = async () => {
        if (!selectedRecord || !form.description) return;
        setLoading(true);
        const result = await updateConductRecord(selectedRecord.id, {
            ...form,
            points: parseInt(form.points) || 1,
            teacher_id: form.teacher_id || undefined,
            description: form.description || undefined,
            incident_date: form.incident_date || undefined
        });
        setLoading(false);
        if (result.success) {
            toast.success("Record updated");
            setIsEditOpen(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this record? This action is irreversible.")) return;
        const result = await deleteConductRecord(id);
        if (result.success) {
            toast.success("Record deleted");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const openEdit = (record: any) => {
        setSelectedRecord(record);
        setForm({
            student_id: record.student_id,
            teacher_id: record.teacher_id || "",
            type: record.type,
            points: String(record.points || 1),
            category: record.category,
            description: record.description,
            incident_date: record.incident_date
        });
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardStatCard 
                    title="Positive Merits" 
                    value={stats.merits} 
                    icon={CheckCircle2} 
                    color="emerald" 
                    description="Commendable actions" 
                />
                <DashboardStatCard 
                    title="Demerit Incidents" 
                    value={stats.demerits} 
                    icon={AlertCircle} 
                    color="amber" 
                    description="Correction required" 
                />
                <DashboardStatCard 
                    title="Institutional Points" 
                    value={stats.totalPoints} 
                    icon={Star} 
                    color="purple" 
                    description="Global behavior score" 
                />
            </div>

            {/* Action Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-1 flex-col lg:flex-row gap-4 w-full">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by student name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 pl-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 text-xs font-bold"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200 text-xs font-bold">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="merit">Merit</SelectItem>
                                    <SelectItem value="demerit">Demerit</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 text-xs font-bold">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isAdminOrTeacher && (
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
                                    <Plus className="h-4 w-4" /> Add Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl backdrop-blur-xl">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                    <DialogHeader>
                                        <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight">Add Conduct Record</DialogTitle>
                                        <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">
                                            Institutional behavioral framework
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student</Label>
                                        <Select value={form.student_id} onValueChange={(val) => setForm({...form, student_id: val})}>
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-bold">
                                                <SelectValue placeholder="Select target student" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {students.map(s => (
                                                    <SelectItem key={s.id} value={s.id} className="rounded-lg">
                                                        {s.profile?.full_name} ({s.admission_number})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Type</Label>
                                            <Select value={form.type} onValueChange={(val) => setForm({...form, type: val as "merit" | "demerit"})}>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="merit" className="text-emerald-600 font-bold">Merit</SelectItem>
                                                    <SelectItem value="demerit" className="text-amber-600 font-bold">Demerit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</Label>
                                            <Input 
                                                type="number" 
                                                value={form.points} 
                                                onChange={(e) => setForm({...form, points: e.target.value})} 
                                                className="h-11 rounded-xl border-slate-200 text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Category</Label>
                                        <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</Label>
                                        <Input 
                                            value={form.description} 
                                            onChange={(e) => setForm({...form, description: e.target.value})} 
                                            className="h-11 rounded-xl border-slate-200 text-xs font-bold" 
                                            placeholder="Nature of the incident or achievement..." 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incident Date</Label>
                                        <Input 
                                            type="date" 
                                            value={form.incident_date} 
                                            onChange={(e) => setForm({...form, incident_date: e.target.value})} 
                                            className="h-11 rounded-xl border-slate-200 text-xs font-bold" 
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleAdd} 
                                        disabled={loading} 
                                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95"
                                    >
                                        {loading ? "Processing..." : "Commit Record"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Records List */}
            <ERPCard
                title="Conduct Ledger"
                description="Historical behavioral audit trail"
                icon={<FileText className="h-5 w-5" />}
                color="purple"
                className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <TableHead className="px-6 py-4">Target Student</TableHead>
                                <TableHead className="px-6 py-4">Assessment</TableHead>
                                <TableHead className="px-6 py-4">Category</TableHead>
                                <TableHead className="px-6 py-4">Impact</TableHead>
                                <TableHead className="px-6 py-4">Description</TableHead>
                                <TableHead className="px-6 py-4">Timestamp</TableHead>
                                {isAdminOrTeacher && <TableHead className="px-6 py-4 text-right">Control</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdminOrTeacher ? 7 : 6} className="py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-6 bg-slate-50 rounded-full mb-4">
                                                <Shield className="h-12 w-12 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No behavioral records identified</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-slate-50/50 transition-all group">
                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <User className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm tracking-tight">{record.student?.profile?.full_name}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{record.student?.admission_number}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border",
                                                record.type === "merit" 
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {record.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                                                {record.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <span className={cn(
                                                "font-black text-sm tabular-nums",
                                                record.type === "merit" ? "text-emerald-600" : "text-amber-600"
                                            )}>
                                                {record.type === "merit" ? "+" : "-"}{record.points}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-2 group/desc cursor-default">
                                                <Activity className="h-3 w-3 text-slate-300 group-hover/desc:text-slate-500 transition-colors" />
                                                <span className="text-xs font-bold text-slate-600 max-w-[200px] truncate">{record.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(record.incident_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </TableCell>
                                        {isAdminOrTeacher && (
                                            <TableCell className="px-6 py-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-slate-200/60 backdrop-blur-xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Management</DropdownMenuLabel>
                                                        <DropdownMenuItem 
                                                            onClick={() => openEdit(record)}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Edit className="h-4 w-4" /> Edit Record
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(record.id)}
                                                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Purge Record
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </ERPCard>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl backdrop-blur-xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <DialogHeader>
                            <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight">Edit Record</DialogTitle>
                            <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">
                                Modification of behavioral metrics
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Type</Label>
                                <Select value={form.type} onValueChange={(val) => setForm({...form, type: val as "merit" | "demerit"})}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="merit" className="text-emerald-600 font-bold">Merit</SelectItem>
                                        <SelectItem value="demerit" className="text-amber-600 font-bold">Demerit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</Label>
                                <Input 
                                    type="number" 
                                    value={form.points} 
                                    onChange={(e) => setForm({...form, points: e.target.value})} 
                                    className="h-11 rounded-xl border-slate-200 text-xs font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Category</Label>
                            <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</Label>
                            <Input 
                                value={form.description} 
                                onChange={(e) => setForm({...form, description: e.target.value})} 
                                className="h-11 rounded-xl border-slate-200 text-xs font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incident Date</Label>
                            <Input 
                                type="date" 
                                value={form.incident_date} 
                                onChange={(e) => setForm({...form, incident_date: e.target.value})} 
                                className="h-11 rounded-xl border-slate-200 text-xs font-bold" 
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedRecord(null); }} className="flex-1 h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50">
                                Abort
                            </Button>
                            <Button onClick={handleEdit} disabled={loading} className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-black font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95">
                                {loading ? "Updating..." : "Commit Changes"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}