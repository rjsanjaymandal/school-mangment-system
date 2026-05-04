import { createClient } from "@/lib/supabase/server";
import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { TeacherList } from "@/components/teachers/TeacherList";
import { StaffHRManagement } from "@/components/teachers/StaffHRManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default async function TeachersPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const isAdminOrTeacher = role === "admin" || role === "teacher";

  const { data: { user } } = await supabase.auth.getUser();

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

  // Transform teachers for the attendance list
  const staffList = (teachers || []).map((t: any) => ({
    id: t.id,
    full_name: t.profile?.full_name || "Unknown",
    email: t.profile?.email
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Faculty Management"
        description="Academic & Administrative Logistics Engine for Faculty Personnel."
        icon={Users}
        badge={`${teachers?.length || 0} Faculty Members`}
      >
        <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
          <UserPlus className="h-4 w-4" />
          Onboard Staff
        </Button>
      </PageHeader>

      <Tabs defaultValue="list" className="space-y-8">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl h-14 border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          <TabsTrigger
            value="list"
            className="rounded-xl px-10 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] transition-all gap-x-3 shadow-sm"
          >
            <Users className="h-4 w-4" />
            Teacher Directory
          </TabsTrigger>
          {isAdminOrTeacher && (
            <TabsTrigger
              value="hr"
              className="rounded-xl px-10 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-bold uppercase tracking-widest text-[10px] transition-all gap-x-3 shadow-sm"
            >
              <Briefcase className="h-4 w-4" />
              Staff HR & Logistics
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value="list"
          className="animate-in slide-in-from-bottom-4 duration-700 outline-none"
        >
          <TeacherList initialData={teachers || []} />
        </TabsContent>

        <TabsContent
          value="hr"
          className="animate-in slide-in-from-bottom-4 duration-700 outline-none"
        >
          <StaffHRManagement 
            leaveRequests={leaveRequests.data || []} 
            payrolls={payrolls.data || []} 
            staff={staffList}
            staffCount={teachers?.length || 0}
            userRole={role}
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


