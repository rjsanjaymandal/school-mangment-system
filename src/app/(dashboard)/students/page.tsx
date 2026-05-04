import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { StudentList } from "@/components/students/StudentList";
import { createClient } from "@/lib/supabase/server";
import { Users, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default async function StudentsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const [students, classes, currentAcademicYear] = await Promise.all([
    InstitutionalService.getStudents().catch(() => []),
    supabase.from("classes").select("*").order("name").then(({ data }) => data || []),
    supabase.from("academic_years").select("id").eq("is_current", true).maybeSingle().then(({ data }) => data),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Student Registry"
        description="Comprehensive directory of institutional learners and academic profiles."
        icon={Users}
        badge={`${students?.length || 0} Records`}
      >
        <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
          <UserPlus className="h-4 w-4" />
          Enroll New
        </Button>
      </PageHeader>

      <StudentList 
        initialData={students || []} 
        classes={classes || []}
        currentAcademicYearId={currentAcademicYear?.id}
        userRole={role} 
      />
    </div>
  );
}
