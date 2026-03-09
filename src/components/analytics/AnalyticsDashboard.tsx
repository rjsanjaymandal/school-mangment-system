"use client";

import {
    BrainCircuit, TrendingUp, Users, GraduationCap, Zap, Activity, Download,
    ArrowUpRight, ArrowDownRight, BookOpen, CreditCard, ShieldCheck, Library,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
    studentCount: number;
    teacherCount: number;
    attendanceData: any[];
    payments: any[];
    marks: any[];
    totalBooks: number;
    activeLoans: number;
    conductData: any[];
    monthlyAttendance: any[];
}

export function AnalyticsDashboard({
    studentCount, teacherCount, attendanceData, payments, marks,
    totalBooks, activeLoans, conductData, monthlyAttendance,
}: AnalyticsDashboardProps) {
    // Compute analytics
    const totalAttendance = attendanceData.length;
    const presentCount = attendanceData.filter(a => a.status === "present").length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100 * 10) / 10 : 0;

    const totalFeesPaid = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0);
    const totalFeesPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
    const feeCollectionRate = (totalFeesPaid + totalFeesPending) > 0
        ? Math.round((totalFeesPaid / (totalFeesPaid + totalFeesPending)) * 100 * 10) / 10
        : 100;

    const totalMarks = marks.length;
    const passCount = marks.filter(m => m.marks_obtained >= (m.exam?.passing_marks || 35)).length;
    const passRate = totalMarks > 0 ? Math.round((passCount / totalMarks) * 100 * 10) / 10 : 0;

    const merits = conductData.filter(c => c.type === "merit").reduce((s, c) => s + c.points, 0);
    const demerits = conductData.filter(c => c.type === "demerit").reduce((s, c) => s + c.points, 0);

    // Monthly bar chart data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRates = months.map((_, i) => {
        const monthData = monthlyAttendance.filter(a => new Date(a.date).getMonth() === i);
        const present = monthData.filter(a => a.status === "present").length;
        return monthData.length > 0 ? Math.round((present / monthData.length) * 100) : 0;
    });
    const currentMonth = new Date().getMonth();

    const topMetrics = [
        { title: "Attendance Rate", value: `${attendanceRate}%`, sub: `${presentCount} / ${totalAttendance} records`, color: "blue" },
        { title: "Pass Rate", value: `${passRate}%`, sub: `${passCount} / ${totalMarks} marks`, color: "green" },
        { title: "Fee Collection", value: `${feeCollectionRate}%`, sub: `₹${totalFeesPaid.toLocaleString()} collected`, color: "purple" },
        { title: "Conduct Score", value: `+${merits - demerits}`, sub: `${merits} merits / ${demerits} demerits`, color: "amber" },
    ];

    const handleExportCSV = () => {
        const rows = [
            ["Metric", "Value"],
            ["Students", studentCount],
            ["Teachers", teacherCount],
            ["Attendance Rate", `${attendanceRate}%`],
            ["Pass Rate", `${passRate}%`],
            ["Fee Collection Rate", `${feeCollectionRate}%`],
            ["Total Fees Collected", totalFeesPaid],
            ["Total Books", totalBooks],
            ["Active Loans", activeLoans],
            ["Merits", merits],
            ["Demerits", demerits],
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Neural Insights</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Real-time academic & institutional telemetry</p>
                </div>
                <Button onClick={handleExportCSV} className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
                    <Download className="h-4 w-4" /> Export Report
                </Button>
            </div>

            {/* Top Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {topMetrics.map((m) => (
                    <Card key={m.title} className="border-none glass futuristic-card group">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{m.title}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{m.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{m.sub}</p>
                            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full bg-slate-900 neon-blue transition-all duration-1000")} style={{ width: m.value.replace("+", "") }} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Monthly Attendance Chart */}
                <Card className="lg:col-span-2 border-none glass futuristic-card min-h-[400px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black">Monthly Attendance Trend</CardTitle>
                            <p className="text-xs text-slate-500">Real attendance data for the current year</p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-end h-[300px] mt-4 px-8">
                        <div className="flex items-end justify-between h-full gap-x-2">
                            {monthlyRates.slice(0, currentMonth + 1).map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-y-2 group/bar">
                                    <div className="relative w-full" style={{ height: "200px" }}>
                                        <div className="absolute bottom-0 w-full bg-slate-50 border border-slate-100 rounded-t-xl" style={{ height: "200px", opacity: 0.3 }} />
                                        <div className={cn("absolute bottom-0 w-full rounded-t-xl neon-blue transition-all duration-1000 group-hover/bar:scale-x-105", h > 0 ? "bg-slate-900" : "bg-slate-200")} style={{ height: `${h}%` }} />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all shadow-xl">{h}%</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{months[i]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Panel */}
                <Card className="lg:col-span-1 border-none glass futuristic-card bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-x-2"><BrainCircuit className="h-5 w-5 text-blue-400" /> Institutional Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <GraduationCap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-2xl font-black">{studentCount}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Students</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                <p className="text-2xl font-black">{teacherCount}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Teachers</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Resource Utilization</h4>
                            {[
                                { name: "Library", val: totalBooks > 0 ? Math.round(((totalBooks - activeLoans) / totalBooks) * 100) : 100, icon: Library },
                                { name: "Fee Collection", val: Math.round(feeCollectionRate), icon: CreditCard },
                                { name: "Conduct Health", val: merits + demerits > 0 ? Math.round((merits / (merits + demerits)) * 100) : 100, icon: ShieldCheck },
                            ].map((d) => (
                                <div key={d.name} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="flex items-center gap-x-1"><d.icon className="h-3 w-3" /> {d.name.toUpperCase()}</span>
                                        <span>{d.val}%</span>
                                    </div>
                                    <Progress value={d.val} className="h-1 bg-white/10" indicatorClassName="bg-blue-500" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none glass futuristic-card p-6 bg-green-50/50">
                    <div className="flex items-center gap-x-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-green-500 text-white flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Revenue Collected</p>
                            <h3 className="text-xl font-black text-slate-900">₹{totalFeesPaid.toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">₹{totalFeesPending.toLocaleString()} pending</p>
                </Card>
                <Card className="border-none glass futuristic-card p-6 bg-blue-50/50">
                    <div className="flex items-center gap-x-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Library Catalog</p>
                            <h3 className="text-xl font-black text-slate-900">{totalBooks} Books</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">{activeLoans} currently issued</p>
                </Card>
                <Card className="border-none glass futuristic-card p-6 bg-purple-50/50">
                    <div className="flex items-center gap-x-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center"><Activity className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-600">Exam Results</p>
                            <h3 className="text-xl font-black text-slate-900">{totalMarks} Records</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">{passRate}% pass rate across all exams</p>
                </Card>
            </div>
        </div>
    );
}
