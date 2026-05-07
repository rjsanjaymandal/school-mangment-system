export const revalidate = 30;
export const dynamic = 'force-static';

import { createClient } from "@/lib/supabase/server";
import { TimetableDashboard } from "@/components/timetable/TimetableDashboard";
import { getSessionRole } from "@/lib/auth-utils";

export default async function TimetablePage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .order("is_current", { ascending: false });

  const currentAY = academicYears?.find((ay: any) => ay.is_current) || academicYears?.[0];

  let timetables: any[] = [];
  let classes: any[] = [];
  let subjects: any[] = [];
  let teachers: any[] = [];
  let classSubjects: any[] = [];
  const isStudent = role === "student";

  if (currentAY?.id) {
    const { data: assignedSubjects } = await supabase
      .from("class_subjects")
      .select("*, subject:subjects(*)")
      .or(`academic_year_id.eq.${currentAY.id},academic_year_id.is.null`);

    classSubjects = assignedSubjects || [];
  }

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, class:classes(*, teacher:teachers(*, profile:profiles(*)))")
      .eq("id", user?.id)
      .single();

    if (student) {
      const { data: enrollment } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", student.id)
        .eq("academic_year_id", currentAY?.id || "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      const activeClassId = enrollment?.class_id || student.class_id;

      const { data: classTimetables } = await supabase
        .from("timetables")
        .select(`
          *,
          class:classes(*),
          slots:timetable_slots(*, subject:subjects(*), teacher:staff(*, profile:profiles(*)))
        `)
        .eq("class_id", activeClassId)
        .eq("academic_year_id", currentAY?.id || "00000000-0000-0000-0000-000000000000")
        .order("day_of_week");
      
      timetables = classTimetables || [];
      classes = student.class ? [{ ...student.class, id: activeClassId || student.class.id }] : [];

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
          .from("staff")
          .select("*, profile:profiles(*)")
          .in("id", Array.from(teacherIds));
        teachers = classTeachers || [];
      }
    }
  } else {
    const { data: allTimetables } = await supabase
      .from("timetables")
      .select(`
        *,
        class:classes(*),
        slots:timetable_slots(*, 
          subject:subjects(*), 
          teacher:staff(*, profile:profiles(*)),
          original_teacher:staff!timetable_slots_original_teacher_id_fkey(*, profile:profiles(*))
        )
      `)
      .eq("academic_year_id", currentAY?.id || "00000000-0000-0000-0000-000000000000")
      .order("day_of_week");
    timetables = allTimetables || [];

    const { data: allClasses } = await supabase
      .from("classes")
      .select("*, teacher:teachers(*, profile:profiles(*))")
      .order("name");
    classes = allClasses || [];

    const { data: allSubjects } = await supabase
      .from("subjects")
      .select("*")
      .order("name");
    subjects = allSubjects || [];

    const { data: allTeachers } = await supabase
      .from("staff")
      .select(`
        id,
        staff_id,
        staff_type,
        first_name,
        last_name,
        status,
        expertise_tags,
        proficiency_level,
        max_daily_hours,
        max_weekly_hours,
        profile:profiles(*)
      `)
      .eq("status", "active")
      .eq("staff_type", "teaching");
    teachers = allTeachers || [];
  }



  return (
    <TimetableDashboard
      timetables={timetables || []}
      classes={classes || []}
      subjects={subjects || []}
      teachers={teachers || []}
      classSubjects={classSubjects || []}
      academicYears={academicYears || []}
      userRole={role || "student"}
    />
  );
}
