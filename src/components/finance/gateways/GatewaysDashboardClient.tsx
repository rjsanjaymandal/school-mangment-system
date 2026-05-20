"use client";

import { useMemo, useState } from "react";
import { CreditCard, Globe, Plus, Power, Trash2 } from "lucide-react";
import { createGateway, deleteGateway, updateGateway, updateGatewayStatus } from "@/app/actions/gateways";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 text-foreground">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase italic">Ecosystem <span className="text-primary">/</span> Hub</h2>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-3">Gateway registry, keys, and activation state</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Gateway</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>{editingGateway ? "Edit Gateway" : "Add Gateway"}</DialogTitle></DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Provider</Label><Select value={form.provider} onValueChange={(value) => setForm({ ...form, provider: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="financial">Financial</SelectItem><SelectItem value="lms">LMS</SelectItem><SelectItem value="identity">Identity</SelectItem><SelectItem value="messaging">Messaging</SelectItem></SelectContent></Select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>API Key</Label><Input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Webhook Secret</Label><Input value={form.webhook_secret} onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><Label>Secret Key</Label><Input value={form.secret_key} onChange={(e) => setForm({ ...form, secret_key: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Config JSON</Label><Textarea value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} className="min-h-32 font-mono text-xs" /></div>
                            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : editingGateway ? "Update Gateway" : "Create Gateway"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Configured</p><h3 className="text-4xl font-bold mt-2">{initialGateways.length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Active</p><h3 className="text-4xl font-bold mt-2">{activeCount}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Financial</p><h3 className="text-4xl font-bold mt-2">{initialGateways.filter((gateway) => gateway.provider === "financial").length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Academic / Other</p><h3 className="text-4xl font-bold mt-2">{initialGateways.filter((gateway) => gateway.provider !== "financial").length}</h3></Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {initialGateways.length === 0 ? <Card className="p-10 text-center text-muted-foreground col-span-full">No gateways configured.</Card> : initialGateways.map((gateway) => (
                    <Card key={gateway.id} className="p-6 border border-border">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-full border flex items-center justify-center ${gateway.provider === "financial" ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                                    {gateway.provider === "financial" ? <CreditCard className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="font-semibold">{gateway.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">{gateway.provider}</Badge>
                                        <Badge variant="outline" className={gateway.is_active ? "border-primary/20 text-primary bg-primary/5" : ""}>{gateway.is_active ? "Active" : "Inactive"}</Badge>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(gateway)}>Edit</Button>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <p>API key: {gateway.api_key ? "Configured" : "Not set"}</p>
                            <p>Webhook secret: {gateway.webhook_secret ? "Configured" : "Not set"}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <Button variant="outline" size="sm" onClick={() => handleToggle(gateway)}><Power className="h-4 w-4 mr-2" /> {gateway.is_active ? "Disable" : "Enable"}</Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(gateway.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
