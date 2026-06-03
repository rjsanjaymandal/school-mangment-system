"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Clock, Users, CheckCircle, Play, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  title: string;
  subject_id: string;
  class_id: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  status: string;
  subject?: { name: string };
  class?: { name: string };
}

interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  marks: number;
}

export default function OnlineExamsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"exams" | "questions">("exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
  const isMounted = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === "exams") {
        const { data } = await supabase
          .from("exams")
          .select("*, subjects(name), classes(name)")
          .order("exam_date", { ascending: false });
        if (isMounted.current) setExams(data || []);
      } else if (activeTab === "questions") {
        const { data } = await supabase
          .from("exam_questions")
          .select("*")
          .limit(20);
        if (isMounted.current) setQuestions(data || []);
      }
      if (isMounted.current) setLoading(false);
    };

    loadData();

    return () => { isMounted.current = false; };
  }, [activeTab, supabase]);

  const stats = {
    totalExams: exams.length,
    scheduled: exams.filter(e => e.status === "scheduled").length,
    completed: exams.filter(e => e.status === "completed").length,
    active: exams.filter(e => e.status === "active").length,
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const questionTypes = [...new Set(questions.map(q => q.question_type))];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = questionTypeFilter === "all" || q.question_type === questionTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Online Exams</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Create and manage online examinations</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button onClick={() => { setActiveTab("exams"); setSearchQuery(""); }}
            className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "exams" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Exams</button>
          <button onClick={() => { setActiveTab("questions"); setSearchQuery(""); setQuestionTypeFilter("all"); }}
            className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "questions" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Questions</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Exams" value={stats.totalExams} icon={FileText} color="blue" description="All exams" />
        <DashboardStatCard title="Scheduled" value={stats.scheduled} icon={Clock} color="amber" description="Upcoming exams" />
        <DashboardStatCard title="Completed" value={stats.completed} icon={CheckCircle} color="emerald" description="Finished exams" />
        <DashboardStatCard title="Active" value={stats.active} icon={Play} color="purple" description="Currently running" />
      </div>

      {activeTab === "exams" && (
        <ERPCard accentColor="blue">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search exams by title..."
                className="pl-11 h-10 rounded-xl bg-white border-slate-200 text-xs font-bold shadow-sm"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400 mb-1">{searchQuery ? "No exams match your search" : "No exams created yet"}</p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{searchQuery ? "Try a different search term" : "Create exams from the Exams module"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Exam Title</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Class</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Duration</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Marks</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map(exam => (
                    <tr key={exam.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-sm text-slate-900">{exam.title}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{(exam as any).subjects?.name || "-"}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{(exam as any).classes?.name || "-"}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "-"}</td>
                      <td className="py-4 px-4 text-center text-sm text-slate-600">{exam.duration_minutes} min</td>
                      <td className="py-4 px-4 text-center text-sm text-slate-600">{exam.total_marks}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          exam.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          exam.status === "completed" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-amber-100 text-amber-700 border-amber-200"
                        )}>{exam.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ERPCard>
      )}

      {activeTab === "questions" && (
        <ERPCard accentColor="emerald">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search questions..."
                className="pl-11 h-10 rounded-xl bg-white border-slate-200 text-xs font-bold shadow-sm"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select value={questionTypeFilter} onChange={(e) => setQuestionTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-[10px] font-bold text-slate-700 bg-white focus:border-emerald-300 outline-none">
              <option value="all">All Types</option>
              {questionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400 mb-1">{searchQuery || questionTypeFilter !== "all" ? "No questions match your filters" : "No questions in bank"}</p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{searchQuery || questionTypeFilter !== "all" ? "Try different filters" : "Add questions to exams via the Questions tab"}</p>
            </div>
          ) : (
            <div className="space-y-3 p-6">
              {filteredQuestions.map(q => (
                <div key={q.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-purple-100 text-purple-700 border-purple-200">{q.question_type}</span>
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-slate-100 text-slate-600 border-slate-200">{q.marks} marks</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-emerald-100 text-emerald-700 border-emerald-200">✓ {q.correct_answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ERPCard>
      )}
    </div>
  );
}