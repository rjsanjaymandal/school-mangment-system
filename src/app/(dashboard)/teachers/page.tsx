import { createClient } from "@/lib/supabase/server";
import { TeacherList } from "@/components/teachers/TeacherList";
import { StaffHRManagement } from "@/components/teachers/StaffHRManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase } from "lucide-react";

export default async function TeachersPage() {
  const supabase = await createClient();

  // Fetch teachers with their profile data
  const { data: teachers, error } = await supabase
    .from("teachers")
    .select(
      `
      *,
      profile:profiles(*)
    `,
    )
    .order("joining_date", { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Faculty Hub
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Comprehensive Management of Academic & Administrative Staff
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-8">
        <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14 w-fit">
          <TabsTrigger
            value="list"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <Users className="h-4 w-4" />
            Teacher Directory
          </TabsTrigger>
          <TabsTrigger
            value="hr"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
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
          <StaffHRManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
