import { createClient } from "@/lib/supabase/server";
import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { TeacherList } from "@/components/teachers/TeacherList";
import { StaffHRManagement } from "@/components/teachers/StaffHRManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Shovel } from "lucide-react";

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
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
            <div>
                <div className="flex items-center gap-x-3 mb-4">
                    <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-x-2">
                        <Users className="h-3 w-3 animate-pulse" />
                        Faculty Node: Active
                    </div>
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest italic">Matrix: Personnel Management</span>
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                    Faculty <span className="text-primary tracking-normal not-italic">/</span> Hub
                </h2>
                <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
                    <Briefcase className="h-3 w-3 text-primary" />
                    Academic & Administrative Logistics Engine
                </p>
            </div>
        </div>

        <Tabs defaultValue="list" className="space-y-12 reveal-1">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-sm h-14 w-fit">
                    <TabsTrigger
                        value="list"
                        className="rounded-xs px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 emerald-border-glow shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
                    >
                        <Users className="h-4 w-4 not-skew-x" />
                        Teacher Directory
                    </TabsTrigger>
                    {isAdminOrTeacher && (
                        <TabsTrigger
                            value="hr"
                            className="rounded-xs px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 emerald-border-glow shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
                        >
                            <Briefcase className="h-4 w-4 not-skew-x" />
                            Staff HR & Logistics
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>

            <TabsContent
                value="list"
                className="animate-in slide-in-from-bottom-2 duration-700 outline-none"
            >
                <TeacherList initialData={teachers || []} />
            </TabsContent>

            <TabsContent
                value="hr"
                className="animate-in slide-in-from-bottom-2 duration-700 outline-none"
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


