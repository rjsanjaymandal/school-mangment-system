"use client";

import {
  FileText,
  Download,
  Award,
  GraduationCap,
  Search,
  Filter,
  ClipboardCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  generateCertificate,
  generateReportCard,
} from "@/lib/reports/generator";

const students = [
  {
    id: 1,
    name: "Alexander Pierce",
    class: "Grade 10-A",
    gpa: "3.9",
    status: "Honors",
  },
  {
    id: 2,
    name: "Sophia Martinez",
    class: "Grade 10-A",
    gpa: "3.7",
    status: "Stable",
  },
  {
    id: 3,
    name: "Liam O'Connor",
    class: "Grade 11-C",
    gpa: "4.0",
    status: "Honors",
  },
  {
    id: 4,
    name: "Isabella Rossi",
    class: "Grade 9-B",
    gpa: "3.5",
    status: "Stable",
  },
];

export default function ReportsPage() {
  const handleCertDownload = (name: string) => {
    generateCertificate(name, "Exceptional Innovation & Leadership");
  };

  const handleReportDownload = (student: any) => {
    const results = [
      { subject: "Advanced Physics", maxMarks: 100, obtained: 92, grade: "A" },
      { subject: "Mathematics", maxMarks: 100, obtained: 98, grade: "A+" },
      { subject: "Computer Science", maxMarks: 100, obtained: 95, grade: "A" },
      {
        subject: "English Literature",
        maxMarks: 100,
        obtained: 88,
        grade: "B+",
      },
    ];
    generateReportCard(student, results);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Institutional Reports
          </h2>
          <p className="text-slate-500 font-medium">
            Generate and verify academic credentials
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 font-bold gap-x-2 bg-white"
          >
            <ClipboardCheck className="h-4 w-4" />
            Verify Certificate
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
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
              <p className="text-2xl font-black text-slate-900 leading-none">
                124
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
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
              <p className="text-2xl font-black text-slate-900 leading-none">
                842
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
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
              <p className="text-2xl font-black text-slate-900 leading-none">
                92%
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                Completion Rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-x-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search students by name or enrollment ID..."
            className="pl-9 bg-white border-slate-100 rounded-2xl h-12 shadow-sm"
          />
        </div>
        <Button className="h-12 rounded-2xl px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none transition-all">
          Search Neural Library
        </Button>
      </div>

      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50">
            <tr className="border-b">
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                Student Identity
              </th>
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                Class Node
              </th>
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                GPA Rank
              </th>
              <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                Status
              </th>
              <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                Credential Export
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-white/60 transition-colors group"
              >
                <td className="py-6 px-8 flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold neon-blue">
                    {student.name[0]}
                  </div>
                  <span className="font-bold text-slate-900">
                    {student.name}
                  </span>
                </td>
                <td className="py-6 px-8 text-slate-500 font-medium">
                  {student.class}
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
                      student.status === "Honors"
                        ? "bg-blue-50 text-blue-600 border-blue-100 font-bold"
                        : "border-slate-100 text-slate-400 font-bold"
                    }
                  >
                    {student.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-6 px-8 text-right">
                  <div className="flex justify-end gap-x-2">
                    <Button
                      onClick={() => handleCertDownload(student.name)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all gap-x-2"
                    >
                      <Award className="h-3 w-3" />
                      Cert
                    </Button>
                    <Button
                      onClick={() => handleReportDownload(student)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-slate-50 transition-all gap-x-2"
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
      </div>
    </div>
  );
}
