import { getStaff, getDepartments } from "@/app/actions/hr";
import { StaffDirectory } from "@/components/hr/StaffDirectory";
import { getSessionRole } from "@/lib/auth-utils";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function StaffDirectoryPage() {
    const role = await getSessionRole();
    const [{ data: staffData }, { data: departments }] = await Promise.all([
        getStaff(),
        getDepartments()
    ]);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <UnifiedPageHeader 
                title="Staff List"
                subtitle="Complete staff directory and management"
                icon={Users}
                color="emerald"
                actions={
                    <Link href="/hr/add-staff">
                        <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all active:scale-95 gap-2 flex items-center">
                            <UserPlus className="h-4 w-4" /> Add Staff
                        </button>
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