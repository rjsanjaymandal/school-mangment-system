"use client";

import { useState } from "react";
import { Shield, Database, Clock, Activity as ActivityIcon, Bell, GitBranch, Code, Users, HardDrive, Download } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
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
import { Button } from "@/components/ui/button";

export default function EnterpriseSettingsPage() {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <Shield className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">Enterprise Settings</h1>
          <p className="text-sm text-slate-500">Advanced configuration and monitoring</p>
        </div>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* System Health */}
      <ERPCard
        title="System Health"
        description="Real-time monitoring and status"
        icon={<ActivityIcon className="h-5 w-5" />}
        color="emerald"
      >
        <SystemHealthDashboard />
      </ERPCard>

      {/* Recent Activity */}
      <ERPCard
        title="Recent Activity"
        description="Real-time system activity feed"
        icon={<ActivityIcon className="h-5 w-5" />}
        color="amber"
      >
        <ActivityFeed />
      </ERPCard>

      {/* Notifications */}
      <ERPCard
        title="Notifications"
        description="Email, SMS, push notifications and templates"
        icon={<Bell className="h-5 w-5" />}
        color="blue"
      >
        <NotificationCenter />
      </ERPCard>

      {/* Workflow Automation */}
      <ERPCard
        title="Workflow Automation"
        description="Automate business processes and triggers"
        icon={<GitBranch className="h-5 w-5" />}
        color="purple"
      >
        <WorkflowAutomation />
      </ERPCard>

      {/* Data Management */}
      <ERPCard
        title="Data Management"
        description="Import and export bulk data"
        icon={<Database className="h-5 w-5" />}
        color="amber"
      >
        <BulkOperations />
      </ERPCard>

      {/* Report Builder */}
      <ERPCard
        title="Custom Reports"
        description="Build and customize reports"
        icon={<Code className="h-5 w-5" />}
        color="slate"
      >
        <ReportBuilder />
      </ERPCard>

      {/* Report Scheduler */}
      <ERPCard
        title="Report Automation"
        description="Schedule and automate report generation"
        icon={<Clock className="h-5 w-5" />}
        color="amber"
      >
        <ReportScheduler />
      </ERPCard>

      {/* API Documentation */}
      <ERPCard
        title="API Access"
        description="REST API documentation for integrations"
        icon={<Code className="h-5 w-5" />}
        color="blue"
      >
        <APIDocumentation />
      </ERPCard>

      {/* Parent Portal */}
      <ERPCard
        title="Parent Portal"
        description="Parent engagement and activity tracking"
        icon={<Users className="h-5 w-5" />}
        color="emerald"
      >
        <ParentPortal />
      </ERPCard>

      {/* Backup & Restore */}
      <ERPCard
        title="Backup & Restore"
        description="Database backup and recovery"
        icon={<HardDrive className="h-5 w-5" />}
        color="purple"
      >
        <BackupRestore />
      </ERPCard>

      {/* Audit Logs */}
      <ERPCard
        title="Audit Trail"
        description="Complete activity logging and monitoring"
        icon={<Shield className="h-5 w-5" />}
        color="red"
      >
        <AuditLogViewer />
      </ERPCard>

      <DataExport open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}