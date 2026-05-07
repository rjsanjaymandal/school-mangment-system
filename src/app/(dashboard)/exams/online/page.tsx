"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Clock, Users, CheckCircle, Plus, Play, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ERPCard } from "@/components/ui/erp-card";
import { toast } from "sonner";

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
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    if (activeTab === "exams") {
      const { data } = await supabase
        .from("exams")
        .select("*, subjects(name), classes(name)")
        .order("exam_date", { ascending: false });
      setExams(data || []);
    } else if (activeTab === "questions") {
      const { data } = await supabase
        .from("exam_questions")
        .select("*")
        .limit(20);
      setQuestions(data || []);
    }
    setLoading(false);
  }

  const stats = {
    totalExams: exams.length,
    scheduled: exams.filter(e => e.status === "scheduled").length,
    completed: exams.filter(e => e.status === "completed").length,
    active: exams.filter(e => e.status === "active").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Online Exams</h1>
          <p className="text-muted-foreground">Create and manage online examinations</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === "exams" ? "default" : "outline"} onClick={() => setActiveTab("exams")}>
            <FileText className="h-4 w-4 mr-2" />
            Exams
          </Button>
          <Button variant={activeTab === "questions" ? "default" : "outline"} onClick={() => setActiveTab("questions")}>
            <FileText className="h-4 w-4 mr-2" />
            Questions
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Total Exams
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalExams}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock className="h-4 w-4" />
            Scheduled
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.scheduled}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Completed
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Play className="h-4 w-4" />
            Active
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.active}</p>
        </div>
      </div>

      {/* Content */}
      {activeTab === "exams" && (
        <ERPCard accentColor="blue">
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <CardTitle>Exam List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : exams.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No exams created yet</p>
                <p className="text-sm">Create exams from the Exams module</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 font-medium">Exam Title</th>
                      <th className="text-left p-4 font-medium">Subject</th>
                      <th className="text-left p-4 font-medium">Class</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-center p-4 font-medium">Duration</th>
                      <th className="text-center p-4 font-medium">Marks</th>
                      <th className="text-center p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(exam => (
                      <tr key={exam.id} className="border-t hover:bg-slate-50">
                        <td className="p-4 font-medium">{exam.title}</td>
                        <td className="p-4">{(exam as any).subjects?.name || "-"}</td>
                        <td className="p-4">{(exam as any).classes?.name || "-"}</td>
                        <td className="p-4">{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "-"}</td>
                        <td className="p-4 text-center">{exam.duration_minutes} min</td>
                        <td className="p-4 text-center">{exam.total_marks}</td>
                        <td className="p-4 text-center">
                          <Badge className={
                            exam.status === "active" ? "bg-emerald-100 text-emerald-700" :
                            exam.status === "completed" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }>
                            {exam.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </ERPCard>
      )}

      {activeTab === "questions" && (
        <ERPCard accentColor="emerald">
          <CardHeader className="border-b">
            <CardTitle>Question Bank</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No questions in bank</p>
                <p className="text-sm">Add questions to exams via the Questions tab</p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {questions.map(q => (
                  <div key={q.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{q.question_text}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{q.question_type}</Badge>
                          <Badge variant="outline">{q.marks} marks</Badge>
                        </div>
                      </div>
                      <div className="text-emerald-600 font-medium">
                        ✓ {q.correct_answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ERPCard>
      )}
    </div>
  );
}