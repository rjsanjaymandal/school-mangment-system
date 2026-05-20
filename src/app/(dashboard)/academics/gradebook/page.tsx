export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import GradebookClient from "./GradebookClient";

export default async function GradebookPage() {
  const role = await getSessionRole();
  const supabase = await createClient();

  const [classesRes, subjectsRes, examsRes, studentsRes] = await Promise.all([
    supabase.from("classes").select("id, name, section").order("name"),
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("exams").select("id, name, class_id, subject_id, max_marks").order("name"),
    supabase.from("students").select("id, admission_number, class_id, profile:profiles(full_name)").limit(80),
  ]);

  const { data: marksData } = await supabase.from("marks").select("student_id, exam_id, marks_obtained");

  return (
    <GradebookClient
      role={role || "student"}
      classes={classesRes.data || []}
      subjects={subjectsRes.data || []}
      exams={examsRes.data || []}
      students={studentsRes.data as any}
      marks={marksData || []}
    />
  );
}