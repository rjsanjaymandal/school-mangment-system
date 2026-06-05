"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Grid3x3, List, Download, Save, Search, Edit3, CheckCircle, BookOpen, GraduationCap, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface GradeEntry {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  marks: { [examId: string]: number | null };
  average: number;
  grade: string;
  rank: number;
}

interface GradebookClientProps {
  role: string;
  classes: { id: string; name: string; section?: string }[];
  subjects: { id: string; name: string }[];
  exams: { id: string; name: string; class_id: string; subject_id: string; max_marks: number }[];
  students: { id: string; admission_number: string; class_id: string; profile: { full_name: string } }[];
  marks: { student_id: string; exam_id: string; marks_obtained: number }[];
}

export default function GradebookClient({ role, classes, subjects, exams, students, marks }: GradebookClientProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "list" | "bulk">("matrix");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCell, setEditingCell] = useState<{ studentId: string; examId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [bulkEntries, setBulkEntries] = useState<{ studentId: string; studentName: string; marks: number | null }[]>([]);

  const isAdminOrTeacher = role === "admin" || role === "teacher";

  const classExams = useMemo(() => exams.filter(e => !selectedClass || e.class_id === selectedClass), [exams, selectedClass]);
  const classStudents = useMemo(() => students.filter(s => !selectedClass || s.class_id === selectedClass), [students, selectedClass]);
  const subjectExams = useMemo(() => exams.filter(e => !selectedSubject || e.subject_id === selectedSubject), [exams, selectedSubject]);

  const gradeData = useMemo(() => {
    const entries: GradeEntry[] = classStudents.map(student => {
      const studentMarks = marks.filter(m => m.student_id === student.id);
      const marksObj: { [examId: string]: number | null } = {};
      let total = 0, count = 0;

      subjectExams.forEach(exam => {
        const mark = studentMarks.find(m => m.exam_id === exam.id);
        marksObj[exam.id] = mark?.marks_obtained ?? null;
        if (mark) { total += mark.marks_obtained; count++; }
      });

      const average = count > 0 ? Math.round(total / count) : 0;
      const grade = average >= 90 ? "A+" : average >= 80 ? "A" : average >= 70 ? "B+" : average >= 60 ? "B" : average >= 50 ? "C" : "F";

      return { studentId: student.id, studentName: student.profile?.full_name || "Unknown", admissionNumber: student.admission_number, marks: marksObj, average, grade, rank: 0 };
    });

    entries.sort((a, b) => b.average - a.average);
    entries.forEach((e, i) => e.rank = i + 1);
    return entries;
  }, [classStudents, marks, subjectExams]);

  const filteredData = useMemo(() => gradeData.filter(e =>
    e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || e.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ), [gradeData, searchQuery]);

  const stats = useMemo(() => {
    const scores = gradeData.map(d => d.average);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const passCount = scores.filter(s => s >= 60).length;
    return { total: gradeData.length, avg, passRate: scores.length ? Math.round((passCount / scores.length) * 100) : 0 };
  }, [gradeData]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+": case "A": return "bg-emerald-100 text-emerald-700";
      case "B+": case "B": return "bg-blue-100 text-blue-700";
      case "C": return "bg-amber-100 text-amber-700";
      default: return "bg-rose-100 text-rose-700";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-slate-100 text-slate-500";
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-blue-500 text-white";
    if (score >= 40) return "bg-amber-500 text-white";
    return "bg-rose-500 text-white";
  };

  const updateCellMark = async (studentId: string, examId: string, value: number) => {
    const supabase = createClient();
    const existingMark = marks.find(m => m.student_id === studentId && m.exam_id === examId);
    if (existingMark) {
      await supabase.from("marks").update({ marks_obtained: value }).eq("id", (existingMark as any).id);
    } else {
      await supabase.from("marks").insert({ student_id: studentId, exam_id: examId, marks_obtained: value });
    }
    setEditingCell(null);
  };

  const handleBulkEntry = () => {
    const entries = classStudents.map(s => ({ studentId: s.id, studentName: s.profile?.full_name || "Unknown", marks: null }));
    setBulkEntries(entries);
    setViewMode("bulk");
  };

  const exportCsv = () => {
    const headers = ["Rank", "Admission No", "Student", ...subjectExams.map(e => e.name), "Avg", "Grade"];
    const rows = filteredData.map(d => [d.rank, d.admissionNumber, d.studentName, ...subjectExams.map(e => d.marks[e.id] ?? "-"), d.average, d.grade]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gradebook-${selectedClass}.csv`;
    link.click();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <UnifiedPageHeader
        title="Gradebook"
        subtitle="Manage grades, rankings, and academic performance"
        icon={BookOpen}
        color="blue"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              <button onClick={() => setViewMode("matrix")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "matrix" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}><Grid3x3 className="h-3.5 w-3.5 inline mr-1" />Matrix</button>
              <button onClick={() => setViewMode("list")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}><List className="h-3.5 w-3.5 inline mr-1" />List</button>
              {isAdminOrTeacher && <button onClick={handleBulkEntry} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "bulk" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}><Edit3 className="h-3.5 w-3.5 inline mr-1" />Bulk</button>}
            </div>
            {isAdminOrTeacher && (
              <button onClick={exportCsv} className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2 shadow-sm">
                <Download className="h-4 w-4" />Export
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard title="Class Average" value={`${stats.avg}%`} icon={GraduationCap} color="blue" description="Overall class performance" />
        <DashboardStatCard title="Pass Rate" value={`${stats.passRate}%`} icon={CheckCircle} color="emerald" description="Students scoring 60%+" />
        <DashboardStatCard title="Students" value={stats.total} icon={Users} color="purple" description="Enrolled students" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 flex-1">
            <select className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search students..." className="h-10 rounded-xl border-slate-200 dark:border-slate-800 pl-9 w-48" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="py-16 text-center">
            <Search className="h-10 w-10 mx-auto text-slate-300 mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No students found</p>
          </div>
        )}

        {viewMode === "matrix" && filteredData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-3 px-4 text-left w-16">Rank</th>
                  <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-3 px-4 text-left">Student</th>
                  {subjectExams.map(exam => <th key={exam.id} className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-3 px-4 text-center min-w-[80px]">{exam.name.substring(0, 10)}</th>)}
                  <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-3 px-4 text-center w-20">Avg</th>
                  <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-3 px-4 text-center w-20">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <tr key={entry.studentId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4"><span className={cn("font-bold", entry.rank <= 3 ? "text-emerald-600" : "text-slate-500")}>#{entry.rank}</span></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs">{entry.studentName[0]?.toUpperCase()}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{entry.studentName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{entry.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    {subjectExams.map(exam => {
                      const mark = entry.marks[exam.id];
                      const isEditing = editingCell?.studentId === entry.studentId && editingCell?.examId === exam.id;
                      return (
                        <td key={exam.id} className="py-4 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input type="number" className="w-16 h-8 text-center rounded-lg" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => { if (e.key === "Enter") updateCellMark(entry.studentId, exam.id, parseInt(editValue) || 0); if (e.key === "Escape") setEditingCell(null); }} />
                              <button onClick={() => updateCellMark(entry.studentId, exam.id, parseInt(editValue) || 0)} className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"><CheckCircle className="h-4 w-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => { if (isAdminOrTeacher) { setEditingCell({ studentId: entry.studentId, examId: exam.id }); setEditValue(mark?.toString() || ""); } }} className={cn("px-3 py-1 rounded-lg font-mono text-sm font-bold", getScoreColor(mark), isAdminOrTeacher ? "cursor-pointer" : "cursor-default")}>{mark !== null ? mark : "-"}</button>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-4 px-4 text-center"><span className="font-bold text-slate-800 dark:text-slate-200">{entry.average}</span></td>
                    <td className="py-4 px-4 text-center"><span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", getGradeColor(entry.grade))}>{entry.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "list" && filteredData.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredData.map((entry) => (
              <div key={entry.studentId} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">{entry.studentName[0]?.toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{entry.studentName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{entry.admissionNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-black text-slate-800 dark:text-slate-200">{entry.average}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average</p>
                  </div>
                  <div className="text-center">
                    <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", getGradeColor(entry.grade))}>{entry.grade}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Grade</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-xl font-black", entry.rank <= 3 ? "text-emerald-600" : "text-slate-800")}>#{entry.rank}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "bulk" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Bulk Grade Entry</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Enter marks for selected exam</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                  <option value="">Select Exam</option>
                  {classExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <button onClick={() => setViewMode("matrix")} className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Cancel</button>
                <button className="h-10 px-4 rounded-xl bg-emerald-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all flex items-center gap-2"><Save className="h-4 w-4" />Save All</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admission No</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marks (0-100)</span>
              </div>
              {bulkEntries.map((entry) => (
                <div key={entry.studentId} className="grid grid-cols-3 gap-4 items-center py-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.studentName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">-</span>
                  <Input type="number" placeholder="Enter marks" min={0} max={100} className="h-10 rounded-xl border-slate-200 dark:border-slate-800" />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing {filteredData.length} of {gradeData.length} students</span>
          </div>
        )}
      </div>
    </div>
  );
}
