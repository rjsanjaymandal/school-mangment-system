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
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
        <div>
          <div className="flex items-center gap-x-3 mb-4">
             <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Knowledge Base Synchronized
             </div>
             <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Vault: MYS-KB-02</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            Registry <span className="text-primary tracking-normal not-italic">/</span> Subjects
          </h2>
          <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
             <BrainCircuit className="h-3 w-3 text-primary" />
             Core Curriculum & Syllabus Architecture
          </p>
        </div>
      </div>

      <div className="reveal-1">
        <SubjectList initialData={subjects || []} />
      </div>
    </div>
  );
}

