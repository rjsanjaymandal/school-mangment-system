"use client";

import { useMemo, useState } from "react";
import { Activity, Calendar, FileText, Lock, Plus, Search, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { createDocumentArchive, deleteDocumentArchive, updateDocumentArchive } from "@/app/actions/compliance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CATEGORIES = ["Legal", "Academic", "HR", "Financial", "Administrative"];
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function ComplianceDashboard({ documents, auditLogs }: { documents: any[]; auditLogs: any[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [editingDocument, setEditingDocument] = useState<any>(null);
    const [form, setForm] = useState({ title: "", category: "Academic", expiry_date: "", file_path: "", version: "1", is_encrypted: "false" });

    const filteredDocs = useMemo(() => {
        return documents.filter((doc) => `${doc.title} ${doc.category}`.toLowerCase().includes(search.toLowerCase()));
    }, [documents, search]);

    const categoryData = useMemo(() => {
        return CATEGORIES.map((category) => ({ name: category, count: documents.filter((doc) => doc.category === category).length }));
    }, [documents]);

    const auditVelocity = useMemo(() => {
        const actionCounts: Record<string, number> = {};
        auditLogs.forEach((log) => {
            const key = log.action || "UNKNOWN";
            actionCounts[key] = (actionCounts[key] || 0) + 1;
        });
        return Object.entries(actionCounts).slice(0, 6).map(([name, count]) => ({ name, count }));
    }, [auditLogs]);

    const resetForm = () => setForm({ title: "", category: "Academic", expiry_date: "", file_path: "", version: "1", is_encrypted: "false" });

    const handleSave = async () => {
        if (!form.title) return toast.error("Document title is required.");
        setLoading(true);
        const payload = {
            title: form.title,
            category: form.category,
            expiry_date: form.expiry_date || undefined,
            file_path: form.file_path || undefined,
            version: Number(form.version) || 1,
            is_encrypted: form.is_encrypted === "true",
        };
        const result = editingDocument
            ? await updateDocumentArchive(editingDocument.id, payload)
            : await createDocumentArchive(payload);
        setLoading(false);
        if (!result.success) return toast.error(result.error || "Failed to save document");
        toast.success(editingDocument ? "Document updated" : "Document created");
        setOpen(false);
        setEditingDocument(null);
        resetForm();
        router.refresh();
    };

    const handleEdit = (document: any) => {
        setEditingDocument(document);
        setForm({
            title: document.title || "",
            category: document.category || "Academic",
            expiry_date: document.expiry_date || "",
            file_path: document.file_path || "",
            version: String(document.version || 1),
            is_encrypted: document.is_encrypted ? "true" : "false",
        });
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this document record?")) return;
        const result = await deleteDocumentArchive(id);
        if (!result.success) return toast.error(result.error || "Failed to delete document");
        toast.success("Document deleted");
        router.refresh();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">School Documents</h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">Compliance archives and audit visibility</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild><Button onClick={() => { setEditingDocument(null); resetForm(); }}><Plus className="h-4 w-4 mr-2" /> Add Document</Button></DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader><DialogTitle>{editingDocument ? "Edit Document" : "Add Document"}</DialogTitle></DialogHeader>
                        <div className="grid gap-4">
                            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Category</Label><Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
                                <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>File Path</Label><Input value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} placeholder="/docs/policy.pdf" /></div>
                                <div className="space-y-2"><Label>Version</Label><Input type="number" min="1" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><Label>Encryption</Label><Select value={form.is_encrypted} onValueChange={(value) => setForm({ ...form, is_encrypted: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="false">Standard</SelectItem><SelectItem value="true">Encrypted</SelectItem></SelectContent></Select></div>
                            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : editingDocument ? "Update Document" : "Create Document"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                <Card className="md:col-span-7 p-8 border border-border"><div className="mb-6 flex items-center justify-between"><div><h3 className="text-xl font-bold">Audit Activity</h3><p className="text-xs text-muted-foreground">Recent compliance trail by action</p></div><Activity className="h-5 w-5 text-primary" /></div><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={auditVelocity}><CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
                <Card className="md:col-span-5 p-8 border border-border"><div className="mb-6"><h3 className="text-xl font-bold">Document Distribution</h3><p className="text-xs text-muted-foreground">Archive count by category</p></div><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="count" innerRadius={60} outerRadius={90}>{categoryData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div></Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Documents</p><h3 className="text-4xl font-bold mt-2">{documents.length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Encrypted</p><h3 className="text-4xl font-bold mt-2">{documents.filter((doc) => doc.is_encrypted).length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Expiring Soon</p><h3 className="text-4xl font-bold mt-2">{documents.filter((doc) => doc.expiry_date && new Date(doc.expiry_date) >= new Date()).length}</h3></Card>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search documents..." />
                </div>
            </div>

            <Card className="overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted"><tr><th className="p-4 text-left">Title</th><th className="p-4 text-left">Category</th><th className="p-4 text-left">Expiry</th><th className="p-4 text-left">Security</th><th className="p-4 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-border">
                            {filteredDocs.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No documents found.</td></tr> : filteredDocs.map((doc) => <tr key={doc.id}><td className="p-4"><div className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {doc.title}</div><div className="text-xs text-muted-foreground">{doc.file_path || "Metadata only"}</div></td><td className="p-4">{doc.category}</td><td className="p-4"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {doc.expiry_date || "None"}</div></td><td className="p-4"><Badge variant="outline" className={doc.is_encrypted ? "border-primary/20 text-primary bg-primary/5" : "border-border"}><Lock className="h-3 w-3 mr-1" /> {doc.is_encrypted ? "Encrypted" : "Standard"}</Badge></td><td className="p-4 text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}>Edit</Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
