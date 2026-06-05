"use client";

import {
    TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2
} from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
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
    const currentAttTotal = currentAttendance.length;
    const currentAttPresent = currentAttendance.filter(a => a.status === "present").length;
    const currentAttRate = currentAttTotal > 0 ? (currentAttPresent / currentAttTotal) * 100 : 0;

    const prevAttTotal = previousAttendance.length;
    const prevAttPresent = previousAttendance.filter(a => a.status === "present").length;
    const prevAttRate = prevAttTotal > 0 ? (prevAttPresent / prevAttTotal) * 100 : 0;
    const attendanceTrend = currentAttRate - prevAttRate;

    const calculatePassRate = (marks: any[]) => {
        const total = marks.length;
        const pass = marks.filter(m => m.marks_obtained >= (m.exam?.passing_marks || 35)).length;
        return total > 0 ? (pass / total) * 100 : 0;
    };
    const currentPassRate = calculatePassRate(currentMarks);
    const prevPassRate = calculatePassRate(previousMarks);
    const passRateTrend = currentPassRate - prevPassRate;

    const totalFeesCollected = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount_paid || 0), 0);
    const collectionProgress = (totalFeesCollected / targetRevenue) * 100;

    const merits = conductData.filter(c => c.type === "merit").reduce((s, c) => s + c.points, 0);
    const demerits = conductData.filter(c => c.type === "demerit").reduce((s, c) => s + c.points, 0);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const targetAttendanceRate = 95;
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
            color: "emerald" 
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

    const metricBorderColors: Record<string, string> = {
        blue: "border-l-blue-500",
        emerald: "border-l-emerald-500",
        purple: "border-l-purple-500",
        amber: "border-l-amber-500",
    };

    const progressColors: Record<string, string> = {
        blue: "bg-blue-500",
        emerald: "bg-emerald-500",
        purple: "bg-purple-500",
        amber: "bg-amber-500",
    };

    return (
        <div className="space-y-6">
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topMetrics.map((m) => (
                    <div 
                        key={m.title} 
                        className={cn(
                            "bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4",
                            metricBorderColors[m.color]
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{m.title}</p>
                            {m.trend !== undefined && (
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold",
                                    m.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                    {m.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {Math.abs(m.trend).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{m.value}</h3>
                        <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
                        
                        {m.progress !== undefined && (
                            <div className="mt-4">
                                <Progress value={m.progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.progress.toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Attendance Chart */}
                <ERPCard
                    title="Monthly Attendance"
                    description="Performance vs target goals"
                    color="emerald"
                    className="lg:col-span-2"
                >
                    <div className="flex items-end justify-between h-64 gap-2">
                        {monthlyData.slice(0, currentMonthIndex + 1).map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="relative w-full flex items-end justify-center h-48 gap-1">
                                    <div 
                                        className="w-2 bg-slate-200 rounded-t" 
                                        style={{ height: `${d.target}%` }} 
                                    />
                                    <div 
                                        className={cn(
                                            "w-4 rounded-t", 
                                            d.actual >= d.target ? "bg-emerald-500" : "bg-red-500"
                                        )} 
                                        style={{ height: `${d.actual}%` }} 
                                    />
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">{months[i]}</span>
                            </div>
                        ))}
                    </div>
                </ERPCard>

                {/* System Alerts */}
                <ERPCard
                    title="Alerts"
                    description="Critical action items"
                    color="amber"
                >
                    <div className="space-y-4">
                        {alerts.lowAttendanceCount > 0 && (
                            <div className="p-3 rounded-md border border-red-200 bg-red-50">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{alerts.lowAttendanceCount} Students at Risk</p>
                                        <p className="text-xs text-red-600 mt-1">Attendance Below 75%</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {alerts.lowAttendanceNames.slice(0, 3).map(name => (
                                                <Badge key={name} variant="outline" className="text-xs border-red-200 text-red-600">
                                                    {name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {alerts.lowInventory.length > 0 && (
                            <div className="p-3 rounded-md border border-amber-200 bg-amber-50">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Low Inventory</p>
                                        <div className="space-y-1 mt-2">
                                            {alerts.lowInventory.map(item => (
                                                <div key={item} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                                                    <span className="text-amber-600 font-medium">Restock</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Services Active</span>
                            </div>
                        </div>
                    </div>
                </ERPCard>
            </div>

            {/* Resource Utilization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ERPCard title="Library" description="Book availability" color="emerald">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Available</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{totalBooks - activeLoans}</span>
                        </div>
                        <Progress value={totalBooks > 0 ? ((totalBooks - activeLoans) / totalBooks) * 100 : 100} className="h-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">{totalBooks} total books</p>
                    </div>
                </ERPCard>

                <ERPCard title="Revenue" description="Fee collection" color="purple">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Collected</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">₹{totalFeesCollected.toLocaleString()}</span>
                        </div>
                        <Progress value={collectionProgress} className="h-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">{collectionProgress.toFixed(1)}% of target</p>
                    </div>
                </ERPCard>

                <ERPCard title="Conduct" description="Student behavior" color="blue">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Merits</span>
                            <span className="text-sm font-semibold text-emerald-600">+{merits}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Demerits</span>
                            <span className="text-sm font-semibold text-red-600">-{demerits}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total: {merits + demerits} records</p>
                    </div>
                </ERPCard>
            </div>
        </div>
    );
}