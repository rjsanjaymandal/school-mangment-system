import { getDepartments, getDesignations } from "@/app/actions/hr";
import { AddStaffForm } from "@/components/hr/AddStaffForm";
import { Users, UserPlus } from "lucide-react";

export default async function AddStaffPage() {
    const [{ data: departments }, { data: designations }] = await Promise.all([
        getDepartments(),
        getDesignations(),
    ]);

    // Workaround to refresh server components manually if needed
    async function handleRefresh() {
        "use server";
        // Next.js handles revalidation automatically in the Server Actions
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <UserPlus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register Staff</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">HR Management System</p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Complete the multi-section form below to register a new staff member. An auto-generated Staff ID will be assigned upon successful registration.
            </p>

            <AddStaffForm 
                departments={departments || []} 
                designations={designations || []} 
                onRefreshLists={handleRefresh}
            />
        </div>
    );
}