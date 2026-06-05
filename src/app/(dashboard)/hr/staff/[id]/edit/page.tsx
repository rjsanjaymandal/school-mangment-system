import { getStaffById, getDepartments, getDesignations } from "@/app/actions/hr";
import { AddStaffForm } from "@/components/hr/AddStaffForm";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        notFound();
    }

    const [{ data: staff }, { data: departments }, { data: designations }] = await Promise.all([
        getStaffById(id),
        getDepartments(),
        getDesignations(),
    ]);

    if (!staff) {
        notFound();
    }

    async function handleRefresh() {
        "use server";
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-700">
            <UnifiedPageHeader 
                title="Edit Staff Profile"
                subtitle={`${staff.first_name} ${staff.last_name} • ${staff.staff_id}`}
                icon={User}
                color="emerald"
                actions={
                    <Link href={`/hr/staff/${id}`}>
                        <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    </Link>
                }
            />

            <AddStaffForm 
                departments={departments || []} 
                designations={designations || []} 
                onRefreshLists={handleRefresh}
                initialData={staff}
            />
        </div>
    );
}
