"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { addDesignation } from "@/app/actions/hr";
import { toast } from "sonner";

export function AddDesignationModal({ departments, onAdd }: { departments: any[], onAdd?: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [departmentId, setDepartmentId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        const res = await addDesignation(name, departmentId || undefined, code || undefined);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Designation added successfully");
            setOpen(false);
            setName("");
            setCode("");
            setDepartmentId("");
            if (onAdd) onAdd();
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="h-8 rounded-xl border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all"
            >
                <Plus className="h-3 w-3 inline mr-1" />
                Desig
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Add Designation</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                                    Designation Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Senior Teacher"
                                    required
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Designation Code</label>
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="e.g. S-TCH"
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Parent Department (Optional)</label>
                                <select
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none"
                                >
                                    <option value="">None</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all">Cancel</button>
                                    <button type="submit" disabled={loading || !name} className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                                        {loading ? "Saving..." : "Save Designation"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}