import { createClient } from "@/lib/supabase/server";
import { ExamsDashboard } from "@/components/exams/ExamsDashboard";
import { getSessionRole } from "@/lib/auth-utils";

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

      // Get subjects for this class's exams
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
    // Admin/Teacher: All data
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
    <ExamsDashboard
      exams={exams || []}
      classes={classes || []}
      subjects={subjects || []}
      academicYears={academicYears || []}
      students={students || []}
      marksSummary={marksSummary || []}
      userRole={role || "student"}
    />
  );
}
