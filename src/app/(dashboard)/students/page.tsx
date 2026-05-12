export const dynamic = "force-dynamic";

import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { StudentList } from "@/components/students/StudentList";
import { createClient } from "@/lib/supabase/server";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import Link from "next/link";

export default async function StudentsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const [students, classes, currentAcademicYear] = await Promise.all([
    InstitutionalService.getStudents(supabase).catch(() => []),
    supabase.from("classes").select("*").order("name").then(({ data }) => data || []),
    supabase.from("academic_years").select("id").eq("is_current", true).maybeSingle().then(({ data }) => data),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title with Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-md">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Students</h1>
            <p className="text-sm text-slate-500">{students?.length || 0} total records</p>
          </div>
        </div>
        <Link href="/students/enroll">
          <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
            <UserPlus className="h-4 w-4" />
            Enroll New Student
          </Button>
        </Link>
      </div>

      {/* Student List Card */}
      <ERPCard
        title="Student Directory"
        description="Manage student records and academic profiles"
        icon={<Users className="h-5 w-5" />}
        color="emerald"
      >
        <StudentList 
          initialData={students || []} 
          classes={classes || []}
          currentAcademicYearId={currentAcademicYear?.id}
          userRole={role} 
        />
      </ERPCard>
    </div>
  );
}
