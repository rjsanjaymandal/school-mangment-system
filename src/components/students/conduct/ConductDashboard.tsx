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
    FileText,
    X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { addConductRecord, updateConductRecord, deleteConductRecord } from "@/app/actions/conduct";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

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
        <div className="space-y-8 animate-in fade-in duration-700">
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

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-1 flex-col lg:flex-row gap-4 w-full">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by student name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 pl-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-bold"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                className="h-11 w-[140px] rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Types</option>
                                <option value="merit" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Merit</option>
                                <option value="demerit" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Demerit</option>
                            </select>
                            <select
                                className="h-11 w-[160px] rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isAdminOrTeacher && (
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add Record
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-1.5 rounded bg-purple-50 text-purple-600">
                            <FileText className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conduct Ledger</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Historical behavioral audit trail</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Target Student</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Assessment</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Impact</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Timestamp</span></th>
                                    {isAdminOrTeacher && <th className="px-6 py-4 text-right"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Control</span></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminOrTeacher ? 7 : 6} className="py-24 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-full mb-4">
                                                    <Shield className="h-12 w-12 text-slate-200" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No behavioral records identified</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm">
                                                        <User className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{record.student?.profile?.full_name}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{record.student?.admission_number}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    record.type === "merit" 
                                                        ? "bg-emerald-50 text-emerald-600" 
                                                        : "bg-amber-50 text-amber-600"
                                                )}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50">
                                                    {record.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "font-black text-sm tabular-nums",
                                                    record.type === "merit" ? "text-emerald-600" : "text-amber-600"
                                                )}>
                                                    {record.type === "merit" ? "+" : "-"}{record.points}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-3 w-3 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{record.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(record.incident_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            {isAdminOrTeacher && (
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(record)}
                                                            className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl inline-flex items-center justify-center"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Add Conduct Record</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Institutional behavioral framework</p>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center justify-center">
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Student</label>
                                <select
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                    value={form.student_id}
                                    onChange={(val) => setForm({...form, student_id: val.target.value})}
                                >
                                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select target student</option>
                                    {students.map((s: any) => (
                                        <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{s.profile?.full_name} ({s.admission_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Record Type</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={form.type}
                                        onChange={(e) => setForm({...form, type: e.target.value as "merit" | "demerit"})}
                                    >
                                        <option value="merit" className="bg-white dark:bg-slate-950 text-emerald-600 font-bold">Merit</option>
                                        <option value="demerit" className="bg-white dark:bg-slate-950 text-amber-600 font-bold">Demerit</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Points</label>
                                    <Input 
                                        type="number" 
                                        value={form.points} 
                                        onChange={(e) => setForm({...form, points: e.target.value})} 
                                        className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Institutional Category</label>
                                <select
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                    value={form.category}
                                    onChange={(e) => setForm({...form, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Detailed Description</label>
                                <Input 
                                    value={form.description} 
                                    onChange={(e) => setForm({...form, description: e.target.value})} 
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-bold" 
                                    placeholder="Nature of the incident or achievement..." 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Incident Date</label>
                                <Input 
                                    type="date" 
                                    value={form.incident_date} 
                                    onChange={(e) => setForm({...form, incident_date: e.target.value})} 
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 text-xs font-bold" 
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Commit Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Edit Record</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Modification of behavioral metrics</p>
                            </div>
                            <button onClick={() => { setIsEditOpen(false); setSelectedRecord(null); }} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center justify-center">
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Record Type</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={form.type}
                                        onChange={(e) => setForm({...form, type: e.target.value as "merit" | "demerit"})}
                                    >
                                        <option value="merit" className="bg-white dark:bg-slate-950 text-emerald-600 font-bold">Merit</option>
                                        <option value="demerit" className="bg-white dark:bg-slate-950 text-amber-600 font-bold">Demerit</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Points</label>
                                    <Input 
                                        type="number" 
                                        value={form.points} 
                                        onChange={(e) => setForm({...form, points: e.target.value})} 
                                        className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Institutional Category</label>
                                <select
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                    value={form.category}
                                    onChange={(e) => setForm({...form, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Detailed Description</label>
                                <Input 
                                    value={form.description} 
                                    onChange={(e) => setForm({...form, description: e.target.value})} 
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 text-xs font-bold" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Incident Date</label>
                                <Input 
                                    type="date" 
                                    value={form.incident_date} 
                                    onChange={(e) => setForm({...form, incident_date: e.target.value})} 
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 text-xs font-bold" 
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setIsEditOpen(false); setSelectedRecord(null); }} className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                    Abort
                                </button>
                                <button onClick={handleEdit} disabled={loading} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                    {loading ? "Updating..." : "Commit Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}