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
import { Input } from "@/components/ui/input";
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
        <div className="animate-in fade-in duration-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-1">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                                activeTab === item.id
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-500"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent"
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
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-emerald-600" />
                                        School Identity
                                    </h3>
                                    <button
                                        onClick={() => handleSaveSettings('identity', ['school_name', 'contact_email', 'contact_phone', 'school_address', 'logo_url'])}
                                        disabled={isSaving}
                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2 inline" />
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">School Name</label>
                                        <Input
                                            value={settings.school_name || ""}
                                            onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="Enter school name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Contact Email</label>
                                        <Input
                                            type="email"
                                            value={settings.contact_email || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="admin@school.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Contact Phone</label>
                                        <Input
                                            value={settings.contact_phone || ""}
                                            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Address</label>
                                        <Input
                                            value={settings.school_address || ""}
                                            onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="School address"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Logo URL</label>
                                        <Input
                                            value={settings.logo_url || ""}
                                            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "academic" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                                        Academic Settings
                                    </h3>
                                    <button
                                        onClick={() => handleSaveSettings('academic', ['current_academic_year_id', 'result_visibility'])}
                                        disabled={isSaving}
                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2 inline" />
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Current Academic Year</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={settings.current_academic_year_id || ""}
                                        onChange={(e) => setSettings({ ...settings, current_academic_year_id: e.target.value })}
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select academic year</option>
                                        {academicYears.map((year: any) => (
                                            <option key={year.id} value={year.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{year.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Publish Results</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Allow students and parents to view exam results</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, result_visibility: settings.result_visibility === "true" ? "false" : "true" })}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            settings.result_visibility === "true" ? "bg-emerald-600" : "bg-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.result_visibility === "true" ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "financial" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Banknote className="h-4 w-4 text-emerald-600" />
                                        Financial Settings
                                    </h3>
                                    <button
                                        onClick={() => handleSaveSettings('finance', ['currency', 'currency_symbol', 'late_fee_per_day', 'tax_label', 'tax_rate'])}
                                        disabled={isSaving}
                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2 inline" />
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Currency Code</label>
                                        <Input
                                            value={settings.currency || ""}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="INR"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Currency Symbol</label>
                                        <Input
                                            value={settings.currency_symbol || ""}
                                            onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="₹"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Late Fee Per Day</label>
                                        <Input
                                            type="number"
                                            value={settings.late_fee_per_day || ""}
                                            onChange={(e) => setSettings({ ...settings, late_fee_per_day: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Tax Label</label>
                                        <Input
                                            value={settings.tax_label || "VAT"}
                                            onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="VAT"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Tax Rate (%)</label>
                                        <Input
                                            type="number"
                                            value={settings.tax_rate || "0"}
                                            onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "gateways" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                    Payment Gateways
                                </h3>
                            </div>
                            <div className="p-5">
                                {gateways.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {gateways.map((gateway: any) => (
                                            <div key={gateway.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl px-3 -mx-3 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                                        gateway.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{gateway.name}</h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {gateway.provider} • 
                                                            <span className={gateway.is_active ? "text-emerald-600 ml-1" : "text-slate-400 ml-1"}>
                                                                {gateway.is_active ? "Active" : "Inactive"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                        gateway.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {gateway.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                    <button
                                                        onClick={() => handleToggleGateway(gateway.id, gateway.is_active)}
                                                        className={cn(
                                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                                            gateway.is_active ? "bg-emerald-600" : "bg-slate-300"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                            gateway.is_active ? "translate-x-6" : "translate-x-1"
                                                        )} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        No payment gateways configured
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "communication" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-emerald-600" />
                                        Email Settings (SMTP)
                                    </h3>
                                    <button
                                        onClick={() => handleSaveSettings('communication', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'])}
                                        disabled={isSaving}
                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2 inline" />
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">SMTP Host</label>
                                        <Input
                                            value={settings.smtp_host || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="smtp.example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">SMTP Port</label>
                                        <Input
                                            value={settings.smtp_port || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="587"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">SMTP Username</label>
                                        <Input
                                            value={settings.smtp_user || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="username"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">SMTP Password</label>
                                        <Input
                                            type="password"
                                            value={settings.smtp_pass || ""}
                                            onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        Security Settings
                                    </h3>
                                    <button
                                        onClick={() => handleSaveSettings('security', ['session_timeout', 'password_complexity'])}
                                        disabled={isSaving}
                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4 mr-2 inline" />
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Session Timeout (minutes)</label>
                                    <Input
                                        type="number"
                                        value={settings.session_timeout || "60"}
                                        onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 max-w-xs"
                                        placeholder="60"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Auto logout after this duration of inactivity</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Password Complexity</label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Enforce strong passwords with letters, numbers & special chars</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, password_complexity: settings.password_complexity === "true" ? "false" : "true" })}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            settings.password_complexity === "true" ? "bg-emerald-600" : "bg-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings.password_complexity === "true" ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}