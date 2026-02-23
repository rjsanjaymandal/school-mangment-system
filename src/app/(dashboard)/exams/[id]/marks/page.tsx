import { createClient } from "@/lib/supabase/server";
import { MarksEntryForm } from "@/components/exams/MarksEntryForm";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MarksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = await params;
  const supabase = await createClient();

  // 1. Fetch Exam Details
  const { data: exam } = await supabase
    .from("exams")
    .select(`*, academic_year:academic_years(*)`)
    .eq("id", examId)
    .single();

  // 2. Fetch Subjects and Classes for selection (Mocking selection for now)
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .limit(5);
  const { data: classes } = await supabase.from("classes").select("*").limit(1);

  // 3. Fetch Students for the selected class
  const classId = classes?.[0]?.id;
  const subjectId = subjects?.[0]?.id;

  const { data: students } = await supabase
    .from("students")
    .select(
      `
      *,
      profile:profiles(*),
      mark:marks(marks_obtained)
    `,
    )
    .eq("class_id", classId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link href="/exams">
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
                {subjects?.[0]?.name} (Grade 10-A)
              </span>
            </div>
          </div>
        </div>
      </div>

      <MarksEntryForm
        examId={examId}
        classId={classId || ""}
        subjectId={subjectId || ""}
        students={students || []}
      />
    </div>
  );
}
