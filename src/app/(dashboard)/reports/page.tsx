"use client";

import {
  FileText,
  Download,
  Award,
  GraduationCap,
  Search,
  Filter,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  generateCertificate,
  generateReportCard,
} from "@/lib/reports/generator";
import { ReportsService } from "@/lib/services/reports";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";

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
    completionRate: "0",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsRes, certRes, feesRes, statsRes] = await Promise.all([
          ReportsService.getStudentsWithGrades(),
          ReportsService.getCertificatesSummary(),
          ReportsService.getFeesSummary(),
          ReportsService.getAcademicSummary(),
        ]);

        if (studentsRes.data) {
          const formattedStudents = studentsRes.data.map((s: any) => ({
            id: s.id,
            admission_number: s.admission_number,
            profile: { full_name: s.profile?.full_name || "Unknown", avatar_url: s.profile?.avatar_url },
            class: s.class,
            gpa: s.gpa,
            total_marks: s.total_marks,
          }));
          setStudents(formattedStudents);
        }

        const totalCerts = certRes.data?.total_issued || 0;
        const feeRate = feesRes.data?.rate || "0";

        setStats({
          certificatesIssued: totalCerts,
          reportCardsReady: studentsRes.data?.length || 0,
          completionRate: feeRate,
        });
      } catch (error) {
        console.error("Failed to load reports data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCertDownload = (name: string) => {
    generateCertificate(name, "Exceptional Innovation & Leadership");
  };

  const handleReportDownload = async (student: StudentData) => {
    try {
      const result = await ReportsService.getStudentReportCard(student.id);
      if (result.data) {
        generateReportCard(
          {
            name: student.profile.full_name,
            class: student.class?.name || "N/A",
            admission_number: student.admission_number,
          },
          result.data.results
        );
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      const results = [
        { subject: "No Data", maxMarks: 0, obtained: 0, grade: "N/A" },
      ];
      generateReportCard(
        {
          name: student.profile.full_name,
          class: student.class?.name || "N/A",
          admission_number: student.admission_number,
        },
        results
      );
    }
  };

  const getStatus = (gpa: string) => {
    const gpaNum = parseFloat(gpa);
    if (gpaNum >= 3.5) return "Honors";
    if (gpaNum >= 3.0) return "Excellent";
    if (gpaNum >= 2.5) return "Good";
    return "Stable";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Institutional Reports"
        description="Generate and verify academic credentials for all registered students."
        icon={FileText}
      >
        <Button
          variant="outline"
          className="rounded-xl border-slate-200 dark:border-slate-800 font-bold gap-x-2 bg-white dark:bg-slate-900"
        >
          <ClipboardCheck className="h-4 w-4" />
          Verify
        </Button>
        <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
          <Filter className="h-4 w-4" />
          Bulk Action
        </Button>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-3">
        {[
          { label: "Certificates Issued", value: stats.certificatesIssued, icon: Award, color: "blue" },
          { label: "Report Cards Ready", value: students.length, icon: FileText, color: "indigo" },
          { label: "Fee Completion Rate", value: `${stats.completionRate}%`, icon: GraduationCap, color: "emerald" },
        ].map((stat, i) => (
          <Card key={i} className="card-premium rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-x-4">
              <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-2">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students by name or enrollment ID..."
              className="pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl h-14 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-14 rounded-2xl px-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-all border-none">
            Query Library
          </Button>
        </div>

        <Card className="card-premium rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">
                    Student Identity
                  </th>
                  <th className="text-left py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">
                    Class Node
                  </th>
                  <th className="text-left py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">
                    GPA Rank
                  </th>
                  <th className="text-left py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">
                    Status
                  </th>
                  <th className="text-right py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-x-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold">
                          {student.profile.full_name[0]}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {student.profile.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-10 text-slate-500 font-medium">
                      {student.class?.name || "N/A"}
                    </td>
                    <td className="py-6 px-10">
                      <span className="font-bold text-blue-500">
                        {student.gpa}
                      </span>
                    </td>
                    <td className="py-6 px-10">
                      <Badge
                        variant="outline"
                        className={
                          getStatus(student.gpa) === "Honors"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900 font-bold"
                            : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-slate-100 dark:border-slate-800 font-bold"
                        }
                      >
                        {getStatus(student.gpa).toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <div className="flex justify-end gap-x-3">
                        <Button
                          onClick={() => handleCertDownload(student.profile.full_name)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all gap-x-2"
                        >
                          <Award className="h-4 w-4" />
                          Cert
                        </Button>
                        <Button
                          onClick={() => handleReportDownload(student)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all gap-x-2"
                        >
                          <Download className="h-4 w-4" />
                          Report
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-medium italic">
                No matching student records found in the neural library.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
