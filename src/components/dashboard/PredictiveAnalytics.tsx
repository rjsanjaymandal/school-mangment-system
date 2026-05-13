"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Users, BookOpen, IndianRupee, Award, Activity, Clock 
} from "lucide-react";

const PREDICTIONS = [
  {
    id: 1,
    type: "enrollment",
    title: "Enrollment Trend",
    prediction: "15% increase expected next month",
    confidence: "92%",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: 2,
    type: "attendance",
    title: "Attendance Forecast",
    prediction: "Class 9-B may drop below 75%",
    confidence: "87%",
    trend: "down",
    icon: Activity,
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    id: 3,
    type: "fees",
    title: "Fee Collection Prediction",
    prediction: "₹12.5L expected collection next week",
    confidence: "95%",
    trend: "up",
    icon: IndianRupee,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    id: 4,
    type: "performance",
    title: "Academic Performance",
    prediction: "3 students at risk of failing",
    confidence: "78%",
    trend: "neutral",
    icon: Award,
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
];

const ANOMALIES = [
  {
    id: 1,
    severity: "high",
    title: "Unusual Payment Pattern",
    description: "Student #1042 has irregular payment history",
    time: "2 hours ago",
    action: "Review"
  },
  {
    id: 2,
    severity: "medium",
    title: "Attendance Spike",
    description: "Class 10-A shows 95% absence on Friday",
    time: "1 day ago",
    action: "Investigate"
  },
  {
    id: 3,
    severity: "low",
    title: "Grade Discrepancy",
    description: "Math marks deviation >20% from class average",
    time: "3 days ago",
    action: "Verify"
  },
];

const METRICS = [
  { label: "Students at Risk", value: "12", change: "+3", trend: "up" },
  { label: "Revenue Forecast", value: "₹45.2L", change: "+8%", trend: "up" },
  { label: "Attendance Avg", value: "87%", change: "-2%", trend: "down" },
  { label: "Pass Rate", value: "94%", change: "+1%", trend: "up" },
];

export function PredictiveAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, i) => (
          <Card key={i} className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{metric.label}</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{metric.value}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  metric.trend === "up" ? "text-emerald-600" : "text-orange-600"
                )}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {metric.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Predictions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              AI Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {PREDICTIONS.map((pred) => (
              <div key={pred.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", pred.bg)}>
                  <pred.icon className={cn("h-5 w-5", pred.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-slate-900">{pred.title}</p>
                    <span className="text-xs text-emerald-600 font-medium">{pred.confidence}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{pred.prediction}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {ANOMALIES.map((anomaly) => (
              <div key={anomaly.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  anomaly.severity === "high" ? "bg-red-100" : 
                  anomaly.severity === "medium" ? "bg-amber-100" : "bg-slate-100"
                )}>
                  <AlertTriangle className={cn(
                    "h-4 w-4",
                    anomaly.severity === "high" ? "text-red-600" : 
                    anomaly.severity === "medium" ? "text-amber-600" : "text-slate-600"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-slate-900">{anomaly.title}</p>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {anomaly.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{anomaly.description}</p>
                  <button className="text-xs text-emerald-600 font-medium mt-2 hover:underline">
                    {anomaly.action} →
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 text-center">
              <p className="font-medium text-blue-900">Send Reminders</p>
              <p className="text-sm text-blue-700 mt-1">23 families with pending fees</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 text-center">
              <p className="font-medium text-emerald-900">Schedule Tutoring</p>
              <p className="text-sm text-emerald-700 mt-1">15 students need extra help</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 text-center">
              <p className="font-medium text-amber-900">Review Attendance</p>
              <p className="text-sm text-amber-700 mt-1">2 classes below threshold</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}