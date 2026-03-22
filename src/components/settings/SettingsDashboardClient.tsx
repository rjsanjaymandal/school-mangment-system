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
    GraduationCap,
    Banknote,
    Mail,
    ShieldCheck,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateSettings } from "@/app/actions/settings";
import { updateGatewayStatus } from "@/app/actions/gateways";
import { toast } from "sonner";

export default function SettingsDashboardClient({
    initialSettings,
    initialGateways,
    academicYears,
}: {
    initialSettings: any;
    initialGateways: any[];
    academicYears: any[];
}) {
    const [activeTab, setActiveTab] = useState("identity");
    const [settings, setSettings] = useState(initialSettings);
    const [gateways, setGateways] = useState(initialGateways || []);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveSettings = async (category: string, keys: string[]) => {
        setIsSaving(true);
        const settingsToSave: Record<string, string> = {};
        keys.forEach(key => {
            settingsToSave[key] = settings[key] || "";
        });

        const result = await updateSettings(settingsToSave, category);
        setIsSaving(false);

        if (result.success) {
            toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings updated`);
        } else {
            toast.error(result.error);
        }
    };

    const handleToggleGateway = async (id: string, currentStatus: boolean) => {
        const result = await updateGatewayStatus(id, !currentStatus);
        if (result.success) {
            setGateways(gateways.map(g => g.id === id ? { ...g, is_active: !currentStatus } : g));
            toast.success("Gateway status updated");
        } else {
            toast.error(result.error);
        }
    };

    const tabs = [
        { id: "identity", label: "Identity", icon: Building2 },
        { id: "academic", label: "Academic", icon: GraduationCap },
        { id: "financial", label: "Financial", icon: Banknote },
        { id: "gateways", label: "Payment Gateways", icon: CreditCard },
        { id: "communication", label: "Communication", icon: Mail },
        { id: "security", label: "Security & Policy", icon: ShieldCheck },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground">
                        System Settings
                    </h2>
                    <p className="text-muted-foreground font-medium tracking-tight">
                        Configure your institution's core infrastructure and behavior
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-card text-white shadow-lg neon-blue"
                                : "text-muted-foreground hover:bg-slate-100/50 hover:text-foreground"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === "identity" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-card text-white flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <Globe className="h-4 w-4 text-blue-400" />
                                    Institutional Identity
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('identity', ['school_name', 'contact_email', 'contact_phone', 'school_address', 'logo_url'])}
                                    disabled={isSaving}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold gap-x-2"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Save Changes
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Institution Name</Label>
                                        <Input
                                            value={settings.school_name || ""}
                                            onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Contact Email</Label>
                                        <Input
                                            value={settings.contact_email || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Contact Phone</Label>
                                        <Input
                                            value={settings.contact_phone || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Address</Label>
                                        <Input
                                            value={settings.school_address || ""}
                                            onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Logo URL</Label>
                                        <Input
                                            value={settings.logo_url || ""}
                                            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "academic" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-card text-white flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <GraduationCap className="h-4 w-4 text-purple-400" />
                                    Academic Configuration
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('academic', ['current_academic_year_id', 'result_visibility'])}
                                    disabled={isSaving}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold gap-x-2"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Save Changes
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Current Academic Session</Label>
                                        <Select
                                            value={settings.current_academic_year_id || ""}
                                            onValueChange={(val) => setSettings({ ...settings, current_academic_year_id: val })}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl bg-slate-50/50">
                                                <SelectValue placeholder="Select active session" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map(year => (
                                                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-muted-foreground font-medium">This will be the default session for all new enrollments and grading.</p>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold text-foreground">Publish Exam Results</Label>
                                            <p className="text-xs text-muted-foreground">Enable to allow parents and students to view results.</p>
                                        </div>
                                        <Switch
                                            checked={settings.result_visibility === "true"}
                                            onCheckedChange={(checked) => setSettings({ ...settings, result_visibility: checked ? "true" : "false" })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "financial" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-card text-white flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <Banknote className="h-4 w-4 text-emerald-400" />
                                    Financial & Fees
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('finance', ['currency', 'currency_symbol', 'late_fee_per_day', 'tax_label', 'tax_rate'])}
                                    disabled={isSaving}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold gap-x-2"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Save Changes
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Currency Code</Label>
                                        <Input
                                            value={settings.currency || ""}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                            placeholder="USD"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Currency Symbol</Label>
                                        <Input
                                            value={settings.currency_symbol || ""}
                                            onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                            placeholder="$"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Late Fee (Per Day)</Label>
                                        <Input
                                            type="number"
                                            value={settings.late_fee_per_day || ""}
                                            onChange={(e) => setSettings({ ...settings, late_fee_per_day: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Tax/VAT Label</Label>
                                        <Input
                                            value={settings.tax_label || "VAT"}
                                            onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Tax/VAT Percentage (%)</Label>
                                        <Input
                                            type="number"
                                            value={settings.tax_rate || "0"}
                                            onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "gateways" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-card text-white">
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
                                                <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${gateway.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-border text-muted-foreground'}`}>
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground text-lg">{gateway.name}</h4>
                                                    <p className="text-xs text-muted-foreground font-medium">Provider: {gateway.provider.toUpperCase()} • {gateway.is_active ? 'Accepting Live Routing' : 'Offline'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-4">
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-black tracking-widest", gateway.is_active ? "text-emerald-500 bg-emerald-50 border-emerald-200" : "text-muted-foreground bg-slate-50 border-border")}>
                                                    {gateway.is_active ? "ACTIVE" : "DISABLED"}
                                                </Badge>
                                                <Switch
                                                    checked={gateway.is_active}
                                                    onCheckedChange={() => handleToggleGateway(gateway.id, gateway.is_active)}
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-12 text-center text-muted-foreground font-medium">
                                            No payment gateways detected.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "communication" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-card text-white flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <Mail className="h-4 w-4 text-yellow-400" />
                                    Email & SMS
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('communication', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'])}
                                    disabled={isSaving}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold gap-x-2"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Save Changes
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">SMTP Host</Label>
                                        <Input
                                            value={settings.smtp_host || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">SMTP Port</Label>
                                        <Input
                                            value={settings.smtp_port || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                            placeholder="587"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">SMTP User</Label>
                                        <Input
                                            value={settings.smtp_user || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card className="border-none glass futuristic-card overflow-hidden">
                            <CardHeader className="bg-card text-white flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                    <ShieldCheck className="h-4 w-4 text-red-400" />
                                    Security & System Policy
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('security', ['session_timeout', 'password_complexity'])}
                                    disabled={isSaving}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold gap-x-2"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Save Changes
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-muted-foreground">Session Timeout (Minutes)</Label>
                                        <Input
                                            type="number"
                                            value={settings.session_timeout || "60"}
                                            onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                                            className="bg-slate-50/50 border-border h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold text-foreground">Enforce Strong Passwords</Label>
                                            <p className="text-xs text-muted-foreground">Require uppercase, numbers, and symbols.</p>
                                        </div>
                                        <Switch
                                            checked={settings.password_complexity === "true"}
                                            onCheckedChange={(checked) => setSettings({ ...settings, password_complexity: checked ? "true" : "false" })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

