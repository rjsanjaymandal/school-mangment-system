import { createClient } from "@/lib/supabase/server";
import { ClassList } from "@/components/classes/ClassList";
import { getSessionRole } from "@/lib/auth-utils";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

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
    return <div className="p-6 text-red-600">Error loading classes: {error.message}</div>;
  }

  const joinedClasses = classes?.map(cls => {
    const teacher = teachers?.find(t => t.id === cls.teacher_id);
    return { ...cls, teacher };
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-md">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
            <p className="text-sm text-slate-500">{classes?.length || 0} active classes</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      <ERPCard
        title="Classes"
        description="Manage all classes"
        icon={<Building2 className="h-5 w-5" />}
        color="purple"
      >
        <ClassList
          initialData={joinedClasses as any}
          userRole={role}
          teachers={teachers || []}
          subjects={subjects || []}
          currentAcademicYearId={currentAcademicYear?.id}
        />
      </ERPCard>
    </div>
  );
}

