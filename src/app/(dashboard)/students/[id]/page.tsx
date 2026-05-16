import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Edit3 } from "lucide-react";
import Link from "next/link";
import { getStudentResults } from "@/app/actions/exams";
import { getStudentAttendance } from "@/app/actions/attendance";
import { StudentProfileTabs } from "@/components/students/StudentProfileTabs";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
            {/* Unified Page Header */}
            <UnifiedPageHeader 
                title={`${student.profile?.first_name} ${student.profile?.last_name}`}
                subtitle={`Institutional Record: ${student.admission_number || id.slice(0, 8)}`}
                icon={User}
                color="emerald"
                actions={
                    <>
                        <Link href="/students">
                            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Directory
                            </Button>
                        </Link>
                        <Link href={`/students/${id}/edit`}>
                            <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
                                <Edit3 className="h-4 w-4" />
                                Modify Profile
                            </Button>
                        </Link>
                    </>
                }
            />

            <StudentProfileTabs student={student} grades={grades} attendance={attendance} />
        </div>
    );
}
