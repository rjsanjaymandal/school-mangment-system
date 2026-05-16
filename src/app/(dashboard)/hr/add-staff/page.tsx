import { getDepartments, getDesignations } from "@/app/actions/hr";
import { AddStaffForm } from "@/components/hr/AddStaffForm";
import { Users, UserPlus } from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function AddStaffPage() {
    const [{ data: departments }, { data: designations }] = await Promise.all([
        getDepartments(),
        getDesignations(),
    ]);

    // Workaround to refresh server components manually if needed
    async function handleRefresh() {
        "use server";
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Unified Page Header */}
            <UnifiedPageHeader 
                title="Add Staff"
                subtitle="Add a new employee or faculty member"
                icon={UserPlus}
                color="emerald"
            />

            <div className="max-w-5xl mx-auto pb-12">
                <AddStaffForm 
                    departments={departments || []} 
                    designations={designations || []} 
                    onRefreshLists={handleRefresh}
                />
            </div>
        </div>
    );
}