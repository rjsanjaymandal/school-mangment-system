import { createClient } from "@/lib/supabase/server";
import { TimetableDashboard } from "@/components/timetable/TimetableDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { debugTimetableData } from "@/app/actions/timetable";

export const dynamic = 'force-dynamic';

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
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, class:classes(*, teacher:teachers(*, profile:profiles(*)))")
      .eq("id", user?.id)
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
        .eq("academic_year_id", currentAY?.id || "00000000-0000-0000-0000-000000000000")
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
    // Admin/Teacher: All data - fetch all timetables (ignore academic year filter for debugging)
    const { data: allTimetables } = await supabase
      .from("timetables")
      .select(`
        *,
        class:classes(*),
        slots:timetable_slots(*, subject:subjects(*), teacher:teachers(*, profile:profiles(*)))
      `)
      // Remove academic_year filter temporarily to debug
      // .eq("academic_year_id", currentAY?.id || "00000000-0000-0000-0000-000000000000")
      .order("day_of_week");
    timetables = allTimetables || [];
    
    // Then filter by academic year in memory
    if (currentAY?.id) {
      timetables = timetables.filter(t => t.academic_year_id === currentAY.id);
    }

    console.log("Timetable Page Debug:", {
      currentAY: currentAY?.id,
      timetablesFound: timetables.length,
      totalSlots: timetables.reduce((sum, t) => sum + (t.slots?.length || 0), 0)
    });

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
      .from("teachers")
      .select("*, profile:profiles(*)")
      .eq("status", "active");
    teachers = allTeachers || [];
  }



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
