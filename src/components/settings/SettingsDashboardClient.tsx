"use client";

import { useState } from "react";
import {
    Settings,
    CreditCard,
    Building2,
    Bell,
    ActivitySquare,
    Globe,
    Lock,
    RefreshCw,
    Save,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateGatewayStatus, updateSettings } from "@/app/actions/settings-gateway-actions";

export default function SettingsDashboardClient({
    initialSettings,
    initialGateways,
}: {
    initialSettings: any;
    initialGateways: any[];
}) {
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState(initialSettings || { school_name: "", contact_email: "", currency: "USD", timezone: "UTC" });
    const [gateways, setGateways] = useState(initialGateways || []);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        // Simulate server call for now since we haven't wired the exact server action wrapper here yet
        setTimeout(() => setIsSaving(false), 1000);
    };

    const toggleGateway = (id: string) => {
        setGateways(gateways.map(g => g.id === id ? { ...g, is_active: !g.is_active } : g));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                        System Settings
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Global Configuration & Core Integrations
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue min-w-[140px]"
                    >
                        {isSaving ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? "Applying..." : "Apply Defaults"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    {[
                        { id: "general", label: "General", icon: Building2 },
                        { id: "gateways", label: "Gateways", icon: CreditCard },
                        { id: "notifications", label: "Notifications", icon: Bell },
                        { id: "security", label: "Security", icon: Lock },
                        { id: "system", label: "System Core", icon: ActivitySquare },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-slate-900 text-white shadow-lg neon-blue"
                                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === "general" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <Globe className="h-4 w-4 text-blue-400" />
                                    Institutional Identity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-black uppercase text-slate-500">
                                            Institution Name
                                        </Label>
                                        <Input
                                            value={settings.school_name}
                                            onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 h-12 rounded-xl font-medium"
                                            placeholder="e.g. Cambridge International"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-slate-500">
                                            Primary Contact Email
                                        </Label>
                                        <Input
                                            value={settings.contact_email}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 h-12 rounded-xl font-medium"
                                            placeholder="admin@school.edu"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-slate-500">
                                            Contact Phone
                                        </Label>
                                        <Input
                                            value={settings.contact_phone || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 h-12 rounded-xl font-medium"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-slate-500">
                                            Base Currency
                                        </Label>
                                        <Input
                                            value={settings.currency}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 h-12 rounded-xl font-medium"
                                            placeholder="USD, INR, EUR"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-slate-500">
                                            Timezone
                                        </Label>
                                        <Input
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            className="bg-slate-50/50 border-slate-200 h-12 rounded-xl font-medium"
                                            placeholder="UTC"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "gateways" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <CreditCard className="h-4 w-4 text-emerald-400" />
                                    Payment Infrastructure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {gateways.length > 0 ? gateways.map((gateway) => (
                                        <div key={gateway.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-x-4">
                                                <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${gateway.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg">{gateway.name}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">Provider: {gateway.provider.toUpperCase()} • {gateway.is_active ? 'Accepting Live Routing' : 'Offline'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-4">
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-black tracking-widest", gateway.is_active ? "text-emerald-500 bg-emerald-50 border-emerald-200" : "text-slate-400 bg-slate-50 border-slate-200")}>
                                                    {gateway.is_active ? "ACTIVE" : "DISABLED"}
                                                </Badge>
                                                <Switch checked={gateway.is_active} onCheckedChange={() => toggleGateway(gateway.id)} />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-12 text-center text-slate-500 font-medium">
                                            No payment gateways detected in routing logic. Run SQL seeds to install base providers.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Placeholder for other tabs (Security, Notifications, etc.) */}
                    {["security", "notifications", "system"].includes(activeTab) && (
                        <Card className="border-none glass futuristic-card p-12 flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 border border-white">
                                <Settings className="h-10 w-10 text-slate-300 animate-spin-slow" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Module Offline</h3>
                            <p className="text-slate-500 font-medium max-w-sm">
                                The {activeTab} routing module is awaiting kernel update. Check the orchestrator for deployment status.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
