"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Eye, MessageSquare, Calendar, BookOpen, 
  IndianRupee, TrendingUp, AlertCircle, CheckCircle
} from "lucide-react";

const PARENT_STATS = [
  { label: "Total Parents", value: 420, icon: Users },
  { label: "Active Portals", value: 385, icon: Eye },
  { label: "Messages Sent", value: 1245, icon: MessageSquare },
  { label: "App Installs", value: 312, icon: Users },
];

const TOP_PARENTS = [
  { name: "Mr. Rajesh Sharma", student: "Rahul Sharma (10-A)", logins: 45, last_login: "2 hours ago" },
  { name: "Mrs. Sunita Patel", student: "Priya Patel (12-Science)", logins: 38, last_login: "5 hours ago" },
  { name: "Mr. Anil Kumar", student: "Aryan Kumar (9-B)", logins: 32, last_login: "1 day ago" },
];

const RECENT_ACTIVITIES = [
  { parent: "Mrs. Priya Singh", student: "Vikram Singh (10-B)", action: "Viewed attendance", time: "30 min ago" },
  { parent: "Mr. Amit Sharma", student: "Karan Sharma (11-A)", action: "Downloaded fee receipt", time: "1 hour ago" },
  { parent: "Mrs. Kavita Devi", student: "Sanjay Devi (9-A)", action: "Submitted inquiry", time: "2 hours ago" },
  { parent: "Mr. Suresh Nair", student: "Ananya Nair (12-Commerce)", action: "Viewed exam results", time: "3 hours ago" },
];

export function ParentPortal() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PARENT_STATS.map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <stat.icon className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Active Parents */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Most Active Parents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {TOP_PARENTS.map((parent, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                    {parent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{parent.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{parent.student}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{parent.logins} logins</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{parent.last_login}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              Portal Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { label: "Fee Payment View", value: 85 },
              { label: "Attendance Check", value: 72 },
              { label: "Exam Results View", value: 68 },
              { label: "Academic Reports", value: 45 },
              { label: "Messages Sent", value: 32 },
            ].map((metric, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{metric.label}</span>
                  <span className="text-sm font-medium">{metric.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Recent Parent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {RECENT_ACTIVITIES.map((activity, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{activity.parent}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.student}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{activity.action}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}