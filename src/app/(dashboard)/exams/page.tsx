import { createClient } from "@/lib/supabase/server";
import { ExamsDashboard } from "@/components/exams/ExamsDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

export default async function ExamsPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let exams: any[] = [];
  let classes: any[] = [];
  let subjects: any[] = [];
  let students: any[] = [];
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, class:classes(*)")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      const { data: classExams } = await supabase
        .from("exams")
        .select("*, subject:subjects(*), class:classes(*), academic_year:academic_years(*)")
        .eq("class_id", student.class_id)
        .order("date", { ascending: false });
      
      exams = classExams || [];
      classes = student.class ? [student.class] : [];
      students = [student];

      const subjectIds = [...new Set(exams.map(e => e.subject_id))];
      if (subjectIds.length > 0) {
        const { data: classSubjects } = await supabase
          .from("subjects")
          .select("*")
          .in("id", subjectIds);
        subjects = classSubjects || [];
      }
    }
  } else {
    const { data: allExams } = await supabase
      .from("exams")
      .select(`
        *,
        subject:subjects(*),
        class:classes(*),
        academic_year:academic_years(*),
        marks(count)
      `)
      .order("date", { ascending: false });
    exams = allExams || [];

    const { data: allClasses } = await supabase
      .from("classes")
      .select("*")
      .order("name");
    classes = allClasses || [];

    const { data: allSubjects } = await supabase
      .from("subjects")
      .select("*")
      .order("name");
    subjects = allSubjects || [];

    const { data: allStudents } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .order("admission_number");
    students = allStudents || [];
  }

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .order("is_current", { ascending: false });

  const { data: marksSummary } = await supabase
    .from("marks")
    .select("marks_obtained, exam:exams(passing_marks, max_marks, subject:subjects(name))");

return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-md">
            <FileText className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exams</h1>
            <p className="text-sm text-slate-500">Manage exams and assessments</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Create Exam
        </Button>
      </div>

      <ERPCard
        title="Exam Management"
        description="Schedule and manage examinations"
        icon={<FileText className="h-5 w-5" />}
        color="red"
      >
        <ExamsDashboard
          exams={exams || []}
          classes={classes || []}
          subjects={subjects || []}
          academicYears={academicYears || []}
          students={students || []}
          marksSummary={marksSummary || []}
          userRole={role || "student"}
        />
      </ERPCard>
    </div>
  );
}
