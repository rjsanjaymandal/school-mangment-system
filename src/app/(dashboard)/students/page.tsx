import { InstitutionalService } from "@/lib/services/institutional";
import { StudentList } from "@/components/students/StudentList";

export default async function StudentsPage() {
  const students = await InstitutionalService.getStudents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Students
        </h2>
        <p className="text-slate-500">
          Manage student records and information.
        </p>
      </div>

      <StudentList initialData={students || []} />
    </div>
  );
}
