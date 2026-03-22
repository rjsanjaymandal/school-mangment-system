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
            <div className="flex items-center gap-x-6">
                <div className="h-16 w-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg emerald-glow">
                    <Heart className="h-8 w-8 text-primary group-hover:fill-primary transition-all" />
                </div>
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Guardian Ecosystem
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Institutional Transparency & Family-Student Registry Protocols
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 pt-4">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden shadow-2xl group hover:border-primary transition-all">
                    <Users className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Registry Links</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{guardianLinks.length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden shadow-2xl group hover:border-primary transition-all">
                    <GraduationCap className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 italic">Enrolled Progeny</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{totalStudents}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Attendance Rate</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic underline decoration-primary/20 underline-offset-4">{attendanceRate}%</h3>
                </Card>
                <Card className="border-secondary/20 bg-secondary/5 backdrop-blur-xl rounded-sm p-8 relative shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2 italic">Net Integrity Score</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">+{merits - demerits}</h3>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic flex items-center gap-x-3">
                        <Zap className="h-4 w-4" /> 
                        Registry Vectors
                    </h3>
                    <div className="space-y-4">
                        {guardianLinks.length === 0 ? (
                            <Card className="border-none glass futuristic-card p-12 text-center">
                                <p className="text-muted-foreground font-medium">No guardian-student links configured yet.</p>
                            </Card>
                        ) : (
                            guardianLinks.map((link) => (
                                <Card key={link.id} className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 hover:border-primary transition-all group shadow-2xl relative overflow-hidden">
                                    <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-x-6">
                                            <div className="h-12 w-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary shadow-lg emerald-glow uppercase">
                                                {link.guardian?.first_name?.[0] || "G"}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors">{link.guardian?.first_name} {link.guardian?.last_name}</h4>
                                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-1">{link.relationship || "LIAISON"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-foreground uppercase tracking-widest italic">{link.student?.profile?.first_name} {link.student?.profile?.last_name}</p>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 opacity-60">{link.student?.class?.name || "UNASSIGNED"}</p>
                                        </div>
                                        {link.is_primary && (
                                            <Badge className="ml-6 bg-primary text-primary-foreground border-none font-black text-[9px] px-3 py-1 rounded-sm uppercase tracking-[0.2em] emerald-glow">
                                                PRIMARY
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-x-2"><Calendar className="h-4 w-4 text-blue-500" /> Recent Conduct</h3>
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <CardHeader className="bg-card text-white p-6"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Behavioral Events</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {recentConduct.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-sm font-medium">No conduct records yet.</div>
                                ) : (
                                    recentConduct.slice(0, 5).map((c) => (
                                        <div key={c.id} className="p-4 flex items-start gap-x-3 hover:bg-slate-50 transition-colors">
                                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white", c.type === "merit" ? "bg-green-500" : "bg-red-500")}>
                                                <Award className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground text-sm">{c.student?.profile?.first_name} — {c.category}</h4>
                                                <p className="text-xs text-muted-foreground">{c.type === "merit" ? `+${c.points}` : `-${c.points}`} pts • {c.incident_date}</p>
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

