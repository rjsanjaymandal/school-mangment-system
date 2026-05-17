export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { ClassList } from "@/components/classes/ClassList";
import { getSessionRole } from "@/lib/auth-utils";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function ClassesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: classes, error } = await supabase
    .from("classes")
    .select(`
      *,
      class_subjects (
        subjects (
          id,
          name,
          code
        )
      )
    `)
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
    const assignedSubjects = cls.class_subjects
      ?.map((cs: any) => cs.subjects)
      .filter(Boolean) || [];

    return { ...cls, teacher, assignedSubjects };
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Classes"
        subtitle="Manage all active classes and view analytics"
        icon={Building2}
        color="purple"
      />

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

