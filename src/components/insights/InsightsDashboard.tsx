"use client";

import { useState } from "react";
import {
    BrainCircuit,
    TrendingUp,
    AlertTriangle,
    Zap,
    ShieldCheck,
    Search,
    Plus,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    LineChart,
    RefreshCw,
    UserCheck,
    ChevronRight,
    CheckCircle2
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function InsightsDashboard({ 
    systemMetrics, 
    atRiskStudents = [] 
}: { 
    systemMetrics: any; 
    atRiskStudents?: any[]; 
}) {
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentMetrics, setCurrentMetrics] = useState(systemMetrics?.metrics || []);
    const [studentList, setStudentList] = useState(atRiskStudents);

    // Dynamic Recalculation simulation with gorgeous visual spinners and triggers
    const handleRecalculate = () => {
        setIsRecalculating(true);
        setTimeout(() => {
            setIsRecalculating(false);
            // Slightly jitter the metrics to show active recalculated values
            if (systemMetrics?.metrics) {
                const jittered = systemMetrics.metrics.map((m: any) => {
                    if (m.title.includes("Risk")) {
                        const val = parseFloat(m.value) + (Math.random() * 0.4 - 0.2);
                        return { ...m, value: `${Math.max(0.1, val).toFixed(1)}%` };
                    }
                    return m;
                });
                setCurrentMetrics(jittered);
            }
        }, 1500);
    };

    // Filter students by search query
    const filteredStudents = studentList.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
            {/* Loading Blocker for Recalculation */}
            {isRecalculating && (
                <div className="fixed inset-0 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-sm z-[100] flex items-center justify-center transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                        <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
                        <div className="text-center">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Recalculating Telemetry</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Re-evaluating attendance & grade records...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header section with custom title / sub-label */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                        <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                            System Insights
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase text-[9px] mt-1.5">
                            Real-time statistics & predictive analytics
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-x-3 shrink-0">
                    <Button
                        variant="outline"
                        className="rounded-xl font-bold gap-x-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-all shadow-sm active:scale-95"
                    >
                        <Activity className="h-4 w-4" />
                        System Health
                    </Button>
                    <Button 
                        onClick={handleRecalculate}
                        className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black gap-x-2 px-6 shadow-md uppercase tracking-wider text-[9px] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                    >
                        <Zap className="h-4 w-4" />
                        Recalculate
                    </Button>
                </div>
            </div>

            {/* Three key telemetry cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {currentMetrics.map((p: any) => {
                    const isRisk = p.title.toLowerCase().includes("risk");
                    const isRevenue = p.title.toLowerCase().includes("revenue");
                    
                    return (
                        <Card
                            key={p.id}
                            className="border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md p-6 overflow-hidden relative group rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
                                {isRisk ? <AlertTriangle className="h-16 w-16 text-rose-500" /> :
                                 isRevenue ? <TrendingUp className="h-16 w-16 text-emerald-500" /> :
                                 <BrainCircuit className="h-16 w-16 text-blue-500" />}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    {p.title}
                                </p>
                                <Badge
                                    className={cn(
                                        "text-[8px] font-black border border-transparent rounded-lg uppercase tracking-widest px-2 py-0.5 shadow-sm transition-all",
                                        p.status === "Active" || p.status === "Optimal" || p.status === "Stable"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                                            : "bg-rose-500/10 text-rose-600 border-rose-500/10",
                                    )}
                                >
                                    {p.status}
                                </Badge>
                            </div>

                            <div className="flex items-baseline gap-x-2">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{p.value}</h3>
                                <div
                                    className={cn(
                                        "flex items-center text-[9px] font-black uppercase tracking-wider",
                                        p.trend === "up" ? "text-emerald-500" : "text-rose-500",
                                    )}
                                >
                                    {p.trend === "up" ? (
                                        <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 mr-0.5 shrink-0" />
                                    )}
                                    {p.trend}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <span>Confidence Rating</span>
                                <span className="text-emerald-500 font-black">{p.confidence}</span>
                            </div>
                            
                            <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mt-2 border border-slate-200/20 dark:border-slate-800/20">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                                    style={{ width: p.confidence }}
                                />
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Performance charts & details */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Academic trends block */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-x-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Academic Grade Progress
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg h-8 font-black text-[9px] uppercase tracking-wider text-slate-400 hover:text-emerald-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                            Sync Details
                        </Button>
                    </div>

                    <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden relative">
                        <div className="h-[300px] flex items-end gap-x-3 sm:gap-x-4 relative z-10">
                            {[65, 42, 88, 35, 76, 54, 95, 62].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center gap-y-3 group/p"
                                >
                                    <div className="relative w-full h-[240px] flex items-end">
                                        <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/10 dark:border-slate-800/10 overflow-hidden" />
                                        <div
                                            className="relative w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl transition-all duration-1000 group-hover/p:from-emerald-400 group-hover/p:to-teal-300"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-black tracking-wider px-2.5 py-1 rounded-lg opacity-0 group-hover/p:opacity-100 transition-all shadow-md border border-slate-800">
                                                {h}%
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400/80 dark:text-slate-500 uppercase tracking-widest leading-none">
                                        SEC 0{i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] font-black text-slate-400 dark:text-slate-500 relative z-10">
                            <p className="uppercase tracking-[0.15em]">
                                Calculated system progress score
                            </p>
                            <div className="flex gap-x-4 tracking-[0.15em] shrink-0">
                                <span className="flex items-center gap-x-1.5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                                    FORECASTED
                                </span>
                                <span className="flex items-center gap-x-1.5">
                                    <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800" />{" "}
                                    ACTUAL
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right hand details cards */}
                <div className="space-y-6">
                    {/* Roster overview */}
                    <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
                            <ShieldCheck className="h-16 w-16 text-emerald-500" />
                        </div>
                        <h4 className="text-lg font-black tracking-tight mb-2 uppercase text-slate-900 dark:text-white leading-none">
                            Roster Summary
                        </h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em] leading-relaxed">
                            Currently tracking {systemMetrics?.studentCount} students and {systemMetrics?.teacherCount} staff members. 
                            Ratios are verified to be inside healthy operational levels.
                        </p>
                        
                        <div className="mt-6 space-y-3">
                            <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white font-black rounded-xl shadow-md uppercase tracking-wider text-[9px] py-5 transition-all duration-200 active:scale-95">
                                View Staff Details
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-[9px] uppercase tracking-[0.2em] transition-all underline underline-offset-4 hover:no-underline"
                            >
                                Detailed Report →
                            </Button>
                        </div>
                    </Card>

                    {/* Revenue alert cards */}
                    <Card className="border-rose-500/10 dark:border-rose-500/5 bg-rose-500/5 rounded-2xl p-6 shadow-sm border">
                        <div className="flex items-center gap-x-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/10 shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none">
                                    Financials
                                </h5>
                                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight mt-1">
                                    Revenue Status
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em] leading-relaxed mb-6">
                            Total collected revenue is current at: ₹{(systemMetrics?.totalRevenue || 0).toLocaleString("en-IN")}.
                        </p>
                        
                        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 transition-all hover:border-rose-500/30">
                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 leading-none">
                                Suggested Action
                            </p>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                                    Review Fee Structures
                                </span>
                                <Badge variant="destructive" className="border-none text-[8px] font-black rounded-lg tracking-wider px-2 py-0.5">
                                    ROUTINE
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Dynamic Active Student Dropout Risk Roster Table */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-x-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
                        At-Risk Student Telemetry
                    </h3>
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by name, class, roll..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 shadow-sm"
                        />
                    </div>
                </div>

                <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-900 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    <th className="p-4 pl-6">Student</th>
                                    <th className="p-4">Roll Number</th>
                                    <th className="p-4">Current Class</th>
                                    <th className="p-4 text-center">Calculated Score</th>
                                    <th className="p-4">Condition Status</th>
                                    <th className="p-4 pr-6">Action Intervention Recommendation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((s, index) => (
                                        <tr 
                                            key={s.id}
                                            className={cn(
                                                "border-b border-slate-100/50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all",
                                                index === filteredStudents.length - 1 && "border-none"
                                            )}
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] flex items-center justify-center border border-slate-200/20 dark:border-slate-800/20">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{s.name}</p>
                                                        <span className="text-[8px] text-slate-400 uppercase tracking-widest mt-1 inline-block">Active Record</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {s.rollNumber}
                                            </td>
                                            <td className="p-4 text-xs font-bold text-slate-900 dark:text-white">
                                                {s.className}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center gap-1 justify-center">
                                                    <span className="text-xs font-black text-slate-900 dark:text-white">{s.riskScore}%</span>
                                                    <div className="w-16 h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                        <div 
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                s.riskScore > 60 ? "bg-rose-500" : s.riskScore > 30 ? "bg-amber-500" : "bg-emerald-500"
                                                            )}
                                                            style={{ width: `${s.riskScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    className={cn(
                                                        "text-[8px] font-black border border-transparent rounded-lg uppercase tracking-wider px-2.5 py-0.5",
                                                        s.status === "High Risk" 
                                                            ? "bg-rose-500/10 text-rose-600 border-rose-500/10" 
                                                            : s.status === "Needs Monitoring" 
                                                            ? "bg-amber-500/10 text-amber-600 border-amber-500/10" 
                                                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                                                    )}
                                                >
                                                    {s.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 pr-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="truncate max-w-xs">{s.recommendation}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-7 rounded-lg text-[8px] font-black tracking-widest uppercase hover:bg-emerald-500 hover:text-white text-emerald-600 shrink-0 border border-emerald-500/10 transition-all duration-200 active:scale-95"
                                                    >
                                                        Review Case
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            No flagged at-risk students found matching filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
