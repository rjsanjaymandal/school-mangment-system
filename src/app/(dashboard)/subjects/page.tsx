import { createClient } from "@/lib/supabase/server";
import { SubjectList } from "@/components/subjects/SubjectList";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Subjects
        </h2>
        <p className="text-slate-500">Manage academic subjects and courses.</p>
      </div>

      <SubjectList initialData={subjects || []} />
    </div>
  );
}
