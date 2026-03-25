import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { StudentList } from "@/components/students/StudentList";

export default async function StudentsPage() {
  const role = await getSessionRole();
  const students = await InstitutionalService.getStudents().catch((err: any) => {
    return [];
  });

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

      <StudentList initialData={students || []} userRole={role} />
    </div>
  );
}
