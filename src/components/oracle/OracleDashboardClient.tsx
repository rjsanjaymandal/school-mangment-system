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
                    <div className="h-14 w-14 rounded-sm bg-card/40 border border-primary/20 backdrop-blur-md flex items-center justify-center text-primary emerald-glow">
                        <BrainCircuit className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">
                            AI Predictive Insights
                        </h2>
                        <p className="text-foreground/70 font-bold tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">
                            Advanced Machine Learning Telemetry & Institutional Forecasting
                        </p>
                    </div>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        variant="ghost"
                        className="rounded-sm border border-border bg-card/40 backdrop-blur-md font-bold gap-x-2 text-foreground/80 hover:text-primary transition-all shadow-xl"
                    >
                        <LineChart className="h-4 w-4" />
                        Model Logs
                    </Button>
                    <Button className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[160px] uppercase tracking-widest text-[10px]">
                        <Zap className="h-4 w-4" />
                        Run Forecast
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {projections.map((p: any) => (
                    <Card
                        key={p.id}
                        className="border-border bg-card/40 backdrop-blur-xl p-6 overflow-hidden relative group rounded-sm shadow-2xl hover:border-primary transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Activity className="h-20 w-20 text-primary" />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
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
                        <div className="flex items-baseline gap-x-3">
                            <h3 className="text-3xl font-black text-foreground">{p.value}</h3>
                            <div
                                className={cn(
                                    "flex items-center text-[10px] font-bold uppercase",
                                    p.trend === "up" ? "text-primary" : "text-foreground/60",
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
                        <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase text-foreground/50">
                            <span>Confidence Score</span>
                            <span className="text-primary font-black tracking-widest">{p.confidence}</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-accent/20 rounded-none overflow-hidden border border-border/50 mt-2">
                          <div 
                            className="h-full bg-primary emerald-glow transition-all duration-1000 shadow-[0_0_15px_oklch(var(--primary)/0.4)]"
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-x-2">
                            <TrendingUp className="h-4 w-4" />
                            Neural Attrition Matrix
                        </h3>
                        <div className="flex gap-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-sm h-9 border border-border font-black text-[10px] uppercase text-foreground/60 hover:text-primary transition-all"
                            >
                                Refine Model
                            </Button>
                        </div>
                    </div>

                    <Card className="border-border bg-card/40 backdrop-blur-md rounded-sm p-8 shadow-2xl overflow-hidden relative">
                        <div className="h-[300px] flex items-end gap-x-4 relative z-10">
                            {[65, 42, 88, 35, 76, 54, 95, 62].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center gap-y-3 group/p"
                                >
                                    <div className="relative w-full h-[250px] flex items-end">
                                        <div className="absolute inset-0 bg-accent/20 rounded-none border border-border/30 overflow-hidden" />
                                        <div
                                            className="relative w-full bg-primary emerald-glow transition-all duration-1000 shadow-[0_0_15px_oklch(var(--primary)/0.3)]"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-primary/20 text-primary text-[10px] font-black px-2 py-1 rounded-xs opacity-0 group-hover/p:opacity-100 transition-all shadow-xl backdrop-blur-md">
                                                {h}% YIELD
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                                        DPT 0{i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-xs bg-accent/30 border border-primary/10 flex items-center justify-between text-[10px] font-black text-foreground/60 relative z-10">
                            <p className="uppercase tracking-[0.2em]">
                                Based on 5-year longitudinal historical data correlation
                            </p>
                            <div className="flex gap-x-4">
                                <span className="flex items-center gap-x-1">
                                    <div className="h-2 w-2 rounded-none bg-primary emerald-glow" />{" "}
                                    PREDICTED
                                </span>
                                <span className="flex items-center gap-x-1">
                                    <div className="h-2 w-2 rounded-none bg-accent" />{" "}
                                    HISTORICAL
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                        AI Directives
                    </h3>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-20 w-20 text-primary" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-2 uppercase text-foreground">
                            Stability Check
                        </h4>
                        <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest leading-relaxed">
                            ML identifies {systemMetrics?.studentCount} active students and {systemMetrics?.teacherCount} faculty.
                            Capacity balancing indicates stable performance constraints based on current telemetry.
                        </p>
                        <div className="mt-6 space-y-3">
                            <Button className="w-full bg-primary text-primary-foreground font-black rounded-xs hover:bg-primary/90 emerald-glow uppercase tracking-widest text-[10px] py-6">
                                HIRE FACULTY RL
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-foreground/40 font-black text-[10px] uppercase tracking-[0.4em] hover:text-primary transition-all"
                            >
                                View Stress Test →
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-destructive/20 bg-destructive/5 rounded-sm p-6 shadow-2xl">
                        <div className="flex items-center gap-x-3 mb-4">
                            <div className="h-10 w-10 rounded-xs bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black text-destructive uppercase tracking-widest leading-none">
                                    Yield Warning
                                </h5>
                                <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                    Projected Fee Variance
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest leading-relaxed mb-6">
                            Current recorded revenue is ₹{(systemMetrics?.totalRevenue || 0).toFixed(2)}. Deficit forecasted in elective fees due to regional inflation telemetry.
                        </p>
                        <div className="p-4 rounded-xs bg-background/50 border border-destructive/20 backdrop-blur-md">
                            <p className="text-[10px] font-black text-destructive uppercase mb-2">
                                Recommended Offset
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                                    Adjust Elective Surcharge
                                </span>
                                <Badge className="bg-destructive text-destructive-foreground border-none text-[8px] font-black rounded-xs">
                                    +4.2%
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

