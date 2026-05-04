import { createClient } from "@/lib/supabase/server";
import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { TeacherList } from "@/components/teachers/TeacherList";
import { StaffHRManagement } from "@/components/teachers/StaffHRManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

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

  const staffList = (teachers || []).map((t: any) => ({
    id: t.id,
    full_name: t.profile?.full_name || "Unknown",
    email: t.profile?.email
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-md">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
            <p className="text-sm text-slate-500">{teachers?.length || 0} faculty members</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <UserPlus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <ERPCard
        title="Faculty Directory"
        description="Manage teaching staff and their assignments"
        icon={<Users className="h-5 w-5" />}
        color="blue"
      >
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="bg-slate-100 p-1 rounded-md h-10 w-full md:w-auto">
            <TabsTrigger
              value="list"
              className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Teachers
            </TabsTrigger>
            {isAdminOrTeacher && (
              <TabsTrigger
                value="hr"
                className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                HR & Payroll
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list">
            <TeacherList initialData={teachers || []} />
          </TabsContent>

          {isAdminOrTeacher && (
            <TabsContent value="hr">
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
      </ERPCard>
    </div>
  );
}


