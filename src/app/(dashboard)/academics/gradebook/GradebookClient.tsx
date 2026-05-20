"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Grid3x3, List, Download, Save, Search, Edit3, CheckCircle
} from "lucide-react";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gradebook</h1>
          <p className="text-sm text-muted-foreground">Manage grades, rankings, and academic performance</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={() => setViewMode("matrix")} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${viewMode === "matrix" ? "bg-white shadow text-emerald-600" : "text-slate-600"}`}><Grid3x3 className="h-4 w-4" />Matrix</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${viewMode === "list" ? "bg-white shadow text-emerald-600" : "text-slate-600"}`}><List className="h-4 w-4" />List</button>
            {isAdminOrTeacher && <button onClick={handleBulkEntry} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${viewMode === "bulk" ? "bg-white shadow text-emerald-600" : "text-slate-600"}`}><Edit3 className="h-4 w-4" />Bulk</button>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-3xl font-bold text-slate-900">{stats.avg}%</p>
          <p className="text-xs text-muted-foreground">Class Average</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-bold text-emerald-600">{stats.passRate}%</p>
          <p className="text-xs text-muted-foreground">Pass Rate</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Students</p>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 flex-1">
            <select className="px-3 py-2 border rounded-lg text-sm" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="px-3 py-2 border rounded-lg text-sm" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {isAdminOrTeacher && <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export</Button>}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-48" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {viewMode === "matrix" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground w-16">Rank</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Student</th>
                  {subjectExams.map(exam => <th key={exam.id} className="py-3 px-4 text-center font-medium text-muted-foreground min-w-[80px]">{exam.name.substring(0, 10)}</th>)}
                  <th className="py-3 px-4 text-center font-medium text-muted-foreground w-20">Avg</th>
                  <th className="py-3 px-4 text-center font-medium text-muted-foreground w-20">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <tr key={entry.studentId} className="border-b hover:bg-slate-50/50">
                    <td className="py-3 px-4"><span className={`font-bold ${entry.rank <= 3 ? "text-emerald-600" : "text-muted-foreground"}`}>#{entry.rank}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs">{entry.studentName[0]?.toUpperCase()}</div>
                        <div>
                          <p className="font-medium">{entry.studentName}</p>
                          <p className="text-xs text-muted-foreground">{entry.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    {subjectExams.map(exam => {
                      const mark = entry.marks[exam.id];
                      const isEditing = editingCell?.studentId === entry.studentId && editingCell?.examId === exam.id;
                      return (
                        <td key={exam.id} className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input type="number" className="w-16 h-8 text-center" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => { if (e.key === "Enter") updateCellMark(entry.studentId, exam.id, parseInt(editValue) || 0); if (e.key === "Escape") setEditingCell(null); }} />
                              <Button size="icon" className="h-8 w-8" onClick={() => updateCellMark(entry.studentId, exam.id, parseInt(editValue) || 0)}><CheckCircle className="h-4 w-4" /></Button>
                            </div>
                          ) : (
                            <button onClick={() => { if (isAdminOrTeacher) { setEditingCell({ studentId: entry.studentId, examId: exam.id }); setEditValue(mark?.toString() || ""); } }} className={`px-3 py-1 rounded-lg font-mono text-sm ${getScoreColor(mark)} ${isAdminOrTeacher ? "cursor-pointer" : "cursor-default"}`}>{mark !== null ? mark : "-"}</button>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center"><span className="font-bold">{entry.average}</span></td>
                    <td className="py-3 px-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(entry.grade)}`}>{entry.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "list" && (
          <div className="divide-y">
            {filteredData.map((entry) => (
              <div key={entry.studentId} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">{entry.studentName[0]?.toUpperCase()}</div>
                  <div><p className="font-medium">{entry.studentName}</p><p className="text-xs text-muted-foreground">{entry.admissionNumber}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center"><p className="text-xl font-bold">{entry.average}%</p><p className="text-xs text-muted-foreground">Average</p></div>
                  <div className="text-center"><span className={`px-3 py-1 rounded-lg text-sm font-bold ${getGradeColor(entry.grade)}`}>{entry.grade}</span><p className="text-xs text-muted-foreground mt-1">Grade</p></div>
                  <div className="text-center"><p className={`text-xl font-bold ${entry.rank <= 3 ? "text-emerald-600" : "text-slate-900"}`}>#{entry.rank}</p><p className="text-xs text-muted-foreground">Rank</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "bulk" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div><h3 className="font-semibold">Bulk Grade Entry</h3><p className="text-sm text-muted-foreground">Enter marks for selected exam</p></div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border rounded-lg text-sm" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                  <option value="">Select Exam</option>
                  {classExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <Button variant="outline" onClick={() => setViewMode("matrix")}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700"><Save className="h-4 w-4 mr-2" />Save All</Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2"><span>Student</span><span>Admission No</span><span>Marks (0-100)</span></div>
              {bulkEntries.map((entry) => (
                <div key={entry.studentId} className="grid grid-cols-3 gap-4 items-center py-2">
                  <span className="font-medium">{entry.studentName}</span>
                  <span className="text-muted-foreground text-sm">-</span>
                  <Input type="number" placeholder="Enter marks" min={0} max={100} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredData.length} of {gradeData.length} students</span>
        </div>
      </Card>
    </div>
  );
}