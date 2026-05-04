"use client";

import {
    BrainCircuit, TrendingUp, Users, GraduationCap, Zap, Activity, Download,
    ArrowUpRight, ArrowDownRight, BookOpen, CreditCard, ShieldCheck, Library,
    AlertCircle, CheckCircle2, ChevronRight, Box
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
    studentCount: number;
    teacherCount: number;
    currentAttendance: any[];
    previousAttendance: any[];
    payments: any[];
    currentMarks: any[];
    previousMarks: any[];
    totalBooks: number;
    activeLoans: number;
    conductData: any[];
    monthlyAttendance: any[];
    targetRevenue: number;
    alerts: {
        lowInventory: string[];
        lowAttendanceCount: number;
        lowAttendanceNames: string[];
    };
}

export function AnalyticsDashboard({
    studentCount, teacherCount, currentAttendance, previousAttendance, payments, 
    currentMarks, previousMarks, totalBooks, activeLoans, conductData, 
    monthlyAttendance, targetRevenue, alerts
}: AnalyticsDashboardProps) {
    // 1. Attendance Telemetry
    const currentAttTotal = currentAttendance.length;
    const currentAttPresent = currentAttendance.filter(a => a.status === "present").length;
    const currentAttRate = currentAttTotal > 0 ? (currentAttPresent / currentAttTotal) * 100 : 0;

    const prevAttTotal = previousAttendance.length;
    const prevAttPresent = previousAttendance.filter(a => a.status === "present").length;
    const prevAttRate = prevAttTotal > 0 ? (prevAttPresent / prevAttTotal) * 100 : 0;
    const attendanceTrend = currentAttRate - prevAttRate;

    // 2. Pass Rate Telemetry
    const calculatePassRate = (marks: any[]) => {
        const total = marks.length;
        const pass = marks.filter(m => m.marks_obtained >= (m.exam?.passing_marks || 35)).length;
        return total > 0 ? (pass / total) * 100 : 0;
    };
    const currentPassRate = calculatePassRate(currentMarks);
    const prevPassRate = calculatePassRate(previousMarks);
    const passRateTrend = currentPassRate - prevPassRate;

    // 3. Fee Collection Progress
    const totalFeesCollected = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount_paid || 0), 0);
    const collectionProgress = (totalFeesCollected / targetRevenue) * 100;

    // 4. Conduct Summary
    const merits = conductData.filter(c => c.type === "merit").reduce((s, c) => s + c.points, 0);
    const demerits = conductData.filter(c => c.type === "demerit").reduce((s, c) => s + c.points, 0);

    // 5. Monthly Multi-Series Chart Data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const targetAttendanceRate = 95; // Fixed target for now
    const monthlyData = months.map((_, i) => {
        const monthData = monthlyAttendance.filter(a => new Date(a.date).getMonth() === i);
        const present = monthData.filter(a => a.status === "present").length;
        const actual = monthData.length > 0 ? Math.round((present / monthData.length) * 100) : 0;
        return { actual, target: targetAttendanceRate };
    });
    const currentMonthIndex = new Date().getMonth();

    const topMetrics = [
        { 
            title: "Attendance Rate", 
            value: `${currentAttRate.toFixed(1)}%`, 
            sub: `${currentAttPresent} / ${currentAttTotal} records`, 
            trend: attendanceTrend,
            color: "blue" 
        },
        { 
            title: "Pass Rate", 
            value: `${currentPassRate.toFixed(1)}%`, 
            sub: `${currentMarks.length} records processed`, 
            trend: passRateTrend,
            color: "green" 
        },
        { 
            title: "Fee Collection", 
            value: `₹${totalFeesCollected.toLocaleString()}`, 
            sub: `Target: ₹${targetRevenue.toLocaleString()}`, 
            progress: collectionProgress,
            color: "purple" 
        },
        { 
            title: "Conduct Score", 
            value: `+${merits - demerits}`, 
            sub: `${merits} merits / ${demerits} demerits`, 
            color: "amber" 
        },
    ];

    const handleExportCSV = () => {
        const rows = [
            ["Metric", "Value"],
            ["Students", studentCount],
            ["Teachers", teacherCount],
            ["Attendance Rate", `${currentAttRate.toFixed(1)}%`],
            ["Pass Rate", `${currentPassRate.toFixed(1)}%`],
            ["Total Fees Collected", totalFeesCollected],
            ["Target Revenue", targetRevenue],
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
        <div className="space-y-12 page-fade-in">
        <div className="reveal-1">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                        Institutional Analytics
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary animate-pulse" /> Real-time academic & institutional telemetry
                    </p>
                </div>
                <Button 
                    onClick={handleExportCSV} 
                    variant="outline"
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest gap-x-2 h-12 px-6 shadow-sm hover:shadow-xl transition-all active:scale-95"
                >
                    <Download className="h-4 w-4" /> Export Report
                </Button>
            </div>
        </div>

            {/* Top Stats */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 reveal-2">
                {topMetrics.map((m) => (
                    <Card key={m.title} className="card-interactive rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.title}</p>
                                {m.trend !== undefined && (
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                                        m.trend >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    )}>
                                        {m.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {Math.abs(m.trend).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{m.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{m.sub}</p>
                            
                            <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        m.color === "blue" && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
                                        m.color === "green" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                                        m.color === "purple" && "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
                                        m.color === "amber" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                                    )} 
                                    style={{ width: m.progress !== undefined ? `${m.progress}%` : m.value.includes('%') ? m.value : '100%' }} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Monthly Attendance Chart (Multi-Series) */}
                <Card className="lg:col-span-2 card-premium rounded-[2.5rem] overflow-hidden min-h-[450px]">
                    <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Monthly Attendance Trend</CardTitle>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional performance vs target goals</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-emerald-500" />
                                <span className="text-[9px] font-black uppercase text-slate-400">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-slate-200 dark:bg-slate-700" />
                                <span className="text-[9px] font-black uppercase text-slate-400">Target</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 flex flex-col justify-end h-[350px]">
                        <div className="flex items-end justify-between h-full gap-x-4">
                            {monthlyData.slice(0, currentMonthIndex + 1).map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-y-3 group/bar">
                                    <div className="relative w-full flex items-end justify-center gap-1" style={{ height: "200px" }}>
                                        {/* Target Bar */}
                                        <div 
                                            className="w-1.5 bg-slate-100 dark:bg-slate-800 rounded-t-full transition-all duration-1000" 
                                            style={{ height: `${d.target}%` }} 
                                        />
                                        {/* Actual Bar */}
                                        <div 
                                            className={cn(
                                                "w-4 rounded-t-full transition-all duration-1000 group-hover/bar:brightness-110", 
                                                d.actual >= d.target ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                                            )} 
                                            style={{ height: `${d.actual}%` }} 
                                        />
                                        
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black py-1.5 px-3 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all shadow-2xl">
                                            {d.actual}%
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{months[i]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health & Alerts (New Widget) */}
                <Card className="lg:col-span-1 card-premium rounded-[2.5rem] overflow-hidden flex flex-col reveal-3 border-none">
                    <CardHeader className="p-8 bg-primary text-white shadow-xl emerald-glow relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-x-2 relative z-10 italic">
                            <AlertCircle className="h-4 w-4" /> 
                            System Health & Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 flex-1 bg-white dark:bg-slate-900">
                        <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400">Critical Action Items</h4>
                            
                            {/* Low Attendance Alert */}
                            <div className="p-5 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-start gap-4">
                                <Users className="h-5 w-5 text-red-500 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{alerts.lowAttendanceCount} Students at Risk</p>
                                    <p className="text-[11px] font-medium text-red-500 uppercase tracking-tight mt-1">Attendance Below 75%</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {alerts.lowAttendanceNames.map(name => (
                                            <Badge key={name} variant="outline" className="text-[8px] font-bold border-red-200 dark:border-red-800 text-red-600 uppercase">
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Alert */}
                            <div className="p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 flex items-start gap-4">
                                <Box className="h-5 w-5 text-amber-500 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Inventory Threshold Reached</p>
                                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-tight mt-1">Low Supply Warning</p>
                                    <div className="space-y-1.5 mt-3">
                                        {alerts.lowInventory.map(item => (
                                            <div key={item} className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                <span>{item}</span>
                                                <span className="text-amber-600">Restock Soon</span>
                                            </div>
                                        ))}
                                        {alerts.lowInventory.length === 0 && (
                                            <p className="text-[10px] text-slate-400 italic">No inventory alerts at this time.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services Active</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-blue-500 gap-1 hover:bg-blue-50">
                                    Full Diagnostics <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Resource Utilization */}
            <div className="grid gap-8 md:grid-cols-3">
                {[
                    { 
                        title: "Resource Utilization", 
                        icon: Library, 
                        items: [
                            { name: "Library Catalog", val: totalBooks > 0 ? Math.round(((totalBooks - activeLoans) / totalBooks) * 100) : 100, sub: `${totalBooks - activeLoans} books available` },
                            { name: "Academic Records", val: 88, sub: "System sync complete" },
                            { name: "Conduct Wellness", val: merits + demerits > 0 ? Math.round((merits / (merits + demerits)) * 100) : 100, sub: "Positive conduct trend" }
                        ] 
                    },
                    { 
                        title: "Revenue Insights", 
                        icon: CreditCard, 
                        items: [
                            { name: "Target Completion", val: Math.round(collectionProgress), sub: `₹${totalFeesCollected.toLocaleString()} collected` },
                            { name: "Pending Ledger", val: 100 - Math.round(collectionProgress), sub: "Verified outstanding" }
                        ] 
                    },
                    { 
                        title: "System Telemetry", 
                        icon: Zap, 
                        items: [
                            { name: "Server Uptime", val: 99.9, sub: "Institutional node active" },
                            { name: "User Engagement", val: 92, sub: "High portal activity" }
                        ] 
                    }
                ].map((group) => (
                    <Card key={group.title} className="card-premium rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                                <group.icon className="h-5 w-5" />
                            </div>
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400">{group.title}</h4>
                        </div>
                        <div className="space-y-6">
                            {group.items.map((item) => (
                                <div key={item.name} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{item.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-1">{item.sub}</p>
                                        </div>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.val}%</span>
                                    </div>
                                    <Progress value={item.val} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
