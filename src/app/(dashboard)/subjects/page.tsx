import { createClient } from "@/lib/supabase/server";
import { SubjectList } from "@/components/subjects/SubjectList";
import { BrainCircuit, BookOpen } from "lucide-react";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-8 animate-in fade-in transition-all duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-x-2 mb-2">
             <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-x-1.5 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                System Active
             </div>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 border-l border-border ml-2">Curriculum Management</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Academic <span className="text-primary">Subjects</span>
          </h2>
          <p className="text-muted-foreground font-medium text-[12px] mt-2 flex items-center gap-x-2">
             <BookOpen className="h-4 w-4 text-primary/60" />
             Manage core curriculum, credits, and syllabus details
          </p>
        </div>
      </div>

      <div className="reveal-1">
        <SubjectList initialData={subjects || []} />
      </div>
    </div>
  );
}

