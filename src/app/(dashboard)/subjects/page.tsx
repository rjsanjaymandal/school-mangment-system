import { createClient } from "@/lib/supabase/server";
import { SubjectList } from "@/components/subjects/SubjectList";
import { BookOpen, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Curriculum Registry"
        description="Manage institutional subjects, credit allocations, and academic syllabus details."
        icon={BookOpen}
        badge={`${subjects?.length || 0} active subjects`}
      >
        <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </PageHeader>

      <div className="reveal-1">
        <SubjectList initialData={subjects || []} />
      </div>
    </div>
  );
}

