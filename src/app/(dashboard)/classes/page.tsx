import { createClient } from "@/lib/supabase/server";
import { ClassList } from "@/components/classes/ClassList";

export default async function ClassesPage() {
  const supabase = await createClient();

  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Classes
        </h2>
        <p className="text-slate-500">
          Manage grade levels and class sections.
        </p>
      </div>

      <ClassList initialData={classes || []} />
    </div>
  );
}
