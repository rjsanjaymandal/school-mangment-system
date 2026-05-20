export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { SubjectList } from "@/components/academics/subjects/SubjectList";
import { BookOpen } from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="p-6 space-y-6">
      <UnifiedPageHeader 
        title="Subjects"
        subtitle="Manage academic curriculum and credit allocation"
        icon={BookOpen}
        color="blue"
      />

      <SubjectList initialData={subjects || []} />
    </div>
  );
}

