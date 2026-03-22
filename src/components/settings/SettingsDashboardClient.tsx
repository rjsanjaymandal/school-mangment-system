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
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Infrastructure Config
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Institutional Core Architecture & System Protocol
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
                            className={`w-full flex items-center gap-x-3 px-5 py-4 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id
                                ? "bg-primary text-primary-foreground shadow-2xl emerald-glow italic scale-[1.02]"
                                : "text-foreground/40 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === "identity" && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                            <CardHeader className="bg-primary/10 border-b border-primary/20 flex flex-row items-center justify-between space-y-0 p-6">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                    <Globe className="h-4 w-4" />
                                    Institutional Alias & Signature
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('identity', ['school_name', 'contact_email', 'contact_phone', 'school_address', 'logo_url'])}
                                    disabled={isSaving}
                                    className="rounded-sm bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-x-2 emerald-glow px-6 py-5 h-auto shadow-xl"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Commit Changes
                                </Button>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Entity Designation</Label>
                                        <Input
                                            value={settings.school_name || ""}
                                            onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Primary Liaison (Email)</Label>
                                        <Input
                                            value={settings.contact_email || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Telemetric Link (Phone)</Label>
                                        <Input
                                            value={settings.contact_phone || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Geographical Coordinates (Address)</Label>
                                        <Input
                                            value={settings.school_address || ""}
                                            onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Visual Asset Identifier (Logo URL)</Label>
                                        <Input
                                            value={settings.logo_url || ""}
                                            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold placeholder:text-foreground/10"
                                            placeholder="https://institutional-assets.io/signature.png"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "academic" && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                            <CardHeader className="bg-primary/10 border-b border-primary/20 flex flex-row items-center justify-between space-y-0 p-6">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                    <GraduationCap className="h-4 w-4" />
                                    Temporal Protocol Configuration
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('academic', ['current_academic_year_id', 'result_visibility'])}
                                    disabled={isSaving}
                                    className="rounded-sm bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-x-2 emerald-glow px-6 py-5 h-auto shadow-xl"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Sync Cycle
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Active Temporal Matrix (Academic Year)</Label>
                                        <Select
                                            value={settings.current_academic_year_id || ""}
                                            onValueChange={(val) => setSettings({ ...settings, current_academic_year_id: val })}
                                        >
                                            <SelectTrigger className="h-12 rounded-sm bg-background/50 border-border font-bold uppercase tracking-tight">
                                                <SelectValue placeholder="Select active session" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-background border-border rounded-sm">
                                                {academicYears.map(year => (
                                                    <SelectItem key={year.id} value={year.id} className="font-bold uppercase text-[10px] hover:bg-primary/10 hover:text-primary transition-all">{year.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[9px] text-foreground/40 font-black uppercase tracking-widest mt-2 italic">Master temporal reference for all Registry Nodes and grading sequences.</p>
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-primary/5 rounded-sm border border-primary/20 backdrop-blur-md shadow-inner">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-black text-foreground uppercase tracking-widest">Publish Diagnostic Results</Label>
                                            <p className="text-[9px] text-foreground/40 font-black uppercase tracking-widest italic">Broadcast academic telemetry to Guardian and Student nodes.</p>
                                        </div>
                                        <Switch
                                            checked={settings.result_visibility === "true"}
                                            onCheckedChange={(checked) => setSettings({ ...settings, result_visibility: checked ? "true" : "false" })}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "financial" && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                            <CardHeader className="bg-primary/10 border-b border-primary/20 flex flex-row items-center justify-between space-y-0 p-6">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                    <Banknote className="h-4 w-4" />
                                    Economic & Fee Protocols
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('finance', ['currency', 'currency_symbol', 'late_fee_per_day', 'tax_label', 'tax_rate'])}
                                    disabled={isSaving}
                                    className="rounded-sm bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-x-2 emerald-glow px-6 py-5 h-auto shadow-xl"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Update Ledger
                                </Button>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Global Currency Protocol</Label>
                                        <Input
                                            value={settings.currency || ""}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                            placeholder="USD"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Symbolic Denominator</Label>
                                        <Input
                                            value={settings.currency_symbol || ""}
                                            onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                            placeholder="$"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Arrears Increment (Per Cycle/Day)</Label>
                                        <Input
                                            type="number"
                                            value={settings.late_fee_per_day || ""}
                                            onChange={(e) => setSettings({ ...settings, late_fee_per_day: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Fiscal Levy Label (Tax/VAT)</Label>
                                        <Input
                                            value={settings.tax_label || "VAT"}
                                            onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Fiscal Percentage (%)</Label>
                                        <Input
                                            type="number"
                                            value={settings.tax_rate || "0"}
                                            onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "gateways" && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                            <CardHeader className="bg-primary/10 border-b border-primary/20 p-6">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                    <CreditCard className="h-4 w-4" />
                                    Secure Gateway Infrastructure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-primary/10">
                                    {gateways.length > 0 ? gateways.map((gateway) => (
                                        <div key={gateway.id} className="p-8 flex items-center justify-between hover:bg-primary/5 transition-all group">
                                            <div className="flex items-center gap-x-6">
                                                <div className={`h-14 w-14 rounded-sm border flex items-center justify-center transition-all ${gateway.is_active ? 'bg-primary text-primary-foreground emerald-glow shadow-xl' : 'bg-background border-border text-foreground/20'}`}>
                                                    <CreditCard className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground text-xl uppercase tracking-tighter italic italic group-hover:text-primary transition-colors">{gateway.name}</h4>
                                                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mt-1">
                                                        Protocol: {gateway.provider.toUpperCase()} • <span className={gateway.is_active ? "text-primary italic animate-pulse" : ""}>{gateway.is_active ? 'Routing Operational' : 'Offline'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-6">
                                                <Badge variant="outline" className={cn("text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-sm border-2", gateway.is_active ? "text-primary border-primary emerald-glow bg-primary/10" : "text-foreground/20 border-border bg-background")}>
                                                    {gateway.is_active ? "OPERATIONAL" : "DORMANT"}
                                                </Badge>
                                                <Switch
                                                    checked={gateway.is_active}
                                                    onCheckedChange={() => handleToggleGateway(gateway.id, gateway.is_active)}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-16 text-center text-foreground/20 font-black uppercase tracking-[0.3em] italic">
                                            No Gateway Nodes Detected.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "communication" && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                            <CardHeader className="bg-primary/10 border-b border-primary/20 flex flex-row items-center justify-between space-y-0 p-6">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                    <Mail className="h-4 w-4" />
                                    Telemetric Broadcast Channels
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('communication', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'])}
                                    disabled={isSaving}
                                    className="rounded-sm bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-x-2 emerald-glow px-6 py-5 h-auto shadow-xl"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Commit Sync
                                </Button>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">SMTP Outbound Node (Host)</Label>
                                        <Input
                                            value={settings.smtp_host || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                            placeholder="smtp.institutional-relay.io"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Relay Port</Label>
                                        <Input
                                            value={settings.smtp_port || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                            placeholder="587"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Node Credentials (User)</Label>
                                        <Input
                                            value={settings.smtp_user || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold placeholder:text-foreground/10"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                            <CardHeader className="bg-primary/10 border-b border-primary/20 flex flex-row items-center justify-between space-y-0 p-6">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                    <ShieldCheck className="h-4 w-4" />
                                    Secure Perimeter & Access Policy
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveSettings('security', ['session_timeout', 'password_complexity'])}
                                    disabled={isSaving}
                                    className="rounded-sm bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-x-2 emerald-glow px-6 py-5 h-auto shadow-xl"
                                >
                                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Commence Lockdown
                                </Button>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Active Session Duration (Minutes)</Label>
                                        <Input
                                            type="number"
                                            value={settings.session_timeout || "60"}
                                            onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                                            className="bg-background/50 border-border h-12 rounded-sm font-bold uppercase tracking-tight"
                                        />
                                        <p className="text-[9px] text-foreground/40 font-black uppercase tracking-widest mt-2 italic">Automatic termination of Identity Matrix sessions after inactivity.</p>
                                    </div>
                                    <div className="flex items-center justify-between p-8 bg-primary/5 rounded-sm border border-primary/20 backdrop-blur-md shadow-inner">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black text-foreground uppercase tracking-widest">Mandatory Entropy Protocol</Label>
                                            <p className="text-[9px] text-foreground/40 font-black uppercase tracking-widest italic">Enforce complex alphanumeric sequences for all Registry Access.</p>
                                        </div>
                                        <Switch
                                            checked={settings.password_complexity === "true"}
                                            onCheckedChange={(checked) => setSettings({ ...settings, password_complexity: checked ? "true" : "false" })}
                                            className="data-[state=checked]:bg-primary"
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

