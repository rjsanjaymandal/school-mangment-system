import { createClient } from "@/lib/supabase/server";
import { ClassList } from "@/components/classes/ClassList";
import { getSessionRole } from "@/lib/auth-utils";

export default async function ClassesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *
    `)
    .order("name", { ascending: true });

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Classes query error details:", JSON.stringify(error, null, 2));
    return <div className="p-8 text-destructive">Error loading classes: {error.message}</div>;
  }

  // Manually join teacher data since the database foreign key might be missing
  const joinedClasses = classes?.map(cls => {
    const teacher = teachers?.find(t => t.id === cls.teacher_id);
    return { ...cls, teacher };
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
          <p className="text-muted-foreground mt-2">
            Manage grade levels, sections, and room allocations.
          </p>
        </div>
      </div>

      <ClassList initialData={joinedClasses as any} userRole={role} teachers={teachers || []} />
    </div>
  );
}

