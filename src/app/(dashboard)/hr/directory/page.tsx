import { getStaff, getDepartments } from "@/app/actions/hr";
import { StaffDirectory } from "@/components/hr/StaffDirectory";
import { getSessionRole } from "@/lib/auth-utils";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StaffDirectoryPage() {
    const role = await getSessionRole();
    const [{ data: staffData }, { data: departments }] = await Promise.all([
        getStaff(),
        getDepartments()
    ]);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Personnel</span>
                    <span>/</span>
                    <span className="text-foreground font-medium">Staff Directory</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Staff Directory</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage all staff members</p>
                </div>
                <Link href="/hr/add-staff">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Users className="h-4 w-4 mr-2" />
                        Add Staff
                    </Button>
                </Link>
            </div>

            <StaffDirectory 
                initialData={staffData || []} 
                departments={departments || []}
                userRole={role}
            />
        </div>
    );
}