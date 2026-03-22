"use client";

import { useState } from "react";
import { Heart, Plus, Thermometer, Pill, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInfirmaryLog, dischargeFromInfirmary } from "@/app/actions/health";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HealthDashboardProps {
    infirmaryLogs: any[];
    healthProfiles: any[];
    students: any[];
}

export function HealthDashboard({ infirmaryLogs, healthProfiles, students }: HealthDashboardProps) {
    const router = useRouter();
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logForm, setLogForm] = useState({ student_id: "", visit_reason: "", symptoms: "", treatment_provided: "", medication_given: "", temperature: "" });

    const handleCreateLog = async () => {
        setLoading(true);
        await createInfirmaryLog({ ...logForm, temperature: logForm.temperature ? parseFloat(logForm.temperature) : undefined });
        setLoading(false);
        setIsLogOpen(false);
        setLogForm({ student_id: "", visit_reason: "", symptoms: "", treatment_provided: "", medication_given: "", temperature: "" });
        router.refresh();
    };

    const handleDischarge = async (id: string) => {
        setLoading(true);
        await dischargeFromInfirmary(id);
        setLoading(false);
        router.refresh();
    };

    const activeVisits = infirmaryLogs.filter(l => l.status === "under_observation");

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Medical Infrastructure
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Bio-Metric Health Records & Institutional Infirmary Protocols
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Badge variant="outline" className="rounded-sm px-4 py-1.5 border-destructive/20 text-destructive bg-destructive/5 gap-x-2 font-black uppercase text-[10px] tracking-widest shadow-lg">
                        <AlertTriangle className="h-3 w-3" /> {activeVisits.length} ACTIVE OBSERVATION NODES
                    </Badge>
                    <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue"><Plus className="h-4 w-4" /> Record Visit</Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none max-w-lg">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Infirmary Visit</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Student</Label>
                                    <Select value={logForm.student_id} onValueChange={(v) => setLogForm({ ...logForm, student_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.profile?.first_name} {s.profile?.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Reason</Label>
                                    <Input value={logForm.visit_reason} onChange={(e) => setLogForm({ ...logForm, visit_reason: e.target.value })} placeholder="Headache, fever, injury..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Symptoms</Label>
                                        <Input value={logForm.symptoms} onChange={(e) => setLogForm({ ...logForm, symptoms: e.target.value })} placeholder="Describe symptoms" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Temperature (°F)</Label>
                                        <Input type="number" step="0.1" value={logForm.temperature} onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })} placeholder="98.6" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Treatment</Label>
                                        <Input value={logForm.treatment_provided} onChange={(e) => setLogForm({ ...logForm, treatment_provided: e.target.value })} placeholder="Rest, ice pack..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Medication</Label>
                                        <Input value={logForm.medication_given} onChange={(e) => setLogForm({ ...logForm, medication_given: e.target.value })} placeholder="Paracetamol 500mg" />
                                    </div>
                                </div>
                                <Button onClick={handleCreateLog} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold">
                                    {loading ? "Recording..." : "Record Visit"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Total Clinical Visits</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic underline decoration-primary/20 underline-offset-4">{infirmaryLogs.length}</h3>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-xl rounded-sm p-8 shadow-2xl relative overflow-hidden group">
                    <Heart className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-destructive/10 group-hover:text-destructive transition-all" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive mb-2 italic">Current Observation</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{activeVisits.length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Active Bio-Profiles</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{healthProfiles.length}</h3>
                </Card>
            </div>

            {/* Infirmary Logs */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/50">
                        <tr className="border-b">
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Student</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Reason</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Temp</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Treatment</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</th>
                            <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {infirmaryLogs.length === 0 ? (
                            <tr><td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No infirmary visits recorded yet.</td></tr>
                        ) : (
                            infirmaryLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/60 transition-colors">
                                    <td className="py-6 px-8 flex items-center gap-x-6 group">
                                        <div className="h-12 w-12 rounded-sm bg-destructive/10 text-destructive flex items-center justify-center font-black border border-destructive/20 transition-all group-hover:bg-destructive group-hover:text-white shadow-md">
                                            <Heart className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors">{log.student?.profile?.first_name} {log.student?.profile?.last_name}</p>
                                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mt-0.5">ID: {log.student?.admission_number}</p>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 text-foreground font-black uppercase text-xs tracking-tight">{log.visit_reason}</td>
                                    <td className="py-6 px-8 font-mono text-[11px] font-black text-primary p-2 bg-primary/5 rounded-sm w-fit border border-primary/10">{log.temperature ? `${log.temperature}°F` : "—"}</td>
                                    <td className="py-6 px-8 text-foreground/60 text-[10px] font-bold uppercase tracking-widest">{log.treatment_provided || "—"}</td>
                                    <td className="py-6 px-8">
                                        <Badge variant="outline" className={cn("font-black text-[10px] px-3 py-1 rounded-sm uppercase tracking-[0.2em] shadow-lg",
                                            log.status === "under_observation" ? "bg-destructive text-destructive border-destructive/20 shadow-destructive/10" :
                                                log.status === "discharged" ? "bg-primary text-primary-foreground emerald-glow border-primary/20" :
                                                    "bg-foreground/5 text-foreground border-border"
                                        )}>
                                            {log.status?.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        {log.status === "under_observation" && (
                                            <Button size="sm" variant="ghost" onClick={() => handleDischarge(log.id)} className="rounded-xl font-bold text-xs text-green-500 hover:bg-green-50">
                                                <CheckCircle className="h-4 w-4 mr-1" /> DISCHARGE
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

