export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { SubjectList } from "@/components/subjects/SubjectList";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-md">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
            <p className="text-sm text-slate-500">{subjects?.length || 0} subjects</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <ERPCard
        title="Subjects"
        description="Manage all subjects"
        icon={<BookOpen className="h-5 w-5" />}
        color="blue"
      >
        <SubjectList initialData={subjects || []} />
      </ERPCard>
    </div>
  );
}

