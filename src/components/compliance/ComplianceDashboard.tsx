"use client";

import { useMemo, useState } from "react";
import { Activity, Calendar, FileText, Lock, Plus, Search, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { createDocumentArchive, deleteDocumentArchive, updateDocumentArchive } from "@/app/actions/compliance";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Legal", "Academic", "HR", "Financial", "Admin"];
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
            <UnifiedPageHeader
                title="School Documents"
                subtitle="Compliance archives and audit visibility"
                icon={FileText}
                actions={
                    <button onClick={() => { setEditingDocument(null); resetForm(); setOpen(true); }} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all">
                        <Plus className="h-4 w-4 inline mr-2" /> Add Document
                    </button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DashboardStatCard title="Documents" value={documents.length} icon={FileText} color="blue" description="Total archives" />
                <DashboardStatCard title="Encrypted" value={documents.filter((doc) => doc.is_encrypted).length} icon={Lock} color="emerald" description="Secured" />
                <DashboardStatCard title="Expiring Soon" value={documents.filter((doc) => doc.expiry_date && new Date(doc.expiry_date) >= new Date()).length} icon={Calendar} color="amber" description="Active expirations" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Audit Activity</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Recent compliance trail by action</p>
                        </div>
                        <Activity className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={auditVelocity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontWeight: "bold" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }}
                                    labelStyle={{ color: "var(--foreground)" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="mb-4">
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Document Distribution</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Archive count by category</p>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} dataKey="count" innerRadius={60} outerRadius={90}>
                                    {categoryData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }}
                                    labelStyle={{ color: "var(--foreground)" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Search documents..." />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Title</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Category</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Expiry</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Security</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredDocs.length === 0 ? (
                                <tr><td colSpan={5} className="p-16 text-center text-sm font-bold text-slate-500 dark:text-slate-400">No documents found.</td></tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-emerald-600" /> {doc.title}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{doc.file_path || "Metadata only"}</div>
                                        </td>
                                        <td className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">{doc.category}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                                <Calendar className="h-4 w-4 text-slate-400" /> {doc.expiry_date || "None"}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", doc.is_encrypted ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800")}>
                                                <Lock className="h-3 w-3 inline mr-1" /> {doc.is_encrypted ? "Encrypted" : "Standard"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(doc)} className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">Edit</button>
                                                <button onClick={() => handleDelete(doc.id)} className="h-8 w-8 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Document Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{editingDocument ? "Edit Document" : "Add Document"}</h3>
                            <button onClick={() => { setOpen(false); setEditingDocument(null); }} className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center">
                                <svg className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Title</label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                        {CATEGORIES.map((category) => <option key={category} value={category} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{category}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Expiry Date</label>
                                    <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">File Path</label>
                                    <Input value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} placeholder="/docs/policy.pdf" className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Version</label>
                                    <Input type="number" min="1" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Encryption</label>
                                <select value={form.is_encrypted} onChange={(e) => setForm({ ...form, is_encrypted: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                    <option value="false" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Standard</option>
                                    <option value="true" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Encrypted</option>
                                </select>
                            </div>
                            <button onClick={handleSave} disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {loading ? "Saving..." : editingDocument ? "Update Document" : "Create Document"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}