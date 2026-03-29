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

export default function OracleDashboardClient({ systemMetrics }: { systemMetrics: any }) {
    const projections = systemMetrics?.metrics || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <LineChart className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase">
                            School Analytics
                        </h2>
                        <p className="text-muted-foreground font-bold tracking-widest uppercase text-[10px] mt-1">
                            Performance overview and trends
                        </p>
                    </div>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        variant="outline"
                        className="rounded-lg font-bold gap-x-2 text-muted-foreground hover:text-primary transition-all shadow-sm"
                    >
                        <Activity className="h-4 w-4" />
                        System Health
                    </Button>
                    <Button className="rounded-lg bg-primary text-primary-foreground font-bold gap-x-2 px-6 shadow-sm uppercase tracking-widest text-[10px]">
                        <Zap className="h-4 w-4" />
                        Recalculate
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {projections.map((p: any) => (
                    <Card
                        key={p.id}
                        className="border-border bg-card p-6 overflow-hidden relative group rounded-xl shadow-sm hover:border-primary/50 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Activity className="h-16 w-16 text-primary" />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                {p.title}
                            </p>
                            <Badge
                                className={cn(
                                    "text-[8px] font-black border-none rounded-xs uppercase tracking-widest px-2",
                                    p.status === "Bullish" || p.status === "Optimal"
                                        ? "bg-primary text-primary-foreground emerald-glow"
                                        : "bg-foreground/10 text-foreground",
                                )}
                            >
                                {p.status.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="flex items-baseline gap-x-2">
                            <h3 className="text-3xl font-bold text-foreground tracking-tight">{p.value}</h3>
                            <div
                                className={cn(
                                    "flex items-center text-[10px] font-bold uppercase",
                                    p.trend === "up" ? "text-primary" : "text-muted-foreground",
                                )}
                            >
                                {p.trend === "up" ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                )}
                                {p.trend.toUpperCase()}
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground/60">
                            <span>Accuracy Score</span>
                            <span className="text-primary font-bold tracking-widest">{p.confidence}</span>
                        </div>
                        <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                          <div 
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: p.confidence }}
                          />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Deep Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-x-2">
                            <TrendingUp className="h-4 w-4" />
                            Performance Trends
                        </h3>
                        <div className="flex gap-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg h-9 font-bold text-[10px] uppercase text-muted-foreground hover:text-primary transition-all"
                            >
                                Update
                            </Button>
                        </div>
                    </div>

                    <Card className="border-border bg-card rounded-xl p-8 shadow-sm overflow-hidden relative">
                        <div className="h-[300px] flex items-end gap-x-3 relative z-10">
                            {[65, 42, 88, 35, 76, 54, 95, 62].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center gap-y-3 group/p"
                                >
                                    <div className="relative w-full h-[250px] flex items-end">
                                        <div className="absolute inset-0 bg-muted/30 rounded-lg overflow-hidden" />
                                        <div
                                            className="relative w-full bg-primary/80 rounded-t-lg transition-all duration-1000 group-hover/p:bg-primary"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover/p:opacity-100 transition-all shadow-md border border-border">
                                                {h}%
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                        DEP 0{i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 relative z-10">
                            <p className="uppercase tracking-widest">
                                Based on school performance data
                            </p>
                            <div className="flex gap-x-4 tracking-widest">
                                <span className="flex items-center gap-x-1">
                                    <div className="h-2 w-2 rounded-full bg-primary" />{" "}
                                    FORECAST
                                </span>
                                <span className="flex items-center gap-x-1">
                                    <div className="h-2 w-2 rounded-full bg-muted" />{" "}
                                    ACTUAL
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-6">
                    <Card className="border-border bg-card rounded-xl p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-16 w-16 text-primary" />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight mb-2 uppercase text-foreground">
                            Enrollment Overview
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                            Currently tracking {systemMetrics?.studentCount} students and {systemMetrics?.teacherCount} staff members.
                            Staff-to-student ratios are within optimal range.
                        </p>
                        <div className="mt-6 space-y-3">
                            <Button className="w-full bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-sm uppercase tracking-widest text-[10px] py-6">
                                View Staffing Details
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground/60 font-bold text-[10px] uppercase tracking-widest hover:text-primary transition-all underline underline-offset-4"
                            >
                                View Detailed Report →
                            </Button>
                        </div>
                    </Card>


                    <Card className="border-destructive/20 bg-destructive/5 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-x-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-none">
                                    Financials
                                </h5>
                                <p className="text-sm font-bold text-foreground uppercase tracking-tight">
                                    Revenue Overview
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest leading-relaxed mb-6">
                            Total collected revenue: ₹{(systemMetrics?.totalRevenue || 0).toFixed(2)}.
                        </p>
                        <div className="p-4 rounded-lg bg-background border border-border transition-all hover:border-destructive/30">
                            <p className="text-[10px] font-bold text-destructive uppercase mb-2">
                                Recommendation
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                                    Review Fee Structures
                                </span>
                                <Badge variant="destructive" className="border-none text-[8px] font-bold rounded-md tracking-tighter">
                                    CRITICAL
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

