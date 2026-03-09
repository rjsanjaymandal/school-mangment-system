import { createClient } from "@/lib/supabase/server";
import { ExamsDashboard } from "@/components/exams/ExamsDashboard";

export default async function ExamsPage() {
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from("exams")
    .select("*, subject:subjects(*), class:classes(*), academic_year:academic_years(*)")
    .order("date", { ascending: false });

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("name");

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .order("is_current", { ascending: false });

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .order("admission_number");

  return (
    <ExamsDashboard
      exams={exams || []}
      classes={classes || []}
      subjects={subjects || []}
      academicYears={academicYears || []}
      students={students || []}
    />
  );
}
