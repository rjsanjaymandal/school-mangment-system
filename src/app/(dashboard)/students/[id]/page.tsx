import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Edit3 } from "lucide-react";
import Link from "next/link";
import { getStudentResults } from "@/app/actions/exams";
import { getStudentAttendance } from "@/app/actions/attendance";
import { StudentProfileTabs } from "@/components/students/StudentProfileTabs";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

import { redirect } from "next/navigation";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        notFound();
    }

    const supabase = await createClient();
    const student = await InstitutionalService.getStudentById(id, supabase);

    if (!student) {
        notFound();
    }

    const resultsResponse = await getStudentResults(id);
    const attendanceResponse = await getStudentAttendance(id);

    const grades = resultsResponse.success ? resultsResponse.data : [];
    const attendance = attendanceResponse.success ? attendanceResponse.data : [];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <UnifiedPageHeader 
                title={`${student.profile?.first_name} ${student.profile?.last_name}`}
                subtitle={`Institutional Record: ${student.admission_number || id.slice(0, 8)}`}
                icon={User}
                color="emerald"
                actions={
                    <>
                        <Link href="/students/list">
                            <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to List
                            </button>
                        </Link>
                        <Link href={`/students/${id}/edit`}>
                            <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2">
                                <Edit3 className="h-4 w-4" />
                                Edit Student
                            </button>
                        </Link>
                    </>
                }
            />

            <StudentProfileTabs student={student} grades={grades} attendance={attendance} />
        </div>
    );
}