import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStudentResults } from "@/app/actions/exams";
import { getStudentAttendance } from "@/app/actions/attendance";
import { StudentProfileTabs } from "@/components/students/StudentProfileTabs";

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
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-md">
                        <Link href="/students">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                Student ID: {id.slice(0, 8)}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold">
                            {student.profile?.first_name} {student.profile?.last_name}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-md gap-2" asChild>
                        <Link href={`/students/${id}/edit`}>
                            Edit Profile
                        </Link>
                    </Button>
                </div>
            </div>

            <StudentProfileTabs student={student} grades={grades} attendance={attendance} />
        </div>
    );
}
