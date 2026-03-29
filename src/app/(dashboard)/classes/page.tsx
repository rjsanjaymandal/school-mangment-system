import { createClient } from "@/lib/supabase/server";
import { ClassList } from "@/components/classes/ClassList";
import { getSessionRole } from "@/lib/auth-utils";

export default async function ClassesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *,
      teacher:profiles!classes_teacher_id_fkey(id, full_name)
    `)
    .order("name", { ascending: true });

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
            Academic Formations
          </h2>
          <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
            Grade Levels, Sectional Nodes & Spatial Allocation
          </p>
        </div>
      </div>

      <ClassList initialData={classes || []} userRole={role} teachers={teachers || []} />
    </div>
  );
}

