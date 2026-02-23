import { AttendanceService } from "@/lib/services/attendance";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ClipboardCheck } from "lucide-react";

export default async function AttendancePage() {
  const classes = await AttendanceService.getClasses();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-black tracking-tight text-slate-900">
          Attendance Nexus
        </h2>
        <p className="text-slate-500 font-medium tracking-tight">
          Precision Tracking & Behavioral Patterns
        </p>
      </div>

      <Tabs defaultValue="mark" className="space-y-8">
        <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14 w-fit">
          <TabsTrigger
            value="mark"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <Calendar className="h-4 w-4" />
            Attendance Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="mark"
          className="animate-in slide-in-from-bottom-2 duration-500 mt-0"
        >
          <AttendanceForm classes={classes} />
        </TabsContent>
        <TabsContent
          value="history"
          className="animate-in slide-in-from-bottom-2 duration-500 mt-0"
        >
          <AttendanceHistory classes={classes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
