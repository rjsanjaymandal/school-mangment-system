"use client";

import { useState } from "react";
import { Shield, Plus, TrendingUp, TrendingDown, Award, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addConductRecord } from "@/app/actions/health";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ConductDashboardProps {
    records: any[];
    students: any[];
    teachers: any[];
    userRole?: string | null;
}

export function ConductDashboard({ records, students, teachers, userRole }: ConductDashboardProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ student_id: "", teacher_id: "", type: "merit" as "merit" | "demerit", points: "1", category: "Discipline", description: "" });

    const handleAdd = async () => {
        setLoading(true);
        await addConductRecord({ ...form, points: parseInt(form.points) || 1 });
        setLoading(false);
        setIsAddOpen(false);
        setForm({ student_id: "", teacher_id: "", type: "merit", points: "1", category: "Discipline", description: "" });
        router.refresh();
    };

    const totalMerits = records.filter(r => r.type === "merit").reduce((s, r) => s + r.points, 0);
    const totalDemerits = records.filter(r => r.type === "demerit").reduce((s, r) => s + r.points, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Student Conduct
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Student merits, demerits, and disciplinary records
                    </p>
                </div>
                {isAdminOrTeacher && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue"><Plus className="h-4 w-4" /> Record</Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Add Conduct Record</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Student</Label>
                                    <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.profile?.first_name} {s.profile?.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Type</Label>
                                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "merit" | "demerit" })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="merit">Merit</SelectItem>
                                                <SelectItem value="demerit">Demerit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Points</Label>
                                        <Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Category</Label>
                                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{["Discipline", "Academics", "Sports", "Leadership", "Community", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
                                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                                </div>
                                <Button onClick={handleAdd} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold">
                                    {loading ? "Saving..." : "Save Record"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2 italic">Total Merits</p>
                    <div className="flex items-center gap-x-4">
                        <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{totalMerits}</h3>
                        <TrendingUp className="h-6 w-6 text-primary emerald-glow" />
                    </div>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-destructive transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive mb-2 italic">Total Demerits</p>
                    <div className="flex items-center gap-x-4">
                        <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{totalDemerits}</h3>
                        <TrendingDown className="h-6 w-6 text-destructive" />
                    </div>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Overall Conduct Score</p>
                    <div className="flex items-center gap-x-4">
                        <h3 className="text-4xl font-black text-foreground tracking-tighter italic underline decoration-primary/20 underline-offset-4">{totalMerits - totalDemerits}</h3>
                        <Star className="h-6 w-6 text-primary/40" />
                    </div>
                </Card>
            </div>

            {/* Records Table */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/50">
                        <tr className="border-b">
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Student</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Type</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Points</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Category</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Description</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {records.length === 0 ? (
                            <tr><td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No conduct records yet.</td></tr>
                        ) : (
                            records.map((r) => (
                                <tr key={r.id} className="hover:bg-primary/5 transition-all group border-b border-primary/5 last:border-0 font-mono text-xs">
                                    <td className="py-6 px-8 flex items-center gap-x-6">
                                        <div className={cn("h-12 w-12 rounded-sm flex items-center justify-center font-black border transition-all shadow-md", 
                                            r.type === "merit" ? "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white" : "bg-destructive/10 text-destructive border-destructive/20 group-hover:bg-destructive group-hover:text-white")}>
                                            {r.type === "merit" ? <Award className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors text-sm">{r.student?.profile?.first_name} {r.student?.profile?.last_name}</p>
                                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mt-0.5">ID: {r.student?.admission_number}</p>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8">
                                        <Badge variant="outline" className={cn("font-black text-[10px] px-3 py-1 rounded-sm uppercase tracking-[0.2em] shadow-lg italic", 
                                            r.type === "merit" ? "bg-primary text-primary-foreground emerald-glow" : "bg-destructive text-destructive-foreground shadow-destructive/20")}>
                                            {r.type.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-black text-foreground text-lg italic tracking-tighter underline decoration-primary/20">{r.points}</td>
                                    <td className="py-6 px-8 text-foreground/60 font-black uppercase tracking-widest text-[10px] italic">{r.category}</td>
                                    <td className="py-6 px-8 text-foreground/40 text-[10px] font-bold uppercase tracking-widest max-w-[200px] truncate">{r.description || "NO DESCRIPTION"}</td>
                                    <td className="py-6 px-8 text-primary font-black tracking-widest text-[10px]">{r.incident_date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

