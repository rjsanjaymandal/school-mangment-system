"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  GitBranch, Play, Pause, Plus, Settings, Trash2,
  Clock, ArrowRight, CheckCircle, AlertCircle, UserPlus,
  IndianRupee, FileText, Calendar, ClipboardCheck
} from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: number;
  last_run?: string;
  status: "active" | "paused";
  executions: number;
}

const WORKFLOWS: Workflow[] = [
  { id: "1", name: "New Admission Flow", description: "Welcome email, ID card generation, class assignment", trigger: "New student admission", actions: 4, last_run: "2025-05-05 10:30", status: "active", executions: 45 },
  { id: "2", name: "Fee Overdue Reminder", description: "Send reminder at 7, 14, 30 days overdue", trigger: "Fee due date passed", actions: 3, last_run: "2025-05-05 09:00", status: "active", executions: 128 },
  { id: "3", name: "Low Attendance Alert", description: "Notify parents when attendance <75%", trigger: "Daily attendance check", actions: 2, last_run: "2025-05-04 18:00", status: "active", executions: 15 },
  { id: "4", name: "Exam Result Notification", description: "Auto-notify students and parents", trigger: "Marks uploaded", actions: 2, last_run: "2025-05-03 14:00", status: "active", executions: 8 },
  { id: "5", name: "Staff Leave Approval", description: "Leave request workflow", trigger: "Leave application", actions: 5, status: "paused", executions: 0 },
  { id: "6", name: "Certificate Request", description: "Generate and send certificate", trigger: "Certificate request", actions: 3, last_run: "2025-05-02 11:00", status: "active", executions: 22 },
];

const TRIGGERS = [
  { id: "admission", name: "New Admission", icon: UserPlus, color: "text-blue-500" },
  { id: "payment", name: "Payment Received", icon: IndianRupee, color: "text-emerald-500" },
  { id: "attendance", name: "Attendance Marked", icon: ClipboardCheck, color: "text-amber-500" },
  { id: "marks", name: "Marks Uploaded", icon: FileText, color: "text-purple-500" },
  { id: "schedule", name: "Schedule Change", icon: Calendar, color: "text-orange-500" },
];

const RECENT_EXECUTIONS = [
  { workflow: "New Admission Flow", time: "10 minutes ago", status: "success", steps: 4 },
  { workflow: "Fee Overdue Reminder", time: "2 hours ago", status: "success", steps: 3 },
  { workflow: "Low Attendance Alert", time: "5 hours ago", status: "success", steps: 2 },
  { workflow: "Exam Result Notification", time: "1 day ago", status: "failed", steps: 1, error: "Email service timeout" },
];

export function WorkflowAutomation() {
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  const toggleStatus = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w
    ));
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Workflows</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">5</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Executions</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">218</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Success Rate</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">97.2%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Execution Time</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">2.3s</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Workflows
              </CardTitle>
              <Button size="sm" className="rounded-md bg-emerald-600">
                <Plus className="h-4 w-4 mr-1" />
                New Workflow
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {workflows.map(workflow => (
                <div key={workflow.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        workflow.status === "active" ? "bg-emerald-100" : "bg-slate-100"
                      }`}>
                        <GitBranch className={`h-5 w-5 ${
                          workflow.status === "active" ? "text-emerald-600" : "text-slate-400"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white">{workflow.name}</p>
                          <Badge className={workflow.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{workflow.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            Trigger: {workflow.trigger}
                          </span>
                          <span>{workflow.actions} actions</span>
                          {workflow.last_run && <span>Last run: {workflow.last_run}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Switch 
                        checked={workflow.status === "active"}
                        onCheckedChange={() => toggleStatus(workflow.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Triggers & Recent */}
        <div className="space-y-6">
          {/* Available Triggers */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-500" />
                Available Triggers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {TRIGGERS.map(trigger => (
                <div key={trigger.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <trigger.icon className={`h-4 w-4 ${trigger.color}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{trigger.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Executions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Recent Executions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {RECENT_EXECUTIONS.map((exec, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                  {exec.status === "success" ? 
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> :
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{exec.workflow}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exec.time} • {exec.steps} steps</p>
                    {exec.error && <p className="text-xs text-red-500">{exec.error}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}