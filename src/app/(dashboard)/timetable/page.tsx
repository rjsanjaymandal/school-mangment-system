import { createClient } from "@/lib/supabase/server";
import { TimetableDashboard } from "@/components/timetable/TimetableDashboard";
import { getSessionRole } from "@/lib/auth-utils";

export default async function TimetablePage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let timetables: any[] = [];
  let classes: any[] = [];
  let subjects: any[] = [];
  let teachers: any[] = [];
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, class:classes(*)")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      const { data: classTimetables } = await supabase
        .from("timetables")
        .select(`
          *,
          class:classes(*),
          slots:timetable_slots(*, subject:subjects(*), teacher:teachers(*, profile:profiles(*)))
        `)
        .eq("class_id", student.class_id)
        .order("day_of_week");
      
      timetables = classTimetables || [];
      classes = student.class ? [student.class] : [];

      // Extract unique subjects and teachers from slots
      const subjectIds = new Set<string>();
      const teacherIds = new Set<string>();
      
      timetables.forEach(t => {
        t.slots?.forEach((s: any) => {
          if (s.subject_id) subjectIds.add(s.subject_id);
          if (s.teacher_id) teacherIds.add(s.teacher_id);
        });
      });

      if (subjectIds.size > 0) {
        const { data: classSubjects } = await supabase
          .from("subjects")
          .select("*")
          .in("id", Array.from(subjectIds));
        subjects = classSubjects || [];
      }

      if (teacherIds.size > 0) {
        const { data: classTeachers } = await supabase
          .from("teachers")
          .select("*, profile:profiles(*)")
          .in("id", Array.from(teacherIds));
        teachers = classTeachers || [];
      }
    }
  } else {
    // Admin/Teacher: All data
    const { data: allTimetables } = await supabase
      .from("timetables")
      .select(`
        *,
        class:classes(*),
        slots:timetable_slots(*, subject:subjects(*), teacher:teachers(*, profile:profiles(*)))
      `)
      .order("day_of_week");
    timetables = allTimetables || [];

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

    const { data: allTeachers } = await supabase
      .from("teachers")
      .select("*, profile:profiles(*)")
      .eq("status", "active");
    teachers = allTeachers || [];
  }

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .order("is_current", { ascending: false });

  return (
    <TimetableDashboard
      timetables={timetables || []}
      classes={classes || []}
      subjects={subjects || []}
      teachers={teachers || []}
      academicYears={academicYears || []}
      userRole={role || "student"}
    />
  );
}
