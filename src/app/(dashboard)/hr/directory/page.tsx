import { getStaff, getDepartments } from "@/app/actions/hr";
import { StaffDirectory } from "@/components/hr/StaffDirectory";
import { getSessionRole } from "@/lib/auth-utils";
import { Users, UserPlus, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function StaffDirectoryPage() {
    const role = await getSessionRole();
    const [{ data: staffData }, { data: departments }] = await Promise.all([
        getStaff(),
        getDepartments()
    ]);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Unified Page Header */}
            <UnifiedPageHeader 
                title="Staff"
                subtitle="Directory"
                icon={Users}
                color="emerald"
                actions={
                    <Link href="/hr/add-staff">
                        <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
                            <UserPlus className="h-4 w-4" /> Add Staff
                        </Button>
                    </Link>
                }
            />

            <StaffDirectory 
                initialData={staffData || []} 
                departments={departments || []}
                userRole={role}
            />
        </div>
    );
}