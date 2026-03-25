import { createClient } from "@/lib/supabase/server";
import { TimetableDashboard } from "@/components/timetable/TimetableDashboard";

export default async function TimetablePage() {
  const supabase = await createClient();

  const { data: timetables } = await supabase
    .from("timetables")
    .select(`
      *,
      class:classes(*),
      slots:timetable_slots(*, subject:subjects(*), teacher:teachers(*, profile:profiles(*)))
    `)
    .order("day_of_week");

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("name");

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*, profile:profiles(*)")
    .eq("status", "active");

  const { data: academicYears } = await supabase
    .from("academic_years")
    .select("*")
    .order("is_current", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  return (
    <TimetableDashboard
      timetables={timetables || []}
      classes={classes || []}
      subjects={subjects || []}
      teachers={teachers || []}
      academicYears={academicYears || []}
      userRole={profile?.role || "student"}
    />
  );
}

