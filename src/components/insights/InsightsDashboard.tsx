"use client";

import { useState } from "react";
import {
    BrainCircuit,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Users,
    BookOpen,
    IndianRupee,
    Award,
    Activity,
    BarChart3,
    RefreshCw,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Clock,
    Target,
    FileText,
    GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface InsightsDashboardProps {
    systemMetrics: any;
    atRiskStudents?: any[];
}

export default function InsightsDashboard({ systemMetrics, atRiskStudents = [] }: InsightsDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const metrics = systemMetrics?.metrics || [];
    const studentCount = systemMetrics?.studentCount || 0;
    const teacherCount = systemMetrics?.teacherCount || 0;
    const totalRevenue = systemMetrics?.totalRevenue || 0;

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    const forecasts = [
        { id: 1, title: "Enrollment", desc: "15% increase expected next month", icon: Users, color: "blue", trend: "up" },
        { id: 2, title: "Attendance", desc: "Class 9-B may drop below 75%", icon: Activity, color: "amber", trend: "down" },
        { id: 3, title: "Revenue", desc: "₹12.5L expected next week", icon: IndianRupee, color: "emerald", trend: "up" },
        { id: 4, title: "Academic", desc: "3 students at risk of failing", icon: Award, color: "rose", trend: "down" }
    ];

    const anomalies = [
        { id: 1, title: "Payment Pattern", desc: "Student #1042 has irregular history", time: "2 hours", severity: "high" },
        { id: 2, title: "Attendance Spike", desc: "Class 10-A shows 95% absence on Friday", time: "1 day", severity: "medium" },
        { id: 3, title: "Grade Discrepancy", desc: "Math marks deviation >20%", time: "3 days", severity: "low" }
    ];

    const actions = [
        { id: 1, title: "Send Reminders", count: 23, icon: Activity, color: "blue" },
        { id: 2, title: "Schedule Tutoring", count: 15, icon: BookOpen, color: "emerald" },
        { id: 3, title: "Review Attendance", count: 2, icon: AlertCircle, color: "amber" }
    ];

    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
        amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
        rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" }
    };

    const severityMap: Record<string, { bg: string; text: string; border: string }> = {
        high: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
        medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
        low: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Tabs defaultValue="overview" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <TabsList className="bg-muted/80 backdrop-blur-sm p-1 h-auto border border-border/50 rounded-xl">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
                            <BarChart3 className="w-4 h-4" />
                            <span>Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="forecasts" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
                            <BrainCircuit className="w-4 h-4" />
                            <span>Forecasts</span>
                        </TabsTrigger>
                        <TabsTrigger value="alerts" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Alerts</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Download className="h-3 w-3" />
                            Export
                        </Button>
                        <Button onClick={handleRefresh} size="sm" className="gap-2 text-xs bg-blue-500 hover:bg-blue-600">
                            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            Refresh
                        </Button>
                    </div>
                </div>

                <TabsContent value="overview" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass futuristic-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Students</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{studentCount}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                                <ArrowUpRight className="h-3 w-3" /> +12 this month
                            </div>
                        </div>

                        <div className="glass futuristic-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <IndianRupee className="h-4 w-4" />
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Revenue</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                                <ArrowUpRight className="h-3 w-3" /> +8% this month
                            </div>
                        </div>

                        <div className="glass futuristic-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                    <Users className="h-4 w-4" />
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Teachers</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{teacherCount}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Target className="h-3 w-3" /> 1:15 ratio
                            </div>
                        </div>

                        <div className="glass futuristic-card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">At Risk</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{atRiskStudents.length}</p>
                            <Badge className={cn("mt-2 text-[10px]", atRiskStudents.length > 5 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}>
                                {atRiskStudents.length > 5 ? "High" : "Normal"}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 glass futuristic-card rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                    Class Performance
                                </h3>
                                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                            </div>
                            <div className="h-[200px] flex items-end gap-3">
                                {["65", "72", "88", "45", "76", "54", "95", "62"].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full h-full flex items-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-400"
                                                style={{ height: `${h}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">Class {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="glass futuristic-card rounded-2xl p-5">
                                <h4 className="text-sm font-semibold mb-4">Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                        <span className="text-xs">Students</span>
                                        <span className="text-xs font-bold">{studentCount}</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                        <span className="text-xs">Teachers</span>
                                        <span className="text-xs font-bold">{teacherCount}</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                        <span className="text-xs">Revenue</span>
                                        <span className="text-xs font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="forecasts" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass futuristic-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-5">
                                <span className="w-1 h-4 bg-blue-500 rounded-full" />
                                Forecasts
                            </h3>
                            <div className="space-y-4">
                                {forecasts.map((f) => {
                                    const colors = colorMap[f.color];
                                    return (
                                        <div key={f.id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/80">
                                            <div className={cn("p-2.5 rounded-lg shrink-0", colors.bg)}>
                                                <f.icon className={cn("h-4 w-4", colors.text)} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-semibold">{f.title}</p>
                                                    <div className="flex items-center gap-1 text-[10px]">
                                                        {f.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-rose-600" />}
                                                        <span className={f.trend === "up" ? "text-emerald-600" : "text-rose-600"}>{f.trend}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass futuristic-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-5">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                Actions
                            </h3>
                            <div className="space-y-4">
                                {actions.map((a) => {
                                    const colors = colorMap[a.color];
                                    return (
                                        <div key={a.id} className={cn("p-4 rounded-xl border", colors.border)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <a.icon className={cn("h-5 w-5", colors.text)} />
                                                    <span className="text-sm font-semibold">{a.title}</span>
                                                </div>
                                                <Badge className="bg-white">{a.count}</Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass futuristic-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold flex items-center gap-2 mb-5">
                                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                                Issues
                            </h3>
                            <div className="space-y-4">
                                {anomalies.map((a) => {
                                    const colors = severityMap[a.severity];
                                    return (
                                        <div key={a.id} className={cn("p-4 rounded-xl border bg-white", colors.border)}>
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-2 rounded-full shrink-0", colors.bg)}>
                                                    <AlertTriangle className={cn("h-4 w-4", colors.text)} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-semibold">{a.title}</p>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />{a.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass futuristic-card rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <span className="w-1 h-4 bg-rose-500 rounded-full" />
                                    At Risk Students
                                </h3>
                                <div className="relative w-40">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" className="pl-8 h-8 text-xs" />
                                </div>
                            </div>
                            <ScrollArea className="h-[350px]">
                                <div className="space-y-3">
                                    {atRiskStudents.length === 0 ? (
                                        <div className="text-center py-8">
                                            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">All students doing well</p>
                                        </div>
                                    ) : (
                                        atRiskStudents.map((s: any) => (
                                            <div key={s.id} className="p-4 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                                                        {s.name?.[0] || "?"}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <p className="text-sm font-semibold">{s.name}</p>
                                                            <Badge className={cn("text-[10px]", s.riskScore > 60 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
                                                                {s.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{s.className} • Roll: {s.rollNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                                                        <div className={cn("h-full rounded-full", s.riskScore > 60 ? "bg-rose-500" : "bg-amber-500")} style={{ width: `${s.riskScore}%` }} />
                                                    </div>
                                                    <span className="text-xs font-semibold">{s.riskScore}%</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}