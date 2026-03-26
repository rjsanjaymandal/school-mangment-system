import { getSessionRole } from "@/lib/auth-utils";
import GradebookDashboard from "@/components/gradebook/GradebookDashboard";
import { createClient } from "@/lib/supabase/server";
import { getStudentResults } from "@/app/actions/exams";
import { TrendingUp, Calculator } from "lucide-react";

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
        <div className="space-y-12 animate-in fade-in transition-all duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
                <div>
                    <div className="flex items-center gap-x-3 mb-4">
                        <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-x-2">
                            <TrendingUp className="h-3 w-3 animate-pulse" />
                            Academic Analytics Node: Active
                        </div>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Protocol: GPA-X</span>
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Registry <span className="text-primary tracking-normal not-italic">/</span> Gradebook
                    </h2>
                    <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
                        <Calculator className="h-3 w-3 text-primary" />
                        Institutional Performance & Master Transcript Matrix
                    </p>
                </div>
            </div>

            <div className="reveal-1">
                <GradebookDashboard 
                    userRole={role} 
                    isStudent={isStudent}
                    initialGrades={initialGrades}
                />
            </div>
        </div>
    );
}
