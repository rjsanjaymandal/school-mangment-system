"use client";

import {
    Heart, GraduationCap, ShieldCheck, Activity, Zap, Users, Award, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Guardian Ecosystem</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Institutional Transparency & Family-Student Registry Protocols</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Registry Links" value={guardianLinks.length} icon={Users} color="blue" description="Guardian-student links" />
                <DashboardStatCard title="Enrolled Progeny" value={totalStudents} icon={GraduationCap} color="emerald" description="Unique students" />
                <DashboardStatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={ShieldCheck} color="amber" description="Recent attendance" />
                <DashboardStatCard title="Net Integrity Score" value={`+${merits - demerits}`} icon={Award} color="purple" description="Merits minus demerits" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Registry Vectors
                    </h3>
                    <div className="space-y-4">
                        {guardianLinks.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No guardian-student links configured yet.</p>
                            </div>
                        ) : (
                            guardianLinks.map((link) => (
                                <div key={link.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-300 transition-all relative overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center font-black text-emerald-600 uppercase">
                                                {link.guardian?.first_name?.[0] || "G"}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{link.guardian?.first_name} {link.guardian?.last_name}</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{link.relationship || "LIAISON"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{link.student?.profile?.first_name} {link.student?.profile?.last_name}</p>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mt-0.5 opacity-60">{link.student?.class?.name || "UNASSIGNED"}</p>
                                        </div>
                                        {link.is_primary && (
                                            <span className="ml-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white">
                                                PRIMARY
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" /> Recent Conduct
                    </h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Behavioral Events</h4>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentConduct.length === 0 ? (
                                <div className="p-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">No conduct records yet.</div>
                            ) : (
                                recentConduct.slice(0, 5).map((c) => (
                                    <div key={c.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-white", c.type === "merit" ? "bg-emerald-600" : "bg-red-500")}>
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.student?.profile?.first_name} — {c.category}</h4>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{c.type === "merit" ? `+${c.points}` : `-${c.points}`} pts • {c.incident_date}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}