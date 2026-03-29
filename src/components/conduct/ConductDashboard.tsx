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
                    <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">
                        Student Conduct
                    </h2>
                    <p className="text-primary font-medium uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        Student merits, demerits, and disciplinary records
                    </p>
                </div>
                {isAdminOrTeacher && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-lg bg-primary text-primary-foreground font-bold shadow-sm px-6">
                                <Plus className="h-4 w-4 mr-2" /> Record
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border border-border rounded-xl">
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
                <Card className="border-border bg-card rounded-xl p-6 shadow-sm group hover:border-primary/50 transition-all">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">Total Merits</p>
                    <div className="flex items-center gap-x-3">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight italic">{totalMerits}</h3>
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                </Card>
                <Card className="border-border bg-card rounded-xl p-6 shadow-sm group hover:border-destructive/50 transition-all">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-2 italic">Total Demerits</p>
                    <div className="flex items-center gap-x-3">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight italic">{totalDemerits}</h3>
                        <TrendingDown className="h-5 w-5 text-destructive" />
                    </div>
                </Card>
                <Card className="border-border bg-card rounded-xl p-6 shadow-sm group hover:border-primary/50 transition-all">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 italic">Overall Conduct Score</p>
                    <div className="flex items-center gap-x-3">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight italic">{totalMerits - totalDemerits}</h3>
                        <Star className="h-5 w-5 text-primary/40" />
                    </div>
                </Card>
            </div>

            {/* Records Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b border-border">
                            <th className="text-left py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Student</th>
                            <th className="text-left py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Type</th>
                            <th className="text-left py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Points</th>
                            <th className="text-left py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Category</th>
                            <th className="text-left py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Description</th>
                            <th className="text-left py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {records.length === 0 ? (
                            <tr><td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No conduct records yet.</td></tr>
                        ) : (
                            records.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/30 transition-all group border-b border-border last:border-0 font-medium text-xs">
                                    <td className="py-4 px-6 flex items-center gap-x-4">
                                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center font-bold border transition-all shadow-sm", 
                                            r.type === "merit" ? "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white" : "bg-destructive/10 text-destructive border-destructive/20 group-hover:bg-destructive group-hover:text-white")}>
                                            {r.type === "merit" ? <Award className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors text-sm">{r.student?.profile?.first_name} {r.student?.profile?.last_name}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">ID: {r.student?.admission_number}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge variant="outline" className={cn("font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider italic shadow-sm", 
                                            r.type === "merit" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
                                            {r.type.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-foreground text-base tracking-tight">{r.points}</td>
                                    <td className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-widest text-[9px] italic">{r.category}</td>
                                    <td className="py-4 px-6 text-muted-foreground/60 text-[10px] font-medium uppercase tracking-widest max-w-[200px] truncate">{r.description || "NO DESCRIPTION"}</td>
                                    <td className="py-4 px-6 text-primary font-bold tracking-widest text-[10px]">{r.incident_date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

