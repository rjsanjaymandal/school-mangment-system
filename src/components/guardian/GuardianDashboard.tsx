"use client";

import {
    Heart, GraduationCap, ShieldCheck, Activity, Zap, Users, Award, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GuardianDashboardProps {
    guardianLinks: any[];
    recentConduct: any[];
    recentAttendance: any[];
}

export function GuardianDashboard({ guardianLinks, recentConduct, recentAttendance }: GuardianDashboardProps) {
    const totalStudents = new Set(guardianLinks.map(l => l.student_id)).size;
    const totalGuardians = new Set(guardianLinks.map(l => l.guardian_id)).size;
    const presentCount = recentAttendance.filter(a => a.status === "present").length;
    const attendanceRate = recentAttendance.length > 0 ? Math.round((presentCount / recentAttendance.length) * 100) : 100;
    const merits = recentConduct.filter(c => c.type === "merit").reduce((s, c) => s + c.points, 0);
    const demerits = recentConduct.filter(c => c.type === "demerit").reduce((s, c) => s + c.points, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center gap-x-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white neon-blue">
                    <Heart className="h-7 w-7 text-red-500 fill-red-500" />
                </div>
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Parent Pulse</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Guardian-Student Ecosystem Transparency</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
                    <div className="flex justify-between items-start mb-4"><Users className="h-8 w-8 text-blue-400" /><Badge className="bg-blue-500 border-none text-[10px] font-black">LINKED</Badge></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Links</p>
                    <h3 className="text-3xl font-black mt-1">{guardianLinks.length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <div className="flex justify-between items-start mb-4"><GraduationCap className="h-8 w-8 text-green-500" /><Badge className="bg-green-50 text-green-600 border-none text-[10px] font-black">ENROLLED</Badge></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Students Covered</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-900">{totalStudents}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <div className="flex justify-between items-start mb-4"><Activity className="h-8 w-8 text-blue-600" /><Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-black">RATE</Badge></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Rate</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-900">{attendanceRate}%</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <div className="flex justify-between items-start mb-4"><ShieldCheck className="h-8 w-8 text-purple-600" /><Badge className="bg-purple-50 text-purple-600 border-none text-[10px] font-black">NET</Badge></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conduct Score</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-900">+{merits - demerits}</h3>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2"><Zap className="h-4 w-4 text-yellow-500" /> Guardian-Student Links</h3>
                    <div className="space-y-4">
                        {guardianLinks.length === 0 ? (
                            <Card className="border-none glass futuristic-card p-12 text-center">
                                <p className="text-slate-400 font-medium">No guardian-student links configured yet.</p>
                            </Card>
                        ) : (
                            guardianLinks.map((link) => (
                                <Card key={link.id} className="border-none glass futuristic-card p-6 hover:bg-white hover:shadow-xl transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-x-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold neon-blue">
                                                {link.guardian?.first_name?.[0] || "G"}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900">{link.guardian?.first_name} {link.guardian?.last_name}</h4>
                                                <p className="text-xs text-slate-400 font-medium uppercase">{link.relationship || "Parent"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-700">{link.student?.profile?.first_name} {link.student?.profile?.last_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{link.student?.class?.name || "—"}</p>
                                        </div>
                                        {link.is_primary && <Badge className="ml-4 bg-blue-50 text-blue-600 border-none text-[10px] font-black">PRIMARY</Badge>}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2"><Calendar className="h-4 w-4 text-blue-500" /> Recent Conduct</h3>
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-6"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Behavioral Events</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {recentConduct.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-sm font-medium">No conduct records yet.</div>
                                ) : (
                                    recentConduct.slice(0, 5).map((c) => (
                                        <div key={c.id} className="p-4 flex items-start gap-x-3 hover:bg-slate-50 transition-colors">
                                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white", c.type === "merit" ? "bg-green-500" : "bg-red-500")}>
                                                <Award className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{c.student?.profile?.first_name} — {c.category}</h4>
                                                <p className="text-xs text-slate-500">{c.type === "merit" ? `+${c.points}` : `-${c.points}`} pts • {c.incident_date}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
