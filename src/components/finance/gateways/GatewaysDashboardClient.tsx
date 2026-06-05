"use client";

import { useMemo, useState } from "react";
import { CreditCard, Globe, Plus, Power, Trash2 } from "lucide-react";
import { createGateway, deleteGateway, updateGateway, updateGatewayStatus } from "@/app/actions/gateways";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type GatewayFormState = {
    name: string;
    provider: string;
    api_key: string;
    secret_key: string;
    webhook_secret: string;
    config: string;
};

const emptyForm: GatewayFormState = {
    name: "",
    provider: "financial",
    api_key: "",
    secret_key: "",
    webhook_secret: "",
    config: "{}",
};

export function GatewaysDashboardClient({ initialGateways }: { initialGateways: any[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingGateway, setEditingGateway] = useState<any>(null);
    const [form, setForm] = useState<GatewayFormState>(emptyForm);

    const activeCount = useMemo(() => initialGateways.filter((gateway) => gateway.is_active).length, [initialGateways]);

    const openCreate = () => {
        setEditingGateway(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (gateway: any) => {
        setEditingGateway(gateway);
        setForm({
            name: gateway.name || "",
            provider: gateway.provider || "financial",
            api_key: gateway.api_key || "",
            secret_key: gateway.secret_key || "",
            webhook_secret: gateway.webhook_secret || "",
            config: JSON.stringify(gateway.config || {}, null, 2),
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.provider) return toast.error("Gateway name and provider are required.");

        let config: Record<string, string> = {};
        try {
            config = JSON.parse(form.config || "{}");
        } catch {
            return toast.error("Config must be valid JSON.");
        }

        setLoading(true);
        const payload = {
            name: form.name,
            provider: form.provider,
            api_key: form.api_key || undefined,
            secret_key: form.secret_key || undefined,
            webhook_secret: form.webhook_secret || undefined,
            config,
        };
        const result = editingGateway
            ? await updateGateway(editingGateway.id, payload)
            : await createGateway(payload);
        setLoading(false);
        if (!result.success) return toast.error(result.error || "Failed to save gateway");
        toast.success(editingGateway ? "Gateway updated" : "Gateway created");
        setOpen(false);
        router.refresh();
    };

    const handleToggle = async (gateway: any) => {
        const result = await updateGatewayStatus(gateway.id, !gateway.is_active);
        if (!result.success) return toast.error(result.error || "Failed to update gateway");
        toast.success(`Gateway ${gateway.is_active ? "disabled" : "enabled"}`);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this gateway?")) return;
        const result = await deleteGateway(id);
        if (!result.success) return toast.error(result.error || "Failed to delete gateway");
        toast.success("Gateway deleted");
        router.refresh();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ecosystem / Hub</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Gateway registry, keys, and activation state</p>
                </div>
                <button onClick={openCreate} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-x-2">
                    <Plus className="h-4 w-4" /> Add Gateway
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Configured</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{initialGateways.length}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Active</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{activeCount}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Financial</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{initialGateways.filter((gateway) => gateway.provider === "financial").length}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Academic / Other</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{initialGateways.filter((gateway) => gateway.provider !== "financial").length}</h3>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {initialGateways.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center col-span-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No gateways configured.</p>
                    </div>
                ) : initialGateways.map((gateway) => (
                    <div key={gateway.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${gateway.provider === "financial" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                                    {gateway.provider === "financial" ? <CreditCard className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{gateway.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{gateway.provider}</span>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                            gateway.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        )}>{gateway.is_active ? "Active" : "Inactive"}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => openEdit(gateway)} className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-[9px] uppercase tracking-widest px-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Edit</button>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <p>API key: {gateway.api_key ? "Configured" : "Not set"}</p>
                            <p>Webhook secret: {gateway.webhook_secret ? "Configured" : "Not set"}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <button onClick={() => handleToggle(gateway)} className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[9px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-x-2"><Power className="h-3.5 w-3.5" /> {gateway.is_active ? "Disable" : "Enable"}</button>
                            <button onClick={() => handleDelete(gateway.id)} className="h-8 w-8 rounded-xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full mx-4">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{editingGateway ? "Edit Gateway" : "Add Gateway"}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Name</label>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Provider</label>
                                    <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                        <option value="financial" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Financial</option>
                                        <option value="lms" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">LMS</option>
                                        <option value="identity" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Identity</option>
                                        <option value="messaging" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Messaging</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">API Key</label>
                                    <Input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Webhook Secret</label>
                                    <Input value={form.webhook_secret} onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Secret Key</label>
                                <Input value={form.secret_key} onChange={(e) => setForm({ ...form, secret_key: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Config JSON</label>
                                <textarea value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none resize-none min-h-32 font-mono" />
                            </div>
                            <div className="flex justify-end gap-x-2 pt-2">
                                <button onClick={() => setOpen(false)} className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Cancel</button>
                                <button onClick={handleSave} disabled={loading} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">{loading ? "Saving..." : editingGateway ? "Update Gateway" : "Create Gateway"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}