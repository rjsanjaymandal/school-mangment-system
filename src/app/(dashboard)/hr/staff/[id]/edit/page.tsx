import { getStaffById, getDepartments, getDesignations } from "@/app/actions/hr";
import { AddStaffForm } from "@/components/hr/AddStaffForm";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
    const [{ data: staff }, { data: departments }, { data: designations }] = await Promise.all([
        getStaffById(params.id),
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
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/hr/staff/${params.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Edit Staff Profile</h1>
                        <p className="text-sm text-slate-500 mt-1">{staff.first_name} {staff.last_name} • {staff.staff_id}</p>
                    </div>
                </div>
            </div>

            <AddStaffForm 
                departments={departments || []} 
                designations={designations || []} 
                onRefreshLists={handleRefresh}
                initialData={staff}
            />
        </div>
    );
}
