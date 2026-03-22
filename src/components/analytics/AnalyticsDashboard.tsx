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
                    <h2 className="text-4xl font-black tracking-tight text-foreground">
                        Institutional Analytics
                    </h2>
                    <p className="text-foreground/70 font-bold tracking-tight">
                        Real-time academic & institutional telemetry
                    </p>
                </div>
                <Button 
                    onClick={handleExportCSV} 
                    className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[160px] uppercase tracking-widest text-[10px]"
                >
                    <Download className="h-4 w-4" /> Export Report
                </Button>
            </div>

            {/* Top Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {topMetrics.map((m) => (
                    <Card key={m.title} className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl group transition-all hover:bg-card/60">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{m.title}</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter">{m.value}</h3>
                            <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-tighter mt-1">{m.sub}</p>
                            <div className="mt-4 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full bg-primary emerald-glow transition-all duration-1000")} style={{ width: m.value.includes('%') ? m.value : '100%' }} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Monthly Attendance Chart */}
                <Card className="lg:col-span-2 border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl min-h-[400px]">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-primary/5">
                        <div>
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Monthly Attendance Trend</CardTitle>
                            <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Real attendance data for the current year</p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-end h-[300px] mt-4 px-8">
                        <div className="flex items-end justify-between h-full gap-x-2">
                            {monthlyRates.slice(0, currentMonth + 1).map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-y-2 group/bar">
                                    <div className="relative w-full" style={{ height: "200px" }}>
                                        <div className="absolute bottom-0 w-full bg-primary/5 border border-primary/10 rounded-t-sm" style={{ height: "200px" }} />
                                        <div className={cn("absolute bottom-0 w-full rounded-t-sm transition-all duration-1000 group-hover/bar:brightness-125", h > 0 ? "bg-primary emerald-glow" : "bg-foreground/10")} style={{ height: `${h}%` }} />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black py-1 px-2 rounded-xs opacity-0 group-hover/bar:opacity-100 transition-all shadow-xl emerald-glow">{h}%</div>
                                    </div>
                                    <span className="text-[10px] font-black text-foreground/50 uppercase tracking-tighter">{months[i]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Panel */}                <Card className="lg:col-span-1 border-border bg-card/40 backdrop-blur-xl rounded-sm shadow-2xl overflow-hidden">
                    <CardHeader className="bg-primary text-primary-foreground p-6">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-x-2">
                            <BrainCircuit className="h-4 w-4" /> 
                            Institutional Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8 bg-background/20 backdrop-blur-md">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-sm bg-primary/10 border border-primary/20 text-center transition-all hover:bg-primary/20">
                                <GraduationCap className="h-6 w-6 text-primary mx-auto mb-3" />
                                <p className="text-3xl font-black text-foreground">{studentCount}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Students</p>
                            </div>
                            <div className="p-5 rounded-sm bg-primary/10 border border-primary/20 text-center transition-all hover:bg-primary/20">
                                <Users className="h-6 w-6 text-primary mx-auto mb-3" />
                                <p className="text-3xl font-black text-foreground">{teacherCount}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Teachers</p>
                            </div>
                        </div>
 
                        <div className="space-y-6">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Resource Utilization</h4>
                            {[
                                { name: "Library", val: totalBooks > 0 ? Math.round(((totalBooks - activeLoans) / totalBooks) * 100) : 100, icon: Library },
                                { name: "Fee Collection", val: Math.round(feeCollectionRate), icon: CreditCard },
                                { name: "Conduct Health", val: merits + demerits > 0 ? Math.round((merits / (merits + demerits)) * 100) : 100, icon: ShieldCheck },
                            ].map((d) => (
                                <div key={d.name} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                        <span className="flex items-center gap-x-2 text-foreground/70"><d.icon className="h-3 w-3" /> {d.name}</span>
                                        <span className="text-primary">{d.val}%</span>
                                    </div>
                                    <Progress value={d.val} className="h-1 bg-white/5" indicatorClassName="bg-primary emerald-glow" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden p-6 shadow-2xl transition-all hover:bg-primary/5">
                    <div className="flex items-center gap-x-4 mb-4">
                        <div className="h-12 w-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Revenue Collected</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">₹{totalFeesPaid.toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">₹{totalFeesPending.toLocaleString()} pending in ledger</p>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden p-6 shadow-2xl transition-all hover:bg-primary/5">
                    <div className="flex items-center gap-x-4 mb-4">
                        <div className="h-12 w-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Library Catalog</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{totalBooks} Items</h3>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{activeLoans} currently issued</p>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden p-6 shadow-2xl transition-all hover:bg-primary/5">
                    <div className="flex items-center gap-x-4 mb-4">
                        <div className="h-12 w-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Academic Velocity</p>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{totalMarks} Records</h3>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{passRate}% pass rate threshold</p>
                </Card>
            </div>
        </div>
    );
}

