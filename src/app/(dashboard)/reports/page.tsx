"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Download, Printer, Search, CheckCircle,
  Clock, XCircle, Eye, Send, BarChart3, Plus, Filter,
  ChevronDown, Edit, Users
} from "lucide-react";

interface ReportCard {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  section: string;
  term: string;
  year: number;
  status: "draft" | "pending" | "published" | "sent";
  percentage: number;
  grade: string;
  rank: number;
  attendance_rate: number;
  overall_marks: number;
  total_marks: number;
}

interface SubjectMark {
  subject: string;
  teacher: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  remarks: string;
}

export default function ReportCardsPage() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "pending" | "published" | "sent">("all");

  useEffect(() => {
    loadReportCards();
  }, []);

  const loadReportCards = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: studentsData } = await supabase
        .from("students")
        .select(`id, admission_number, profile:profiles(full_name), class:classes(name, section)`)
        .limit(60);

      const students = studentsData || [];
      const now = new Date();
      const currentYear = now.getFullYear();
      const mockTerms = ["Term 1", "Term 2", "Final"];
      const mockStatuses: ("draft" | "pending" | "published" | "sent")[] = ["draft", "pending", "published", "sent"];

      const cards: ReportCard[] = students.map((s: any, index: number) => {
        const term = mockTerms[index % 3];
        const status = mockStatuses[index % 4];
        const percentage = Math.floor(Math.random() * 30) + 60;
        const totalMarks = 500;
        const overallMarks = Math.floor((percentage / 100) * totalMarks);
        const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C" : "F";

        return {
          id: `rc-${s.id}-${term.toLowerCase().replace(" ", "-")}`,
          student_id: s.id,
          student_name: s.profile?.full_name || "Unknown",
          admission_number: s.admission_number || "N/A",
          class_name: s.class?.name || "N/A",
          section: s.class?.section || "-",
          term,
          year: currentYear,
          status,
          percentage,
          grade,
          rank: Math.floor(Math.random() * 30) + 1,
          attendance_rate: Math.floor(Math.random() * 20) + 75,
          overall_marks: overallMarks,
          total_marks: totalMarks,
        };
      });

      setReportCards(cards);
    } catch (error) {
      console.error("Error loading report cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const openReportCard = (card: ReportCard) => {
    setSelectedCard(card);
    const subjects = ["Mathematics", "Science", "English", "Hindi", "Social Studies", "Computer"];
    const marks: SubjectMark[] = subjects.map(sub => {
      const obtained = Math.floor(Math.random() * 30) + 60;
      const pct = (obtained / 100) * 100;
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : "F";
      const remarks = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 50 ? "Needs improvement" : "Poor";
      return { subject: sub, teacher: "T. Teacher", marks_obtained: obtained, max_marks: 100, grade, remarks };
    });
    setSubjectMarks(marks);
  };

  const filteredCards = reportCards.filter(card => {
    const matchesSearch = card.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.admission_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTerm = selectedTerm === "all" || card.term === selectedTerm;
    const matchesStatus = selectedStatus === "all" || card.status === selectedStatus;
    const matchesTab = activeTab === "all" || card.status === activeTab;
    return matchesSearch && matchesTerm && matchesStatus && matchesTab;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCards(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(c => c.id)));
    }
  };

  const updateStatus = (ids: string[], status: ReportCard["status"]) => {
    setReportCards(prev => prev.map(c => ids.includes(c.id) ? { ...c, status } : c));
    setSelectedCards(new Set());
  };

  const stats = {
    total: reportCards.length,
    draft: reportCards.filter(c => c.status === "draft").length,
    pending: reportCards.filter(c => c.status === "pending").length,
    published: reportCards.filter(c => c.status === "published" || c.status === "sent").length,
    avgScore: Math.round(reportCards.reduce((sum, c) => sum + c.percentage, 0) / reportCards.length) || 0,
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft": return { label: "Draft", color: "bg-slate-100 text-slate-700", icon: FileText };
      case "pending": return { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock };
      case "published": return { label: "Published", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
      case "sent": return { label: "Sent", color: "bg-blue-100 text-blue-700", icon: Send };
      default: return { label: status, color: "bg-slate-100 text-slate-700", icon: FileText };
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+": case "A": return "bg-emerald-100 text-emerald-700";
      case "B+": case "B": return "bg-blue-100 text-blue-700";
      case "C": return "bg-amber-100 text-amber-700";
      default: return "bg-rose-100 text-rose-700";
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Report Cards</h1>
          <p className="text-sm text-muted-foreground">Generate and manage student academic reports</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "slate" },
          { label: "Draft", value: stats.draft, color: "slate" },
          { label: "Pending", value: stats.pending, color: "amber" },
          { label: "Published", value: stats.published, color: "emerald" },
          { label: "Avg Score", value: `${stats.avgScore}%`, color: "blue" },
        ].map((stat, i) => (
          <Card key={i} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(stat.label.toLowerCase() as any)}>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or ID..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border rounded-lg text-sm bg-background" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
              <option value="all">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>

        {selectedCards.size > 0 && (
          <div className="px-4 py-3 bg-emerald-50 border-b flex items-center justify-between">
            <span className="text-sm font-medium">{selectedCards.size} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => updateStatus(Array.from(selectedCards), "published")}>
                <CheckCircle className="h-4 w-4 mr-1" /> Publish
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedCards(new Set())}>Clear</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="py-3 px-4 w-10"><input type="checkbox" checked={selectedCards.size === filteredCards.length && filteredCards.length > 0} onChange={toggleSelectAll} className="rounded" /></th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Class</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Term</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">No report cards found</td></tr>
              ) : (
                filteredCards.map((card) => {
                  const statusConfig = getStatusConfig(card.status);
                  return (
                    <tr key={card.id} className="border-b hover:bg-slate-50/50">
                      <td className="py-3 px-4"><input type="checkbox" checked={selectedCards.has(card.id)} onChange={() => toggleSelect(card.id)} className="rounded" /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">{card.student_name[0]?.toUpperCase()}</div>
                          <div>
                            <p className="font-medium">{card.student_name}</p>
                            <p className="text-xs text-muted-foreground">{card.admission_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{card.class_name} {card.section}</td>
                      <td className="py-3 px-4"><span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded">{card.term}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${card.percentage >= 60 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${card.percentage}%` }} />
                          </div>
                          <span className="text-xs font-mono">{card.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(card.grade)}`}>{card.grade}</span></td>
                      <td className="py-3 px-4"><span className={`font-bold ${card.rank <= 3 ? "text-emerald-600" : "text-muted-foreground"}`}>#{card.rank}</span></td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                          <statusConfig.icon className="h-3 w-3" /> {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openReportCard(card)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                          {card.status === "published" && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus([card.id], "sent")}><Send className="h-4 w-4" /></Button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredCards.length} of {reportCards.length} report cards</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled><ChevronDown className="h-4 w-4 rotate-180 mr-1" /> Previous</Button>
            <Button variant="outline" size="sm" disabled>Next <ChevronDown className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </Card>

      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Report Card</h2>
                <p className="text-sm text-muted-foreground">{selectedCard.student_name} - {selectedCard.term}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm"><Printer className="h-4 w-4 mr-2" />Print</Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCard(null)}><XCircle className="h-5 w-5" /></Button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 p-4 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="font-bold text-lg">{selectedCard.student_name}</h3>
                  <p className="text-sm text-muted-foreground">Admission No: {selectedCard.admission_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{selectedCard.class_name} {selectedCard.section}</p>
                  <p className="text-sm text-muted-foreground">{selectedCard.term} - {selectedCard.year}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100">
                  <p className="text-3xl font-bold text-emerald-600">{selectedCard.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-3xl font-bold text-blue-600">{selectedCard.grade}</p>
                  <p className="text-sm text-muted-foreground">Grade</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg text-center border border-amber-100">
                  <p className="text-3xl font-bold text-amber-600">#{selectedCard.rank}</p>
                  <p className="text-sm text-muted-foreground">Rank</p>
                </div>
                <div className="bg-violet-50 p-4 rounded-lg text-center border border-violet-100">
                  <p className="text-3xl font-bold text-violet-600">{selectedCard.attendance_rate}%</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </div>
              </div>
              <h4 className="font-semibold text-slate-800 mb-3">Subject Performance</h4>
              <table className="w-full text-sm border-collapse mb-6">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-center py-3 px-4 font-medium">Teacher</th>
                    <th className="text-center py-3 px-4 font-medium">Marks</th>
                    <th className="text-center py-3 px-4 font-medium">Grade</th>
                    <th className="text-left py-3 px-4 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectMarks.map((mark, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4 font-medium">{mark.subject}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{mark.teacher}</td>
                      <td className="py-3 px-4 text-center font-mono">{mark.marks_obtained}/{mark.max_marks}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(mark.grade)}`}>{mark.grade}</span></td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{mark.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pt-4 border-t flex items-center justify-between">
                <p className="text-sm font-medium">Total: {selectedCard.overall_marks}/{selectedCard.total_marks}</p>
                <p className="text-xs text-muted-foreground">Principal Signature: _________</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}