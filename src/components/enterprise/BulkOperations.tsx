"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Download, FileSpreadsheet, CheckCircle, XCircle, 
  AlertCircle, ArrowRight, Clock, Users, BookOpen, IndianRupee
} from "lucide-react";

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  fields: string[];
  sampleUrl?: string;
}

const IMPORT_TEMPLATES: ImportTemplate[] = [
  { 
    id: "students", 
    name: "Students", 
    description: "Import student records with profile details",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50",
    fields: ["first_name", "last_name", "email", "phone", "date_of_birth", "gender", "class", "admission_number"],
    sampleUrl: "/templates/students.xlsx"
  },
  { 
    id: "staff", 
    name: "Staff/Faculty", 
    description: "Import teacher and staff information",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    fields: ["first_name", "last_name", "email", "phone", "designation", "department", "join_date"],
    sampleUrl: "/templates/staff.xlsx"
  },
  { 
    id: "fees", 
    name: "Fee Structure", 
    description: "Import fee categories and amounts",
    icon: IndianRupee,
    color: "text-amber-500",
    bg: "bg-amber-50",
    fields: ["fee_name", "amount", "category", "class", "due_date", "description"],
    sampleUrl: "/templates/fees.xlsx"
  },
  { 
    id: "subjects", 
    name: "Subjects", 
    description: "Import subject mappings to classes",
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-50",
    fields: ["subject_name", "subject_code", "class", "teacher", "credits"],
    sampleUrl: "/templates/subjects.xlsx"
  },
];

interface RecentImport {
  id: string;
  template: string;
  fileName: string;
  total: number;
  success: number;
  failed: number;
  timestamp: string;
  status: "completed" | "failed" | "processing";
}

const RECENT_IMPORTS: RecentImport[] = [
  { id: "1", template: "Students", fileName: "students_may2025.xlsx", total: 45, success: 43, failed: 2, timestamp: "2025-05-05 10:30:00", status: "completed" },
  { id: "2", template: "Staff", fileName: "new_teachers.xlsx", total: 5, success: 5, failed: 0, timestamp: "2025-05-04 14:15:00", status: "completed" },
  { id: "3", template: "Fee Structure", fileName: "fee_updates.xlsx", total: 20, success: 18, failed: 2, timestamp: "2025-05-03 09:00:00", status: "completed" },
  { id: "4", template: "Subjects", fileName: "subject_mapping.xlsx", total: 15, success: 0, failed: 15, timestamp: "2025-05-01 16:45:00", status: "failed" },
];

export function BulkOperations() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-500" />
            Export Data
          </CardTitle>
          <CardDescription>Download your data in various formats</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Students", count: 450, icon: Users },
              { label: "Staff", count: 35, icon: Users },
              { label: "Attendance", count: "12,500", icon: FileSpreadsheet },
              { label: "Payments", count: "₹45L", icon: IndianRupee },
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <item.icon className="h-5 w-5 text-slate-500" />
                  <span className="text-xs text-slate-500">{item.count}</span>
                </div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-emerald-600 p-0">
                  Download <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-500" />
            Import Data
          </CardTitle>
          <CardDescription>Upload Excel/CSV files to import data</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {IMPORT_TEMPLATES.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template.id 
                    ? "border-emerald-500 bg-emerald-50" 
                    : "hover:bg-slate-50"
                }`}
              >
                <div className={`h-10 w-10 rounded-lg ${template.bg} flex items-center justify-center mb-3`}>
                  <template.icon className={`h-5 w-5 ${template.color}`} />
                </div>
                <p className="font-medium text-slate-900">{template.name}</p>
                <p className="text-xs text-slate-500 mt-1">{template.description}</p>
              </div>
            ))}
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading ? (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-slate-600">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-900">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
              </>
            )}
          </div>

          {/* Recent Imports */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Recent Imports
            </h4>
            <div className="space-y-2">
              {RECENT_IMPORTS.map(importItem => (
                <div key={importItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{importItem.template}</p>
                      <p className="text-xs text-slate-500">{importItem.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span className="text-slate-600">{importItem.success} success</span>
                        {importItem.failed > 0 && (
                          <>
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="text-slate-600">{importItem.failed} failed</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{importItem.timestamp}</p>
                    </div>
                    <Badge className={importItem.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                      {importItem.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}