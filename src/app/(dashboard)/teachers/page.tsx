import { createClient } from "@/lib/supabase/server";
import { InstitutionalService } from "@/lib/services/institutional";
import { TeacherList } from "@/components/teachers/TeacherList";
import { StaffHRManagement } from "@/components/teachers/StaffHRManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase } from "lucide-react";

export default async function TeachersPage() {
  const supabase = await createClient();

  const [teachers, leaveRequests, payrolls] = await Promise.all([
    InstitutionalService.getTeachers().catch(() => []),
    supabase
      .from("leave_requests")
      .select("*, staff:profiles(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("staff_payrolls")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground">
            Faculty Hub
          </h2>
          <p className="text-muted-foreground font-medium tracking-tight">
            Comprehensive Management of Academic & Administrative Staff
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-8">
        <TabsList className="bg-card/40 backdrop-blur-xl border border-border p-1 rounded-sm h-12 w-fit">
          <TabsTrigger
            value="list"
            className="rounded-xs px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow-sm"
          >
            <Users className="h-4 w-4" />
            Teacher Directory
          </TabsTrigger>
          <TabsTrigger
            value="hr"
            className="rounded-xs px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow-sm"
          >
            <Briefcase className="h-4 w-4" />
            Staff HR & Logistics
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="list"
          className="animate-in slide-in-from-bottom-2 duration-500"
        >
          <TeacherList initialData={teachers || []} />
        </TabsContent>

        <TabsContent
          value="hr"
          className="animate-in slide-in-from-bottom-2 duration-500"
        >
          <StaffHRManagement 
            leaveRequests={leaveRequests.data || []} 
            payrolls={payrolls.data || []} 
            staffCount={teachers?.length || 0}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


