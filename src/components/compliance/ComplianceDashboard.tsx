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
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Regulatory Archives
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Institutional Governance & Immutable Document Infrastructure
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue"><Upload className="h-4 w-4" /> Upload Archive</Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Upload Document</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Document Title</Label>
                                    <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="Institutional Land Lease 2024" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Category</Label>
                                        <Select value={docForm.category} onValueChange={(v) => setDocForm({ ...docForm, category: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Expiry Date</Label>
                                        <Input type="date" value={docForm.expiry_date} onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleCreate} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold">
                                    {loading ? "Uploading..." : "Upload Document"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden shadow-2xl group hover:border-primary transition-all emerald-glow">
                    <CheckCircle2 className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary/10 group-hover:text-primary transition-all" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Archival Integrity</p>
                    <h3 className="text-4xl font-black text-foreground italic tracking-tighter">100% SECURE</h3>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 rounded-sm p-8 shadow-2xl relative overflow-hidden group">
                    <AlertTriangle className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-destructive/10 group-hover:text-destructive transition-all" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive mb-2">Protocol Expiry</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">{expiringDocs.length} NODES</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2">Registry Volume</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">{documents.length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2">Audit Delta</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">{auditLogs.length}</h3>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Institutional Archives</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search archives..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-xs rounded-xl" />
                        </div>
                    </div>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <div className="divide-y divide-primary/10">
                            {filteredDocs.length === 0 ? (
                                <div className="p-16 text-center text-foreground/20 font-black uppercase tracking-[0.3em] italic">No Archival Nodes Detected.</div>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <div key={doc.id} className="p-8 flex items-center gap-x-8 hover:bg-primary/5 transition-all group border-b border-primary/5 last:border-0">
                                        <div className="h-16 w-14 rounded-sm bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all emerald-glow shadow-md">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-x-4 mb-2">
                                                <h4 className="text-lg font-black text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors">{doc.title}</h4>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 px-2 py-0.5 rounded-sm italic">{(doc.category || "General").toUpperCase()}</Badge>
                                            </div>
                                            <div className="flex items-center gap-x-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                                <span className="flex items-center gap-x-2 italic"><Calendar className="h-3 w-3 text-primary/40" /> Expiry Protocol: {doc.expiry_date || "UNDEFINED"}</span>
                                                <span className="flex items-center gap-x-2 italic"><Shield className="h-3 w-3 text-primary/40" /> Revision Delta: V{doc.version || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-x-2"><Lock className="h-4 w-4 text-muted-foreground" /> Document Categories</h3>
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <CardHeader className="bg-card p-6"><CardTitle className="text-xs font-black uppercase tracking-widest text-blue-400">Categories</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {categoryCount.map((cat) => (
                                    <div key={cat.name} className="w-full p-4 flex items-center justify-between font-bold">
                                        <span className="text-sm text-slate-700">{cat.name} Archives</span>
                                        <Badge className="bg-slate-100 text-foreground">{cat.count}</Badge>
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
                                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-border">
                                        <p className="text-xs font-bold text-slate-700">{log.action} — {log.entity_type}</p>
                                        <p className="text-[10px] text-muted-foreground">{log.actor?.first_name} {log.actor?.last_name} • {new Date(log.created_at).toLocaleString()}</p>
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

