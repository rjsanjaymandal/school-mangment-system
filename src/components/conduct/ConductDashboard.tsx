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
        if (!confirm("Delete this record?")) return;
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
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Merits</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.merits}</p>
                            </div>
                            <Award className="h-8 w-8 text-emerald-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Demerits</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.demerits}</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-amber-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-violet-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Points</p>
                                <p className="text-2xl font-bold text-violet-600">{stats.totalPoints}</p>
                            </div>
                            <Star className="h-8 w-8 text-violet-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or admission number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 rounded-md"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-40 rounded-md">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="merit">Merit</SelectItem>
                                <SelectItem value="demerit">Demerit</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-40 rounded-md">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Records Table */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Behavior Records</CardTitle>
                        {isAdminOrTeacher && (
                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="rounded-md bg-emerald-600 hover:bg-emerald-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Record
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add Conduct Record</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Student</Label>
                                            <Select value={form.student_id} onValueChange={(val) => setForm({...form, student_id: val})}>
                                                <SelectTrigger className="rounded-md">
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {students.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>
                                                            {s.profile?.full_name} ({s.admission_number})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select value={form.type} onValueChange={(val) => setForm({...form, type: val as "merit" | "demerit"})}>
                                                    <SelectTrigger className="rounded-md">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="merit">Merit</SelectItem>
                                                        <SelectItem value="demerit">Demerit</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Points</Label>
                                                <Input type="number" value={form.points} onChange={(e) => setForm({...form, points: e.target.value})} className="rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                                                <SelectTrigger className="rounded-md">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="rounded-md" placeholder="Enter description" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Incident Date</Label>
                                            <Input type="date" value={form.incident_date} onChange={(e) => setForm({...form, incident_date: e.target.value})} className="rounded-md" />
                                        </div>
                                        <Button onClick={handleAdd} disabled={loading} className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700">
                                            {loading ? "Saving..." : "Save Record"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Student</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Points</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                                    {isAdminOrTeacher && <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminOrTeacher ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{record.student?.profile?.full_name}</p>
                                                        <p className="text-xs text-slate-500">{record.student?.admission_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={record.type === "merit" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                                                    {record.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{record.category}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn("font-semibold", record.type === "merit" ? "text-emerald-600" : "text-amber-600")}>
                                                    {record.type === "merit" ? "+" : "-"}{record.points}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{record.description}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{new Date(record.incident_date).toLocaleDateString()}</td>
                                            {isAdminOrTeacher && (
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(record)} className="h-8 w-8">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)} className="h-8 w-8 text-red-500 hover:text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Conduct Record</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={form.type} onValueChange={(val) => setForm({...form, type: val as "merit" | "demerit"})}>
                                    <SelectTrigger className="rounded-md">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="merit">Merit</SelectItem>
                                        <SelectItem value="demerit">Demerit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Points</Label>
                                <Input type="number" value={form.points} onChange={(e) => setForm({...form, points: e.target.value})} className="rounded-md" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                                <SelectTrigger className="rounded-md">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Label>Incident Date</Label>
                            <Input type="date" value={form.incident_date} onChange={(e) => setForm({...form, incident_date: e.target.value})} className="rounded-md" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedRecord(null); }} className="flex-1 rounded-md">
                                Cancel
                            </Button>
                            <Button onClick={handleEdit} disabled={loading} className="flex-1 rounded-md bg-emerald-600 hover:bg-emerald-700">
                                {loading ? "Saving..." : "Update"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}