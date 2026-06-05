"use client";

import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Activity,
    BarChart3,
    IndianRupee
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictiveAnalyticsProps {
    className?: string;
}

const METRICS = [
    { label: "Students at Risk", value: "12", change: "+3", trend: "up" },
    { label: "Revenue Forecast", value: "₹45.2L", change: "+8%", trend: "up" },
    { label: "Attendance Avg", value: "87%", change: "-2%", trend: "down" },
    { label: "Pass Rate", value: "94%", change: "+1%", trend: "up" },
];

const PREDICTIONS = [
    {
        id: 1,
        type: "enrollment",
        title: "Enrollment Trend",
        prediction: "15% increase expected next month",
        confidence: "92%",
        trend: "up",
        color: "blue"
    },
    {
        id: 2,
        type: "attendance",
        title: "Attendance Forecast",
        prediction: "Class 9-B may drop below 75%",
        confidence: "87%",
        trend: "down",
        color: "amber"
    },
    {
        id: 3,
        type: "fees",
        title: "Fee Collection Prediction",
        prediction: "₹12.5L expected collection next week",
        confidence: "95%",
        trend: "up",
        color: "emerald"
    },
    {
        id: 4,
        type: "performance",
        title: "Academic Performance",
        prediction: "3 students at risk of failing",
        confidence: "78%",
        trend: "down",
        color: "rose"
    }
];

export function PredictiveAnalytics({ className }: PredictiveAnalyticsProps) {
    const bgColors: Record<string, string> = {
        blue: "bg-blue-50",
        amber: "bg-amber-50",
        emerald: "bg-emerald-50",
        rose: "bg-rose-50"
    };

    const iconColors: Record<string, string> = {
        blue: "text-blue-600",
        amber: "text-amber-600",
        emerald: "text-emerald-600",
        rose: "text-rose-600"
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {METRICS.map((metric, i) => (
                    <div key={i} className="glass futuristic-card rounded-xl p-4 border border-slate-200/60 dark:border-slate-800/60">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs font-medium",
                            metric.trend === "up" ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {metric.trend === "up" ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {metric.change}
                        </div>
                    </div>
                ))}
            </div>

            {/* Predictions */}
            <div className="glass futuristic-card rounded-xl p-5 border border-slate-200/60 dark:border-slate-800/60">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    AI Predictions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PREDICTIONS.map((pred) => (
                        <div key={pred.id} className="p-4 rounded-lg bg-slate-50/80">
                            <div className="flex items-start gap-3">
                                <div className={cn("p-2.5 rounded-lg shrink-0", bgColors[pred.color])}>
                                    <BarChart3 className={cn("h-4 w-4", iconColors[pred.color])} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{pred.title}</p>
                                        <span className="text-xs font-medium text-emerald-600">{pred.confidence}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{pred.prediction}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}