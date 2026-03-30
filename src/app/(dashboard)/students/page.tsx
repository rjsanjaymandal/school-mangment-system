import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { StudentList } from "@/components/students/StudentList";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";

export default async function StudentsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const [students, classes, currentAcademicYear] = await Promise.all([
    InstitutionalService.getStudents().catch(() => []),
    supabase.from("classes").select("*").order("name").then(({ data }) => data || []),
    supabase.from("academic_years").select("id").eq("is_current", true).maybeSingle().then(({ data }) => data),
  ]);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 relative reveal-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/10 pb-12 relative z-10">
        <div>
          <div className="flex items-center gap-x-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-x-2">
              <Users className="h-3.5 w-3.5" />
              Active Profiles
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Student Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage student records and directory
          </p>
        </div>
      </div>

      <StudentList 
        initialData={students || []} 
        classes={classes || []}
        currentAcademicYearId={currentAcademicYear?.id}
        userRole={role} 
      />
    </div>
  );
}
