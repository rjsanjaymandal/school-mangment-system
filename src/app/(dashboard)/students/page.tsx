export const dynamic = "force-dynamic";

import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { StudentList } from "@/components/students/StudentList";
import { createClient } from "@/lib/supabase/server";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import Link from "next/link";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function StudentsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const [students, classes, currentAcademicYear] = await Promise.all([
    InstitutionalService.getStudents(supabase).catch(() => []),
    supabase.from("classes").select("*").order("name").then(({ data }) => data || []),
    supabase.from("academic_years").select("id").eq("is_current", true).maybeSingle().then(({ data }) => data),
  ]);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Students"
        subtitle={`${students?.length || 0} total records registered`}
        icon={Users}
        color="emerald"
        actions={
          <Link href="/students/enroll">
            <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
              <UserPlus className="h-4 w-4" />
              Enroll New Student
            </Button>
          </Link>
        }
      />

      {/* Student List Component - Pass classes and year */}
      <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
        <StudentList 
          initialData={students || []} 
          classes={classes || []}
          currentAcademicYearId={currentAcademicYear?.id}
          userRole={role} 
        />
      </div>
    </div>
  );
}
