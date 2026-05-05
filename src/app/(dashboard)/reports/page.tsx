"use client";

import {
  FileText,
  Download,
  Award,
  GraduationCap,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ERPCard } from "@/components/ui/erp-card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";


interface StudentData {
  id: string;
  admission_number: string;
  profile: { full_name: string; avatar_url?: string };
  class?: { name: string };
  gpa: string;
  total_marks: number;
}

export default function ReportsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    certificatesIssued: 0,
    reportCardsReady: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          profile:profiles(full_name, avatar_url),
          class:classes(name)
        `);

      if (error) throw error;

      const formattedStudents = (data || []).map((s: any) => ({
        id: s.id,
        admission_number: s.admission_number || "N/A",
        profile: {
          full_name: s.profile?.full_name || "Unknown",
          avatar_url: s.profile?.avatar_url
        },
        class: s.class,
        gpa: (Math.random() * (4.0 - 2.5) + 2.5).toFixed(2), // Mock GPA
        total_marks: Math.floor(Math.random() * 200) + 300 // Mock Marks
      }));

      setStudents(formattedStudents);
      setStats({
        certificatesIssued: Math.floor(Math.random() * 50) + 10,
        reportCardsReady: formattedStudents.length,
        completionRate: Math.floor(Math.random() * 30) + 70,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Academics</span>
        <span>/</span>
        <span className="text-foreground font-medium">Reports</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institutional Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and verify academic credentials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Verify
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Certificates Issued", value: stats.certificatesIssued, icon: Award, color: "blue" },
          { label: "Report Cards Ready", value: students.length, icon: FileText, color: "indigo" },
          { label: "Fee Completion Rate", value: `${stats.completionRate}%`, icon: GraduationCap, color: "emerald" },
        ].map((stat, i) => (
          <ERPCard key={i} accentColor={stat.color as any}>
            <div className="flex items-center gap-4 p-4">
              <div className={`h-12 w-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </ERPCard>
        ))}
      </div>

      <ERPCard accentColor="emerald">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or enrollment ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">GPA</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.slice(0, 10).map((student) => (
                    <tr key={student.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                            {student.profile.full_name[0]}
                          </div>
                          <span className="font-medium">{student.profile.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {student.class?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-mono">{student.gpa}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-emerald-100 text-emerald-700">Ready</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {Math.min(filteredStudents.length, 10)} of {filteredStudents.length} students
          </div>
        </div>
      </ERPCard>
    </div>
  );
}