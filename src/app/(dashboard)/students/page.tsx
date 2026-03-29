import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { StudentList } from "@/components/students/StudentList";
import { createClient } from "@/lib/supabase/server";

export default async function StudentsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const [students, classes] = await Promise.all([
    InstitutionalService.getStudents().catch(() => []),
    supabase.from("classes").select("*").order("name").then(({ data }) => data || []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Students
        </h2>
        <p className="text-muted-foreground">
          Manage student records and information.
        </p>
      </div>

      <StudentList 
        initialData={students || []} 
        classes={classes || []}
        userRole={role} 
      />
    </div>
  );
}
