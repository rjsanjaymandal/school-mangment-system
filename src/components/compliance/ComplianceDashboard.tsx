"use client";

import { useState } from "react";
import {
    FileText, Shield, Download, Eye, AlertTriangle, Calendar, Upload, Search, Lock, CheckCircle2, Plus, Activity, Zap
} from "lucide-react";
import { 
    BarChart, Bar, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { useMemo } from "react";
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

const DOCUMENT_CATEGORIES = ["Legal", "Academic", "HR", "Financial", "Administrative"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ComplianceDashboard({ documents, auditLogs }: ComplianceDashboardProps) {
    const router = useRouter();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [docForm, setDocForm] = useState({ title: "", category: "Academic", expiry_date: "" });
    const [currentTimestamp] = useState(() => Date.now());

    const handleCreate = async () => {
        setLoading(true);
        await createDocument({ ...docForm, expiry_date: docForm.expiry_date || undefined });
        setLoading(false);
        setIsUploadOpen(false);
        setDocForm({ title: "", category: "Academic", expiry_date: "" });
        router.refresh();
    };

    const filteredDocs = documents.filter(d => (d.title?.toLowerCase() || "").includes(search.toLowerCase()));
    const categoryCount = DOCUMENT_CATEGORIES.map(c => ({ name: c, count: documents.filter(d => d.category === c).length }));
    const expiringDocs = documents.filter(d => {
        if (!d.expiry_date) return false;
        const diff = new Date(d.expiry_date).getTime() - currentTimestamp;
        return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
    });

    // --- Compliance Intelligence Layer ---
    const auditVelocity = useMemo(() => {
        const baseline = MONTH_LABELS.reduce<Record<string, { name: string; Audits: number; Findings: number }>>((acc, month) => {
            acc[month] = { name: month, Audits: 0, Findings: 0 };
            return acc;
        }, {});

        auditLogs.forEach((log) => {
            if (!log.created_at) return;

            const month = new Date(log.created_at).toLocaleDateString("en-US", { month: "short" });
            const bucket = baseline[month];

            if (!bucket) return;

            bucket.Audits += 1;
            if (/(delete|revoke|reject|error|fail)/i.test(log.action || "")) {
                bucket.Findings += 1;
            }
        });

        return MONTH_LABELS.map((month) => baseline[month]);
    }, [auditLogs]);

    const riskProfiling = useMemo(() => {
        return DOCUMENT_CATEGORIES.map((category) => {
            const docsInCategory = documents.filter((doc) => doc.category === category);
            const expiringCount = docsInCategory.filter((doc) => {
                if (!doc.expiry_date) return false;
                const diff = new Date(doc.expiry_date).getTime() - currentTimestamp;
                return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
            }).length;

            const coverage = docsInCategory.length === 0
                ? 100
                : Math.max(0, Math.round(((docsInCategory.length - expiringCount) / docsInCategory.length) * 100));

            return {
                subject: category,
                A: coverage,
                fullMark: 100,
            };
        });
    }, [currentTimestamp, documents]);

    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        School Documents
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Official Document Management
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue"><Upload className="h-4 w-4" /> Upload Document</Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Upload Document</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Document Title</Label>
                                    <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="Document Title..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Category</Label>
                                        <Select value={docForm.category} onValueChange={(v) => setDocForm({ ...docForm, category: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{DOCUMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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

            {/* --- Analytics Layer: Institutional Compliance Intelligence --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1 w-full relative z-10 mt-10">
                <div className="md:col-span-8 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    Audit <span className="text-primary italic">Velocity</span>
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic flex items-center gap-2">
                                    Temporal Institutional Safety Flow
                                </p>
                            </div>
                            <Activity className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={auditVelocity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888870", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888850", fontSize: 10 }} />
                                    <Tooltip 
                                        cursor={{ fill: "rgba(16,185,129,0.05)" }}
                                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                    />
                                    <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">{value}</span>}/>
                                    <Bar dataKey="Audits" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar dataKey="Findings" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            Risk <span className="text-primary tracking-normal not-italic px-1">/</span> Profiling
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic text-center">Spectral Institutional Safety distribution</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskProfiling}>
                                <PolarGrid stroke="#88888820" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#88888860", fontSize: 8, fontWeight: "bold" }} />
                                <Radar
                                    name="Compliance"
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

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Document List</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-xs rounded-xl" />
                        </div>
                    </div>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <div className="divide-y divide-primary/10">
                            {filteredDocs.length === 0 ? (
                                <div className="p-16 text-center text-foreground/20 font-black uppercase tracking-[0.3em] italic">No Documents Found.</div>
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
                                                <span className="flex items-center gap-x-2 italic"><Calendar className="h-3 w-3 text-primary/40" /> Expiry Date: {doc.expiry_date || "UNDEFINED"}</span>
                                                <span className="flex items-center gap-x-2 italic"><Shield className="h-3 w-3 text-primary/40" /> Version: V{doc.version || 1}</span>
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

