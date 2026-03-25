import { getSessionRole } from "@/lib/auth-utils";
import GradebookDashboard from "@/components/gradebook/GradebookDashboard";
import { createClient } from "@/lib/supabase/server";
import { getStudentResults } from "@/app/actions/exams";

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
        <GradebookDashboard 
            userRole={role} 
            isStudent={isStudent}
            initialGrades={initialGrades}
        />
    );
}
