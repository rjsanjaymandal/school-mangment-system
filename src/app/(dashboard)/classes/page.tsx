import { createClient } from "@/lib/supabase/server";
import { ClassList } from "@/components/classes/ClassList";
import { getSessionRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ClassesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: classes, error } = await supabase
    .from("classes")
    .select(`*`)
    .order("name", { ascending: true });

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code")
    .order("name", { ascending: true });

  const { data: currentAcademicYear } = await supabase
    .from("academic_years")
    .select("id, name")
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    console.error("Classes query error details:", JSON.stringify(error, null, 2));
    return <div className="p-8 text-destructive italic">Error loading institutional sections: {error.message}</div>;
  }

  // Manually join teacher data since the database foreign key might be missing
  const joinedClasses = classes?.map(cls => {
    const teacher = teachers?.find(t => t.id === cls.teacher_id);
    return { ...cls, teacher };
  }) || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Institutional Architecture"
        description="Manage grade levels, sections, and structural room allocations."
        icon={<Building2 className="h-7 w-7" />}
        badge={`${classes?.length || 0} active sections`}
      >
        <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
          <Plus className="h-4 w-4" />
          Create Class
        </Button>
      </PageHeader>

      <ClassList
        initialData={joinedClasses as any}
        userRole={role}
        teachers={teachers || []}
        subjects={subjects || []}
        currentAcademicYearId={currentAcademicYear?.id}
      />
    </div>
  );
}

