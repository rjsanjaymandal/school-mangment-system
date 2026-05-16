export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { TeacherList } from "@/components/teachers/TeacherList";
import { StaffHRManagement } from "@/components/teachers/StaffHRManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, UserPlus, ShieldCheck, Activity, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import Link from "next/link";

export default async function TeachersPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const isAdminOrTeacher = role === "admin" || role === "teacher";

  const { data: { user } } = await supabase.auth.getUser();

  const [teachers, leaveRequests, payrolls] = await Promise.all([
    InstitutionalService.getTeachers(supabase).catch(() => []),
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

  const staffList = (teachers || []).map((t: any) => ({
    id: t.id,
    full_name: t.profile?.full_name || "Unknown",
    email: t.profile?.email
  }));

  const activeTeachers = (teachers || []).filter((t: any) => t.status === "active").length;
  const leaveCount = (leaveRequests.data || []).filter((r: any) => r.status === "pending").length;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Faculty Management"
        subtitle={`${teachers?.length || 0} total staff members registered`}
        icon={Users}
        color="blue"
        actions={
          <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Faculty
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-75">
        <DashboardStatCard title="Total Staff" value={teachers?.length || 0} icon={Users} color="blue" description="Institutional headcount" />
        <DashboardStatCard title="Active Faculty" value={activeTeachers} icon={ShieldCheck} color="emerald" description="Currently operational" />
        <DashboardStatCard title="Leave Requests" value={leaveCount} icon={Activity} color="rose" description="Pending review" />
        <DashboardStatCard title="Payroll Status" value="Generated" icon={TrendingUp} color="amber" description="Current month cycle" />
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="bg-slate-100/50 backdrop-blur-sm p-1 rounded-xl h-auto border border-slate-200/60 w-fit overflow-x-auto max-w-full">
            <TabsTrigger
              value="list"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-[0.1em]"
            >
              <Users className="h-4 w-4 mr-2" />
              Faculty List
            </TabsTrigger>
            {isAdminOrTeacher && (
              <TabsTrigger
                value="hr"
                className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-[0.1em]"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                HR Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="outline-none">
            <TeacherList initialData={teachers || []} />
          </TabsContent>

          {isAdminOrTeacher && (
            <TabsContent value="hr" className="outline-none">
              <StaffHRManagement 
                leaveRequests={leaveRequests.data || []} 
                payrolls={payrolls.data || []} 
                staff={staffList}
                staffCount={teachers?.length || 0}
                userRole={role}
                currentUserId={user?.id}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}


