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
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Health Center</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Student Health Records & Medical Management</p>
                </div>
                <div className="flex gap-x-3">
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 border-red-200 text-red-600 bg-red-50 gap-x-2 font-bold uppercase text-[10px]">
                        <AlertTriangle className="h-3 w-3" /> {activeVisits.length} Under Observation
                    </Badge>
                    <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue"><Plus className="h-4 w-4" /> Record Visit</Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none max-w-lg">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Infirmary Visit</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Student</Label>
                                    <Select value={logForm.student_id} onValueChange={(v) => setLogForm({ ...logForm, student_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.profile?.first_name} {s.profile?.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Reason</Label>
                                    <Input value={logForm.visit_reason} onChange={(e) => setLogForm({ ...logForm, visit_reason: e.target.value })} placeholder="Headache, fever, injury..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Symptoms</Label>
                                        <Input value={logForm.symptoms} onChange={(e) => setLogForm({ ...logForm, symptoms: e.target.value })} placeholder="Describe symptoms" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Temperature (°F)</Label>
                                        <Input type="number" step="0.1" value={logForm.temperature} onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })} placeholder="98.6" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Treatment</Label>
                                        <Input value={logForm.treatment_provided} onChange={(e) => setLogForm({ ...logForm, treatment_provided: e.target.value })} placeholder="Rest, ice pack..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Medication</Label>
                                        <Input value={logForm.medication_given} onChange={(e) => setLogForm({ ...logForm, medication_given: e.target.value })} placeholder="Paracetamol 500mg" />
                                    </div>
                                </div>
                                <Button onClick={handleCreateLog} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                    {loading ? "Recording..." : "Record Visit"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none glass futuristic-card"><CardContent className="p-6"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Visits</p><h3 className="text-3xl font-black text-slate-900">{infirmaryLogs.length}</h3></CardContent></Card>
                <Card className="border-none glass futuristic-card"><CardContent className="p-6"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Under Observation</p><h3 className="text-3xl font-black text-red-500">{activeVisits.length}</h3></CardContent></Card>
                <Card className="border-none glass futuristic-card"><CardContent className="p-6"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Health Profiles</p><h3 className="text-3xl font-black text-slate-900">{healthProfiles.length}</h3></CardContent></Card>
            </div>

            {/* Infirmary Logs */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/50">
                        <tr className="border-b">
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Student</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Reason</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Temp</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Treatment</th>
                            <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                            <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {infirmaryLogs.length === 0 ? (
                            <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-medium">No infirmary visits recorded yet.</td></tr>
                        ) : (
                            infirmaryLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/60 transition-colors">
                                    <td className="py-6 px-8 flex items-center gap-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold">
                                            <Heart className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-slate-900">{log.student?.profile?.first_name} {log.student?.profile?.last_name}</span>
                                    </td>
                                    <td className="py-6 px-8 text-slate-600 font-medium">{log.visit_reason}</td>
                                    <td className="py-6 px-8 font-mono text-xs text-slate-500">{log.temperature ? `${log.temperature}°F` : "—"}</td>
                                    <td className="py-6 px-8 text-slate-500 text-xs">{log.treatment_provided || "—"}</td>
                                    <td className="py-6 px-8">
                                        <Badge variant="outline" className={cn("font-bold text-[10px]",
                                            log.status === "under_observation" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                                log.status === "discharged" ? "bg-green-50 text-green-600 border-green-100" :
                                                    "bg-red-50 text-red-600 border-red-100"
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
