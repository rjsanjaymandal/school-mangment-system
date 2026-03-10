"use client";

import { useState } from "react";
import {
    FileText, Shield, Download, Eye, AlertTriangle, Calendar, Upload, Search, Lock, CheckCircle2, Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDocument } from "@/app/actions/modules";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ComplianceDashboardProps {
    documents: any[];
    auditLogs: any[];
}

export function ComplianceDashboard({ documents, auditLogs }: ComplianceDashboardProps) {
    const router = useRouter();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [docForm, setDocForm] = useState({ title: "", category: "Academic", expiry_date: "" });

    const handleCreate = async () => {
        setLoading(true);
        await createDocument({ ...docForm, expiry_date: docForm.expiry_date || undefined });
        setLoading(false);
        setIsUploadOpen(false);
        setDocForm({ title: "", category: "Academic", expiry_date: "" });
        router.refresh();
    };

    const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
    const categories = ["Legal", "Academic", "HR", "Financial", "Administrative"];
    const categoryCount = categories.map(c => ({ name: c, count: documents.filter(d => d.category === c).length }));
    const expiringDocs = documents.filter(d => {
        if (!d.expiry_date) return false;
        const diff = new Date(d.expiry_date).getTime() - Date.now();
        return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Legal & Documents</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Institutional Archives & Regulatory Document Management</p>
                </div>
                <div className="flex gap-x-3">
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue"><Upload className="h-4 w-4" /> Upload Archive</Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Upload Document</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Document Title</Label>
                                    <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="Institutional Land Lease 2024" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Category</Label>
                                        <Select value={docForm.category} onValueChange={(v) => setDocForm({ ...docForm, category: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Expiry Date</Label>
                                        <Input type="date" value={docForm.expiry_date} onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleCreate} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                    {loading ? "Uploading..." : "Upload Document"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Archival Health</p>
                    <h3 className="text-3xl font-black mt-2">100% Secure</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-300"><CheckCircle2 className="h-4 w-4" /> No Breaches</div>
                </Card>
                <Card className="border-none glass futuristic-card p-6 border-yellow-100 bg-yellow-50/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">Expiring Soon</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-900">{expiringDocs.length} Documents</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-yellow-600"><AlertTriangle className="h-4 w-4" /> Within 90 days</div>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Documents</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-900">{documents.length}</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400">Institutional Repository</div>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Events</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-900">{auditLogs.length}</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-500">Audit Clear</div>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Institutional Archives</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search archives..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-xs rounded-xl" />
                        </div>
                    </div>

                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredDocs.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 font-medium">No documents in the archive yet.</div>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <div key={doc.id} className="p-6 flex items-center gap-x-6 hover:bg-white/50 transition-all group">
                                        <div className="h-14 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-x-2 mb-1">
                                                <h4 className="font-black text-slate-900 truncate">{doc.title}</h4>
                                                <Badge variant="outline" className="text-[8px] font-black border-slate-200">{(doc.category || "General").toUpperCase()}</Badge>
                                            </div>
                                            <div className="flex items-center gap-x-4 text-[10px] font-bold text-slate-400 uppercase">
                                                <span className="flex items-center gap-x-1"><Calendar className="h-3 w-3" /> Expiry: {doc.expiry_date || "N/A"}</span>
                                                <span className="flex items-center gap-x-1"><Shield className="h-3 w-3" /> Version: V{doc.version || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2"><Lock className="h-4 w-4 text-slate-400" /> Document Categories</h3>
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <CardHeader className="bg-slate-900 p-6"><CardTitle className="text-xs font-black uppercase tracking-widest text-blue-400">Categories</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {categoryCount.map((cat) => (
                                    <div key={cat.name} className="w-full p-4 flex items-center justify-between font-bold">
                                        <span className="text-sm text-slate-700">{cat.name} Archives</span>
                                        <Badge className="bg-slate-100 text-slate-900">{cat.count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {auditLogs.length > 0 && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader><CardTitle className="text-sm font-bold">Recent Audit Trail</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {auditLogs.slice(0, 5).map((log) => (
                                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-xs font-bold text-slate-700">{log.action} — {log.entity_type}</p>
                                        <p className="text-[10px] text-slate-400">{log.actor?.first_name} {log.actor?.last_name} • {new Date(log.created_at).toLocaleString()}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
