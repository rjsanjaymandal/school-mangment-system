"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  format: "csv" | "xlsx" | "json";
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: "students", name: "Students", description: "All student records with contact info", icon: Database, format: "csv" },
  { id: "staff", name: "Staff", description: "All staff and teacher records", icon: Database, format: "csv" },
  { id: "attendance", name: "Attendance", description: "Student attendance records", icon: Database, format: "csv" },
  { id: "marks", name: "Marks", description: "Exam marks and grades", icon: Database, format: "xlsx" },
  { id: "fees", name: "Fee Collection", description: "Fee payments and due tracking", icon: Database, format: "csv" },
  { id: "timetable", name: "Timetable", description: "Class schedules and teacher allocation", icon: Database, format: "csv" },
  { id: "library", name: "Library", description: "Books and circulation history", icon: Database, format: "csv" },
];

export function DataExport({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const supabase = createClient();

  const handleExport = async (option: ExportOption) => {
    setExporting(option.id);
    
    try {
      let data: any[] = [];
      
      switch (option.id) {
        case "students":
          const { data: students } = await supabase.from("profiles").select("*").eq("role", "student");
          data = students || [];
          break;
        case "staff":
          const { data: staff } = await supabase.from("profiles").select("*").neq("role", "student");
          data = staff || [];
          break;
        case "attendance":
          const { data: attendance } = await supabase.from("attendance").select("*").order("date", { ascending: false }).limit(1000);
          data = attendance || [];
          break;
        case "marks":
          const { data: marks } = await supabase.from("marks").select("*").order("created_at", { ascending: false }).limit(1000);
          data = marks || [];
          break;
        case "fees":
          const { data: fees } = await supabase.from("payments").select("*").order("payment_date", { ascending: false }).limit(1000);
          data = fees || [];
          break;
        case "timetable":
          const { data: timetable } = await supabase.from("timetable_slots").select("*");
          data = timetable || [];
          break;
        case "library":
          const { data: books } = await supabase.from("library_books").select("*");
          data = books || [];
          break;
      }

      const csvContent = convertToCSV(data);
      downloadFile(csvContent, `${option.id}_export_${new Date().toISOString().split("T")[0]}`, "text/csv");
      
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(null);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) return `"${value}"`;
        return value;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option)}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {exporting === option.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <option.icon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{option.name}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs uppercase">
                {option.format}
              </Badge>
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4">
          Exports up to 1000 records per module
        </div>
      </DialogContent>
    </Dialog>
  );
}