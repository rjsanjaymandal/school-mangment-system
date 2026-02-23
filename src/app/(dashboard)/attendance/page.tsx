import { createClient } from "@/lib/supabase/server";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AttendancePage() {
  const supabase = await createClient();

  // Fetch classes to let the teacher select one
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Attendance
        </h2>
        <p className="text-slate-500">
          Mark and view student attendance records.
        </p>
      </div>

      <Tabs defaultValue="mark" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl">
          <TabsTrigger
            value="mark"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg px-6 py-2.5 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
          >
            Attendance Logs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mark" className="mt-0">
          <AttendanceForm classes={classes || []} />
        </TabsContent>
        <TabsContent value="history" className="mt-0">
          <AttendanceHistory classes={classes || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
