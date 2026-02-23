import { createClient } from "@/lib/supabase/server";
import { ExamList } from "@/components/exams/ExamList";

export default async function ExamsPage() {
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from("exams")
    .select(
      `
      *,
      academic_year:academic_years(*)
    `,
    )
    .order("start_date", { ascending: false });

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .order("name", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Exams
        </h2>
        <p className="text-slate-500">
          Schedule examinations and manage student results.
        </p>
      </div>

      <ExamList initialData={exams || []} academicYears={academicYears || []} />
    </div>
  );
}
