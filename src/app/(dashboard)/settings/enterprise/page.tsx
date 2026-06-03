"use client";

import { useState } from "react";
import { Shield, Database, Clock, Activity as ActivityIcon, Bell, GitBranch, Code, Users, HardDrive, Download } from "lucide-react";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";
import { BulkOperations } from "@/components/enterprise/BulkOperations";
import { ReportScheduler } from "@/components/enterprise/ReportScheduler";
import { SystemHealthDashboard } from "@/components/enterprise/SystemHealthDashboard";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { WorkflowAutomation } from "@/components/automation/WorkflowAutomation";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { APIDocumentation } from "@/components/api/APIDocumentation";
import { BackupRestore } from "@/components/system/BackupRestore";
import { ParentPortal } from "@/components/portal/ParentPortal";
import { DataExport } from "@/components/data-export/DataExport";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default function EnterpriseSettingsPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const sections = [
    { title: "System Health", description: "Real-time monitoring and status", icon: <ActivityIcon className="h-5 w-5 text-emerald-600" />, children: <SystemHealthDashboard /> },
    { title: "Recent Activity", description: "Real-time system activity feed", icon: <ActivityIcon className="h-5 w-5 text-amber-600" />, children: <ActivityFeed /> },
    { title: "Notifications", description: "Email, SMS, push notifications and templates", icon: <Bell className="h-5 w-5 text-blue-600" />, children: <NotificationCenter /> },
    { title: "Workflow Automation", description: "Automate business processes and triggers", icon: <GitBranch className="h-5 w-5 text-purple-600" />, children: <WorkflowAutomation /> },
    { title: "Data Management", description: "Import and export bulk data", icon: <Database className="h-5 w-5 text-amber-600" />, children: <BulkOperations /> },
    { title: "Custom Reports", description: "Build and customize reports", icon: <Code className="h-5 w-5 text-slate-600" />, children: <ReportBuilder /> },
    { title: "Report Automation", description: "Schedule and automate report generation", icon: <Clock className="h-5 w-5 text-amber-600" />, children: <ReportScheduler /> },
    { title: "API Access", description: "REST API documentation for integrations", icon: <Code className="h-5 w-5 text-blue-600" />, children: <APIDocumentation /> },
    { title: "Parent Portal", description: "Parent engagement and activity tracking", icon: <Users className="h-5 w-5 text-emerald-600" />, children: <ParentPortal /> },
    { title: "Backup & Restore", description: "Database backup and recovery", icon: <HardDrive className="h-5 w-5 text-purple-600" />, children: <BackupRestore /> },
    { title: "Audit Trail", description: "Complete activity logging and monitoring", icon: <Shield className="h-5 w-5 text-red-600" />, children: <AuditLogViewer /> },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Enterprise Settings"
        subtitle="Advanced configuration and monitoring"
        icon={Shield}
        actions={
          <button
            onClick={() => setExportOpen(true)}
            className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all"
          >
            <Download className="h-4 w-4 inline mr-2" />
            Export Data
          </button>
        }
      />

      <div className="grid gap-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              {section.icon}
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">{section.title}</h3>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
            </div>
            <div className="p-5">{section.children}</div>
          </div>
        ))}
      </div>

      <DataExport open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}