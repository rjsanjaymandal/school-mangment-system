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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  generateCertificate,
  generateReportCard,
} from "@/lib/reports/generator";
import { ReportsService } from "@/lib/services/reports";
import { useEffect, useState } from "react";

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
        const totalRevenue = feesRes.data?.total_collected || 0;
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground">
            Institutional Reports
          </h2>
          <p className="text-muted-foreground font-medium">
            Generate and verify academic credentials
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-border font-bold gap-x-2 bg-white"
          >
            <ClipboardCheck className="h-4 w-4" />
            Verify Certificate
          </Button>
          <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue">
            <Filter className="h-4 w-4" />
            Bulk Generate
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none glass futuristic-card bg-slate-50/50">
          <CardContent className="p-6 flex items-center gap-x-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white neon-blue">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground leading-none">
                {stats.certificatesIssued}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                Certificates Issued
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none glass futuristic-card bg-slate-50/50">
          <CardContent className="p-6 flex items-center gap-x-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white neon-purple">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground leading-none">
                {students.length}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                Report Cards Ready
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none glass futuristic-card bg-slate-50/50">
          <CardContent className="p-6 flex items-center gap-x-4">
            <div className="h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground leading-none">
                {stats.completionRate}%
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                Fee Completion Rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-x-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or enrollment ID..."
            className="pl-9 bg-white border-border rounded-2xl h-12 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="h-12 rounded-2xl px-6 bg-slate-100 hover:bg-slate-200 text-foreground/70 font-bold border-none transition-all">
          Search Neural Library
        </Button>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50">
            <tr className="border-b">
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Student Identity
              </th>
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Class Node
              </th>
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                GPA Rank
              </th>
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Status
              </th>
              <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                Credential Export
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-white/60 transition-colors group"
              >
                <td className="py-6 px-8 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-xl bg-card text-white flex items-center justify-center font-bold neon-blue">
                    {student.profile.full_name[0]}
                  </div>
                  <span className="font-bold text-foreground">
                    {student.profile.full_name}
                  </span>
                </td>
                <td className="py-6 px-8 text-muted-foreground font-medium">
                  {student.class?.name || "N/A"}
                </td>
                <td className="py-6 px-8">
                  <span className="font-black text-blue-500">
                    {student.gpa}
                  </span>
                </td>
                <td className="py-6 px-8">
                  <Badge
                    variant="outline"
                    className={
                      getStatus(student.gpa) === "Honors"
                        ? "bg-blue-50 text-blue-600 border-blue-100 font-bold"
                        : "border-border text-muted-foreground font-bold"
                    }
                  >
                    {getStatus(student.gpa).toUpperCase()}
                  </Badge>
                </td>
                <td className="py-6 px-8 text-right">
                  <div className="flex justify-end gap-x-2">
                    <Button
                      onClick={() => handleCertDownload(student.profile.full_name)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all gap-x-2"
                    >
                      <Award className="h-3 w-3" />
                      Cert
                    </Button>
                    <Button
                      onClick={() => handleReportDownload(student)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-slate-50 transition-all gap-x-2"
                    >
                      <Download className="h-3 w-3" />
                      Report
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No students found
          </div>
        )}
      </div>
    </div>
  );
}
