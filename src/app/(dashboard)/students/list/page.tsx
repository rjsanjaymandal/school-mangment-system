import { getStudents, getClasses } from "@/app/actions/students";
import { StudentList } from "@/components/students/StudentList";
import { getSessionRole, getAcademicYearId } from "@/lib/auth-utils";
import { GraduationCap, UserPlus } from "lucide-react";
import Link from "next/link";
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
                        <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2">
                            <UserPlus className="h-4 w-4" /> Add Student
                        </button>
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