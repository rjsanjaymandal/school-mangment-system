import { getStudents, getClasses } from "@/app/actions/students";
import { StudentList } from "@/components/students/StudentList";
import { getSessionRole, getAcademicYearId } from "@/lib/auth-utils";
import { GraduationCap, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function StudentDirectoryPage() {
    const role = await getSessionRole();
    const academicYearId = await getAcademicYearId();
    
    const [{ data: students }, { data: classes }] = await Promise.all([
        getStudents(),
        getClasses()
    ]);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <UnifiedPageHeader 
                title="Students"
                subtitle="Student List"
                icon={GraduationCap}
                color="emerald"
                actions={
                    <Link href="/students/enroll">
                        <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
                            <UserPlus className="h-4 w-4" /> Add Student
                        </Button>
                    </Link>
                }
            />

            <StudentList 
                initialData={students || []} 
                classes={classes || []}
                userRole={role}
                currentAcademicYearId={academicYearId}
            />
        </div>
    );
}
