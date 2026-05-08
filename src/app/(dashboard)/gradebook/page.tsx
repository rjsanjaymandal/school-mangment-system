export const revalidate = 30;

import { getSessionRole } from "@/lib/auth-utils";
import GradebookDashboard from "@/components/gradebook/GradebookDashboard";
import { createClient } from "@/lib/supabase/server";
import { getStudentResults } from "@/app/actions/exams";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

export default async function GradebookPage() {
    const role = await getSessionRole();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let studentId = "";
    let initialGrades: any[] = [];
    const isStudent = role === "student";

    if (isStudent) {
        const { data: student } = await supabase
            .from("students")
            .select("id")
            .eq("profile_id", user?.id)
            .single();
        
        if (student) {
            studentId = student.id;
            const results = await getStudentResults(studentId);
            if (results.success) {
                initialGrades = results.data || [];
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-md">
                        <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Gradebook</h1>
                        <p className="text-sm text-slate-500">Manage grades and academic records</p>
                    </div>
                </div>
                <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Grade
                </Button>
            </div>

            <ERPCard
                title="Grade Management"
                description="Track student performance and grades"
                icon={<FileText className="h-5 w-5" />}
                color="emerald"
            >
                <GradebookDashboard 
                    userRole={role} 
                    isStudent={isStudent}
                    initialGrades={initialGrades}
                />
            </ERPCard>
        </div>
    );
}
