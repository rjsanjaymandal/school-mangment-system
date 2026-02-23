import { createClient } from "@/lib/supabase/server";
import { StudentList } from "@/components/students/StudentList";

export default async function StudentsPage() {
  const supabase = await createClient();

  // Fetch students with their profile and class data
  const { data: students, error } = await supabase
    .from("students")
    .select(
      `
      *,
      profile:profiles(*),
      class:classes(*)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Students
        </h2>
        <p className="text-slate-500">
          Manage student records and information.
        </p>
      </div>

      <StudentList initialData={students || []} />
    </div>
  );
}
