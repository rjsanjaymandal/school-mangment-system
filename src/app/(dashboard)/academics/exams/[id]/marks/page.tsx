import { createClient } from "@/lib/supabase/server";
import { MarksEntryForm } from "@/components/academics/exams/MarksEntryForm";
import { ArrowLeft, BookOpen, GraduationCap, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function MarksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(examId)) {
    notFound();
  }

  const supabase = await createClient();

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
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-x-4">
        <Link href="/academics/exams">
          <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </Link>
      </div>

      <UnifiedPageHeader
        title={exam?.name || "Marks Entry"}
        subtitle="Performance Registry"
        icon={ClipboardCheck}
        color="emerald"
      />

      <div className="flex items-center gap-x-4 text-sm text-slate-500">
        <span className="flex items-center gap-x-1">
          <GraduationCap className="h-4 w-4" />
          {exam?.academic_year?.name}
        </span>
        <span className="flex items-center gap-x-1">
          <BookOpen className="h-4 w-4" />
          {selectedSubject?.name || "Unassigned Subject"} ({selectedClass?.name || "Unassigned Class"})
        </span>
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