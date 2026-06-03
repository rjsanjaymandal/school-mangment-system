import { createClient } from "@/lib/supabase/server";
import { MarksEntryForm } from "@/components/academics/exams/MarksEntryForm";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function MarksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = await params;

  // Basic UUID format validation to prevent DB syntax errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(examId)) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Fetch Exam Details
  const { data: exam } = await supabase
    .from("exams")
    .select(`*, academic_year:academic_years(*), subject:subjects(*), class:classes(*)`)
    .eq("id", examId)
    .single();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true })
    .limit(1);
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("name", { ascending: true })
    .limit(1);

  const selectedClass = exam?.class ?? classes?.[0] ?? null;
  const selectedSubject = exam?.subject ?? subjects?.[0] ?? null;
  const classId = exam?.class_id ?? selectedClass?.id ?? "";
  const subjectId = exam?.subject_id ?? selectedSubject?.id ?? "";

  const { data: students } = classId
    ? await supabase
        .from("students")
        .select(
          `
          *,
          profile:profiles(*)
        `,
        )
        .eq("class_id", classId)
        .order("roll_number", { ascending: true })
    : { data: [] };

  const { data: marks } = subjectId
    ? await supabase
        .from("marks")
        .select("student_id, marks_obtained")
        .eq("exam_id", examId)
        .eq("subject_id", subjectId)
    : { data: [] };

  const marksByStudent = new Map((marks || []).map((mark) => [mark.student_id, mark]));
  const studentsWithMarks = (students || []).map((student) => ({
    ...student,
    mark: marksByStudent.get(student.id) ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link href="/academics/exams">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {exam?.name}
            </h2>
            <div className="flex items-center gap-x-4 text-slate-500 text-sm mt-1">
              <span className="flex items-center gap-x-1">
                <GraduationCap className="h-4 w-4" />
                {exam?.academic_year?.name}
              </span>
              <span className="flex items-center gap-x-1">
                <BookOpen className="h-4 w-4" />
                {selectedSubject?.name || "Unassigned Subject"} ({selectedClass?.name || "Unassigned Class"})
              </span>
            </div>
          </div>
        </div>
      </div>

      <MarksEntryForm
        examId={examId}
        classId={classId || ""}
        subjectId={subjectId || ""}
        className={selectedClass?.name || ""}
        subjectName={selectedSubject?.name || ""}
        students={studentsWithMarks}
      />
    </div>
  );
}
