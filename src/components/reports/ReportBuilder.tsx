"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileBarChart, Plus, Download, Eye, Trash2, 
  Calendar, Filter, BarChart3, PieChart, Table
} from "lucide-react";

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: "tabular" | "chart" | "summary";
  data_source: string;
  filters: number;
  last_generated?: string;
  created_by: string;
}

const CUSTOM_REPORTS: CustomReport[] = [
  { id: "1", name: "Student Performance by Subject", description: "Average marks per subject across classes", type: "chart", data_source: "marks", filters: 3, last_generated: "2025-05-05", created_by: "Admin" },
  { id: "2", name: "Fee Collection by Class", description: "Fee collection summary by class", type: "tabular", data_source: "payments", filters: 2, last_generated: "2025-05-04", created_by: "Admin" },
  { id: "3", name: "Attendance Heatmap", description: "Daily attendance patterns", type: "chart", data_source: "attendance", filters: 4, last_generated: "2025-05-03", created_by: "Principal" },
  { id: "4", name: "Staff Department Summary", description: "Staff count and details by department", type: "summary", data_source: "staff", filters: 1, last_generated: "2025-05-02", created_by: "Admin" },
  { id: "5", name: "Library Usage Report", description: "Book issue and return statistics", type: "tabular", data_source: "library", filters: 2, created_by: "Admin" },
];

const DATA_SOURCES = [
  { id: "students", name: "Students", fields: ["name", "class", "admission_date", "status"] },
  { id: "attendance", name: "Attendance", fields: ["date", "status", "student_id", "class_id"] },
  { id: "marks", name: "Marks", fields: ["marks", "exam_id", "student_id", "subject_id"] },
  { id: "payments", name: "Payments", fields: ["amount", "date", "status", "student_id"] },
  { id: "staff", name: "Staff", fields: ["name", "designation", "department", "join_date"] },
  { id: "library", name: "Library", fields: ["book_title", "issue_date", "return_date", "student"] },
];

const REPORT_TYPES = [
  { id: "tabular", name: "Tabular", icon: Table, description: "Data in table format" },
  { id: "chart", name: "Chart", icon: BarChart3, description: "Visual charts and graphs" },
  { id: "summary", name: "Summary", icon: PieChart, description: "Key metrics and stats" },
];

export function ReportBuilder() {
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Custom Report Builder</p>
              <p className="text-sm text-slate-500">Create and customize reports with filters</p>
            </div>
            <Button onClick={() => setShowBuilder(true)} className="rounded-md bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources & Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-slate-500" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {DATA_SOURCES.map(source => (
                <div key={source.id} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <p className="font-medium text-slate-900">{source.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{source.fields.join(", ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Report Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {REPORT_TYPES.map(type => (
                <div key={type.id} className="p-4 border rounded-lg text-center hover:bg-slate-50 cursor-pointer">
                  <type.icon className="h-6 w-6 mx-auto text-slate-500 mb-2" />
                  <p className="font-medium text-slate-900 text-sm">{type.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Reports */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-slate-500" />
            Saved Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Report Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Filters</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Run</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CUSTOM_REPORTS.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{report.name}</p>
                        <p className="text-xs text-slate-500">{report.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{report.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600 capitalize">{report.data_source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{report.filters} filters</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{report.created_by}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{report.last_generated || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create Custom Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Report Name</label>
                  <Input placeholder="Enter report name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Data Source</label>
                  <select className="w-full mt-1 h-10 px-3 rounded-md border">
                    {DATA_SOURCES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">Report Type</label>
                <div className="flex gap-3 mt-2">
                  {REPORT_TYPES.map(type => (
                    <label key={type.id} className="flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="radio" name="reportType" value={type.id} />
                      <type.icon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Filters</label>
                <div className="mt-2 p-4 border rounded-lg bg-slate-50 text-center">
                  <Filter className="h-6 w-6 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Click to add filters</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowBuilder(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-md bg-blue-600" onClick={() => setShowBuilder(false)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}