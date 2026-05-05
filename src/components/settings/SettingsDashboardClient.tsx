"use client";

import { useState } from "react";
import {
    Settings,
    CreditCard,
    Building2,
    Bell,
    Globe,
    Lock,
    Save,
    GraduationCap,
    Banknote,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        { id: "gateways", label: "Gateways", icon: CreditCard },
        { id: "communication", label: "Communication", icon: Mail },
        { id: "security", label: "Security", icon: ShieldCheck },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-1">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all text-left",
                                activeTab === item.id
                                    ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500"
                                    : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-4">
                    {activeTab === "identity" && (
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-emerald-600" />
                                        School Identity
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveSettings('identity', ['school_name', 'contact_email', 'contact_phone', 'school_address', 'logo_url'])}
                                        disabled={isSaving}
                                        className="rounded-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-medium">School Name</Label>
                                        <Input
                                            value={settings.school_name || ""}
                                            onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                                            className="rounded-md"
                                            placeholder="Enter school name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Contact Email</Label>
                                        <Input
                                            type="email"
                                            value={settings.contact_email || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                            className="rounded-md"
                                            placeholder="admin@school.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Contact Phone</Label>
                                        <Input
                                            value={settings.contact_phone || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                            className="rounded-md"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-medium">Address</Label>
                                        <Input
                                            value={settings.school_address || ""}
                                            onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                                            className="rounded-md"
                                            placeholder="School address"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-medium">Logo URL</Label>
                                        <Input
                                            value={settings.logo_url || ""}
                                            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                            className="rounded-md"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "academic" && (
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                                        Academic Settings
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveSettings('academic', ['current_academic_year_id', 'result_visibility'])}
                                        disabled={isSaving}
                                        className="rounded-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Current Academic Year</Label>
                                    <Select
                                        value={settings.current_academic_year_id || ""}
                                        onValueChange={(val) => setSettings({ ...settings, current_academic_year_id: val })}
                                    >
                                        <SelectTrigger className="rounded-md">
                                            <SelectValue placeholder="Select academic year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map(year => (
                                                <SelectItem key={year.id} value={year.id}>
                                                    {year.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-md border">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium">Publish Results</Label>
                                        <p className="text-xs text-slate-500">Allow students and parents to view exam results</p>
                                    </div>
                                    <Switch
                                        checked={settings.result_visibility === "true"}
                                        onCheckedChange={(checked) => setSettings({ ...settings, result_visibility: checked ? "true" : "false" })}
                                        className="data-[state=checked]:bg-emerald-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "financial" && (
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <Banknote className="h-4 w-4 text-emerald-600" />
                                        Financial Settings
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveSettings('finance', ['currency', 'currency_symbol', 'late_fee_per_day', 'tax_label', 'tax_rate'])}
                                        disabled={isSaving}
                                        className="rounded-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Currency Code</Label>
                                        <Input
                                            value={settings.currency || ""}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="rounded-md"
                                            placeholder="INR"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Currency Symbol</Label>
                                        <Input
                                            value={settings.currency_symbol || ""}
                                            onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                                            className="rounded-md"
                                            placeholder="₹"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Late Fee Per Day</Label>
                                        <Input
                                            type="number"
                                            value={settings.late_fee_per_day || ""}
                                            onChange={(e) => setSettings({ ...settings, late_fee_per_day: e.target.value })}
                                            className="rounded-md"
                                            placeholder="10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Tax Label</Label>
                                        <Input
                                            value={settings.tax_label || "VAT"}
                                            onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                                            className="rounded-md"
                                            placeholder="VAT"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Tax Rate (%)</Label>
                                        <Input
                                            type="number"
                                            value={settings.tax_rate || "0"}
                                            onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                                            className="rounded-md"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "gateways" && (
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                    Payment Gateways
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {gateways.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {gateways.map((gateway) => (
                                            <div key={gateway.id} className="py-4 flex items-center justify-between hover:bg-slate-50 rounded-md px-3 -mx-3 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-md flex items-center justify-center",
                                                        gateway.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-slate-900">{gateway.name}</h4>
                                                        <p className="text-sm text-slate-500">
                                                            {gateway.provider} • 
                                                            <span className={gateway.is_active ? "text-emerald-600 ml-1" : "text-slate-400 ml-1"}>
                                                                {gateway.is_active ? "Active" : "Inactive"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={gateway.is_active ? "default" : "secondary"} className={gateway.is_active ? "bg-emerald-100 text-emerald-700" : ""}>
                                                        {gateway.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <Switch
                                                        checked={gateway.is_active}
                                                        onCheckedChange={() => handleToggleGateway(gateway.id, gateway.is_active)}
                                                        className="data-[state=checked]:bg-emerald-600"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        No payment gateways configured
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "communication" && (
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-emerald-600" />
                                        Email Settings (SMTP)
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveSettings('communication', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'])}
                                        disabled={isSaving}
                                        className="rounded-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-medium">SMTP Host</Label>
                                        <Input
                                            value={settings.smtp_host || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                                            className="rounded-md"
                                            placeholder="smtp.example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">SMTP Port</Label>
                                        <Input
                                            value={settings.smtp_port || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                                            className="rounded-md"
                                            placeholder="587"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">SMTP Username</Label>
                                        <Input
                                            value={settings.smtp_user || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                                            className="rounded-md"
                                            placeholder="username"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-medium">SMTP Password</Label>
                                        <Input
                                            type="password"
                                            value={settings.smtp_pass || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                                            className="rounded-md"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        Security Settings
                                    </CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveSettings('security', ['session_timeout', 'password_complexity'])}
                                        disabled={isSaving}
                                        className="rounded-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Session Timeout (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={settings.session_timeout || "60"}
                                        onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                                        className="rounded-md max-w-xs"
                                        placeholder="60"
                                    />
                                    <p className="text-xs text-slate-500">Auto logout after this duration of inactivity</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-md border">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium">Password Complexity</Label>
                                        <p className="text-xs text-slate-500">Enforce strong passwords with letters, numbers & special chars</p>
                                    </div>
                                    <Switch
                                        checked={settings.password_complexity === "true"}
                                        onCheckedChange={(checked) => setSettings({ ...settings, password_complexity: checked ? "true" : "false" })}
                                        className="data-[state=checked]:bg-emerald-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}