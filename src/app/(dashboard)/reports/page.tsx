"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  FileText, Download, Printer, Search, CheckCircle,
  Clock, XCircle, Eye, Send, BarChart3, Plus, Filter,
  ChevronDown, Edit, Users, FileSpreadsheet
} from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

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

  const loadReportCards = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReportCards();
  }, [loadReportCards]);

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
      <div className="animate-in fade-in duration-700 p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 p-4 md:p-6 space-y-6">
      <UnifiedPageHeader title="Report Cards" subtitle="Generate and manage student academic reports" icon={FileSpreadsheet} color="emerald" actions={
        <div className="flex gap-2">
          <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
            <Plus className="h-4 w-4 mr-2 inline" />
            Generate
          </button>
          <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all">
            <Printer className="h-4 w-4 mr-2 inline" />
            Print All
          </button>
        </div>
      } />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardStatCard title="Total" value={stats.total} icon={FileSpreadsheet} color="slate" />
        <DashboardStatCard title="Draft" value={stats.draft} icon={FileText} color="slate" />
        <DashboardStatCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
        <DashboardStatCard title="Published" value={stats.published} icon={CheckCircle} color="emerald" />
        <DashboardStatCard title="Avg Score" value={`${stats.avgScore}%`} icon={BarChart3} color="blue" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name or ID..." className="pl-9 rounded-xl border-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
              <option value="all">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>

        {selectedCards.size > 0 && (
          <div className="px-5 py-3 bg-emerald-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">{selectedCards.size} selected</span>
            <div className="flex gap-2">
              <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all" onClick={() => updateStatus(Array.from(selectedCards), "published")}>
                <CheckCircle className="h-3 w-3 mr-1 inline" /> Publish
              </button>
              <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all" onClick={() => setSelectedCards(new Set())}>Clear</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 w-10"><input type="checkbox" checked={selectedCards.size === filteredCards.length && filteredCards.length > 0} onChange={toggleSelectAll} className="rounded" /></th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Student</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Class</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Term</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Score</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Grade</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="text-right py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-slate-500">No report cards found</td></tr>
              ) : (
                filteredCards.map((card) => {
                  const statusConfig = getStatusConfig(card.status);
                  return (
                    <tr key={card.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-4 px-4"><input type="checkbox" checked={selectedCards.has(card.id)} onChange={() => toggleSelect(card.id)} className="rounded" /></td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">{card.student_name[0]?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{card.student_name}</p>
                            <p className="text-xs text-slate-500">{card.admission_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">{card.class_name} {card.section}</td>
                      <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">{card.term}</span></td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${card.percentage >= 60 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${card.percentage}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-700">{card.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", getGradeColor(card.grade))}>{card.grade}</span></td>
                      <td className="py-4 px-4"><span className={`font-bold ${card.rank <= 3 ? "text-emerald-600" : "text-slate-500"}`}>#{card.rank}</span></td>
                      <td className="py-4 px-4">
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", statusConfig.color)}>
                          <statusConfig.icon className="h-3 w-3" /> {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all" onClick={() => openReportCard(card)}><Eye className="h-4 w-4" /></button>
                          <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all"><Download className="h-4 w-4" /></button>
                          {card.status === "published" && <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all" onClick={() => updateStatus([card.id], "sent")}><Send className="h-4 w-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {filteredCards.length} of {reportCards.length} report cards</span>
          <div className="flex gap-2">
            <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all disabled:opacity-50" disabled><ChevronDown className="h-4 w-4 rotate-180 mr-1 inline" /> Previous</button>
            <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>Next <ChevronDown className="h-4 w-4 ml-1 inline" /></button>
          </div>
        </div>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Report Card</h2>
                <p className="text-sm text-slate-500">{selectedCard.student_name} - {selectedCard.term}</p>
              </div>
              <div className="flex gap-2">
                <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all"><Download className="h-4 w-4 mr-2 inline" />Download</button>
                <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-4 shadow-lg transition-all"><Printer className="h-4 w-4 mr-2 inline" />Print</button>
                <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all" onClick={() => setSelectedCard(null)}><XCircle className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 p-4 bg-slate-50 rounded-xl">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900">{selectedCard.student_name}</h3>
                  <p className="text-sm text-slate-500">Admission No: {selectedCard.admission_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{selectedCard.class_name} {selectedCard.section}</p>
                  <p className="text-sm text-slate-500">{selectedCard.term} - {selectedCard.year}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                  <p className="text-3xl font-black text-emerald-600">{selectedCard.percentage}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Percentage</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                  <p className="text-3xl font-black text-blue-600">{selectedCard.grade}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grade</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                  <p className="text-3xl font-black text-amber-600">#{selectedCard.rank}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</p>
                </div>
                <div className="bg-violet-50 p-4 rounded-xl text-center border border-violet-100">
                  <p className="text-3xl font-black text-violet-600">{selectedCard.attendance_rate}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Attendance</p>
                </div>
              </div>
              <h4 className="text-lg font-black tracking-tight text-slate-900 mb-3">Subject Performance</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</th>
                      <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Teacher</th>
                      <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Marks</th>
                      <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Grade</th>
                      <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectMarks.map((mark, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-4 px-4 text-sm font-bold text-slate-900">{mark.subject}</td>
                        <td className="py-4 px-4 text-center text-sm text-slate-500">{mark.teacher}</td>
                        <td className="py-4 px-4 text-center font-mono text-sm text-slate-700">{mark.marks_obtained}/{mark.max_marks}</td>
                        <td className="py-4 px-4 text-center"><span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", getGradeColor(mark.grade))}>{mark.grade}</span></td>
                        <td className="py-4 px-4 text-sm text-slate-500">{mark.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Total: {selectedCard.overall_marks}/{selectedCard.total_marks}</p>
                <p className="text-xs text-slate-500">Principal Signature: _________</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}