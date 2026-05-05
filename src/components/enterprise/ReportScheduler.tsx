"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, Calendar, Mail, Download, Play, Pause, 
  TrendingUp, Users, DollarSign, BookOpen, FileText
} from "lucide-react";

interface ScheduledReport {
  id: string;
  name: string;
  type: "attendance" | "fees" | "academic" | "staff" | "inventory";
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  lastRun?: string;
  nextRun: string;
  status: "active" | "paused";
  format: "pdf" | "excel" | "csv";
}

const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: "1", name: "Daily Attendance Summary", type: "attendance", frequency: "daily", recipients: ["principal@school.com", "admin@school.com"], lastRun: "2025-05-05 08:00", nextRun: "2025-05-06 08:00", status: "active", format: "pdf" },
  { id: "2", name: "Weekly Fee Collection", type: "fees", frequency: "weekly", recipients: ["accountant@school.com", "admin@school.com"], lastRun: "2025-05-01 09:00", nextRun: "2025-05-08 09:00", status: "active", format: "excel" },
  { id: "3", name: "Monthly Academic Report", type: "academic", frequency: "monthly", recipients: ["principal@school.com", "teachers@school.com"], lastRun: "2025-04-30 10:00", nextRun: "2025-05-31 10:00", status: "active", format: "pdf" },
  { id: "4", name: "Staff Directory Update", type: "staff", frequency: "weekly", recipients: ["hr@school.com"], nextRun: "2025-05-11 09:00", status: "paused", format: "csv" },
  { id: "5", name: "Inventory Status", type: "inventory", frequency: "weekly", recipients: ["admin@school.com"], lastRun: "2025-05-03 14:00", nextRun: "2025-05-10 14:00", status: "active", format: "excel" },
];

const REPORT_TYPES = [
  { id: "attendance", name: "Attendance", icon: TrendingUp, color: "text-blue-500" },
  { id: "fees", name: "Fee Collection", icon: DollarSign, color: "text-emerald-500" },
  { id: "academic", name: "Academic", icon: BookOpen, color: "text-purple-500" },
  { id: "staff", name: "Staff", icon: Users, color: "text-amber-500" },
  { id: "inventory", name: "Inventory", icon: FileText, color: "text-slate-500" },
];

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily", description: "Every day at selected time" },
  { value: "weekly", label: "Weekly", description: "Once per week on selected day" },
  { value: "monthly", label: "Monthly", description: "First day of each month" },
];

export function ReportScheduler() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reports, setReports] = useState(SCHEDULED_REPORTS);

  const toggleStatus = (id: string) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Quick Create */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Schedule New Report</p>
              <p className="text-sm text-slate-500">Automate recurring report generation and delivery</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-md bg-emerald-600">
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {REPORT_TYPES.map(type => (
          <Card key={type.id} className="shadow-sm cursor-pointer hover:border-emerald-200 transition-colors">
            <CardContent className="p-4 text-center">
              <type.icon className={`h-6 w-6 mx-auto mb-2 ${type.color}`} />
              <p className="text-sm font-medium text-slate-900">{type.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scheduled Reports List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {reports.map(report => (
              <div key={report.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      {REPORT_TYPES.find(t => t.id === report.type)?.icon && 
                        (() => {
                          const Icon = REPORT_TYPES.find(t => t.id === report.type)!.icon;
                          return <Icon className="h-5 w-5 text-slate-500" />;
                        })()
                      }
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{report.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {report.frequency}
                        </Badge>
                        <span className="text-xs text-slate-500">Format: {report.format.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Next Run</p>
                      <p className="text-sm text-slate-700">{report.nextRun}</p>
                    </div>
                    
                    {report.lastRun && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Last Run</p>
                        <p className="text-sm text-slate-700">{report.lastRun}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={report.status === "active"}
                        onCheckedChange={() => toggleStatus(report.id)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pl-14">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    <span>Recipients: {report.recipients.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Report Name</label>
                <Input placeholder="e.g., Weekly Attendance Report" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Report Type</label>
                <select className="w-full mt-1 h-10 px-3 rounded-md border">
                  <option>Select type...</option>
                  {REPORT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Frequency</label>
                <div className="mt-2 space-y-2">
                  {FREQUENCY_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-slate-50">
                      <input type="radio" name="frequency" value={opt.value} />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Recipients (emails)</label>
                <Input placeholder="email1@school.com, email2@school.com" className="mt-1" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-md bg-emerald-600" onClick={() => setShowCreateModal(false)}>
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}