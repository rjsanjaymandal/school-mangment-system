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
}

export function ConductDashboard({ records, students, teachers }: ConductDashboardProps) {
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
                    <h2 className="text-4xl font-black tracking-tight text-foreground">Student Conduct</h2>
                    <p className="text-muted-foreground font-medium tracking-tight">Merit & Demerit Conduct Tracking</p>
                </div>
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
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none glass futuristic-card"><CardContent className="p-6"><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Merits</p><div className="flex items-center gap-x-2"><h3 className="text-3xl font-black text-green-600">{totalMerits}</h3><TrendingUp className="h-5 w-5 text-green-500" /></div></CardContent></Card>
                <Card className="border-none glass futuristic-card"><CardContent className="p-6"><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Demerits</p><div className="flex items-center gap-x-2"><h3 className="text-3xl font-black text-red-500">{totalDemerits}</h3><TrendingDown className="h-5 w-5 text-red-500" /></div></CardContent></Card>
                <Card className="border-none glass futuristic-card"><CardContent className="p-6"><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Net Score</p><div className="flex items-center gap-x-2"><h3 className="text-3xl font-black text-foreground">{totalMerits - totalDemerits}</h3><Star className="h-5 w-5 text-yellow-500" /></div></CardContent></Card>
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
                                <tr key={r.id} className="hover:bg-white/60 transition-colors">
                                    <td className="py-6 px-8 flex items-center gap-x-4">
                                        <div className={cn("h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold", r.type === "merit" ? "bg-green-500" : "bg-red-500")}>
                                            {r.type === "merit" ? <Award className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                        </div>
                                        <span className="font-bold text-foreground">{r.student?.profile?.first_name} {r.student?.profile?.last_name}</span>
                                    </td>
                                    <td className="py-6 px-8">
                                        <Badge variant="outline" className={cn("font-bold text-[10px]", r.type === "merit" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                                            {r.type.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 font-black text-foreground">{r.points}</td>
                                    <td className="py-6 px-8 text-muted-foreground font-medium">{r.category}</td>
                                    <td className="py-6 px-8 text-muted-foreground text-xs max-w-[200px] truncate">{r.description || "—"}</td>
                                    <td className="py-6 px-8 text-muted-foreground font-mono text-xs">{r.incident_date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

