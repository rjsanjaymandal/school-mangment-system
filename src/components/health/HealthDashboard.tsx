"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Heart, Plus, User, Stethoscope, HeartPulse, History, ShieldAlert } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createInfirmaryLog, updateInfirmaryStatus, upsertHealthProfile } from "@/app/actions/health";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#f43f5e", "#fbbf24", "#3b82f6", "#10b981", "#8b5cf6"];

interface HealthDashboardProps {
    infirmaryLogs: any[];
    healthProfiles: any[];
    students: any[];
    userRole?: string | null;
}

const joinList = (value?: string[]) => (value || []).join(", ");
const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function HealthDashboard({ infirmaryLogs, healthProfiles, students, userRole }: HealthDashboardProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logForm, setLogForm] = useState({ student_id: "", visit_reason: "", symptoms: "", treatment_provided: "", medication_given: "", temperature: "" });
    const [profileForm, setProfileForm] = useState({ student_id: "", blood_group: "", allergies: "", chronic_conditions: "", medications: "", emergency_contact_name: "", emergency_contact_phone: "", insurance_number: "" });

    const profileLookup = useMemo(() => Object.fromEntries(healthProfiles.map((profile) => [profile.id, profile])), [healthProfiles]);
    const activeVisits = infirmaryLogs.filter((log) => log.status === "under_observation");

    const telemetry = useMemo(() => {
        const baseline = Object.fromEntries(MONTHS.map((month) => [month, { name: month, visits: 0 }]));
        infirmaryLogs.forEach((log) => {
            const date = log.created_at || log.check_in_time;
            if (!date) return;
            const month = new Date(date).toLocaleDateString("en-US", { month: "short" });
            if (baseline[month]) baseline[month].visits += 1;
        });
        return MONTHS.map((month) => baseline[month]);
    }, [infirmaryLogs]);

    const ailmentData = useMemo(() => {
        const counts: Record<string, number> = {};
        infirmaryLogs.forEach((log) => {
            const key = log.visit_reason || "Unspecified";
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
    }, [infirmaryLogs]);

    const resetProfileForm = () => setProfileForm({ student_id: "", blood_group: "", allergies: "", chronic_conditions: "", medications: "", emergency_contact_name: "", emergency_contact_phone: "", insurance_number: "" });

    const handleOpenProfile = (studentId: string) => {
        const profile = profileLookup[studentId];
        setProfileForm({
            student_id: studentId,
            blood_group: profile?.blood_group || "",
            allergies: joinList(profile?.allergies),
            chronic_conditions: joinList(profile?.chronic_conditions),
            medications: joinList(profile?.medications),
            emergency_contact_name: profile?.emergency_contact_name || "",
            emergency_contact_phone: profile?.emergency_contact_phone || "",
            insurance_number: profile?.insurance_number || "",
        });
        setIsProfileOpen(true);
    };

    const handleCreateLog = async () => {
        if (!logForm.student_id || !logForm.visit_reason) return toast.error("Student and visit reason are required.");
        setLoading(true);
        const result = await createInfirmaryLog({ ...logForm, temperature: logForm.temperature ? parseFloat(logForm.temperature) : undefined });
        setLoading(false);
        if (!result.success) return toast.error(result.error || "Failed to record visit");
        setIsLogOpen(false);
        setLogForm({ student_id: "", visit_reason: "", symptoms: "", treatment_provided: "", medication_given: "", temperature: "" });
        toast.success("Infirmary visit recorded");
        router.refresh();
    };

    const handleSaveProfile = async () => {
        if (!profileForm.student_id) return toast.error("Please select a student.");
        setLoading(true);
        const result = await upsertHealthProfile(profileForm.student_id, {
            blood_group: profileForm.blood_group || undefined,
            allergies: splitList(profileForm.allergies),
            chronic_conditions: splitList(profileForm.chronic_conditions),
            medications: splitList(profileForm.medications),
            emergency_contact_name: profileForm.emergency_contact_name || undefined,
            emergency_contact_phone: profileForm.emergency_contact_phone || undefined,
            insurance_number: profileForm.insurance_number || undefined,
        });
        setLoading(false);
        if (!result.success) return toast.error(result.error || "Failed to save health profile");
        setIsProfileOpen(false);
        toast.success("Health profile saved");
        router.refresh();
    };

    const handleStatusChange = async (id: string, status: "discharged" | "referral") => {
        setLoading(true);
        const result = await updateInfirmaryStatus(id, status);
        setLoading(false);
        if (!result.success) return toast.error(result.error || "Failed to update visit status");
        toast.success(`Visit marked as ${status}`);
        router.refresh();
    };

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3">
                <DashboardStatCard 
                    title="Total Medical Visits"
                    value={infirmaryLogs.length}
                    icon={Activity}
                    color="blue"
                    description="Total recorded visits"
                />
                <DashboardStatCard 
                    title="Under Observation"
                    value={activeVisits.length}
                    icon={ShieldAlert}
                    color="rose"
                    description="Current active cases"
                />
                <DashboardStatCard 
                    title="Health Profiles"
                    value={healthProfiles.length}
                    icon={HeartPulse}
                    color="emerald"
                    description="Student medical records"
                />
            </div>

            {/* Diagnostics Overview */}
            <div className="grid md:grid-cols-12 gap-8">
                <ERPCard 
                    title="Visit Trends" 
                    description="Visits frequency over the academic year"
                    accentColor="indigo" 
                    icon={<History className="h-4 w-4" />}
                    className="md:col-span-8 glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                >
                    <div className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={telemetry}>
                                <defs>
                                    <linearGradient id="health-visits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                                />
                                <Area type="monotone" dataKey="visits" stroke="#f43f5e" fill="url(#health-visits)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ERPCard>

                <ERPCard 
                    title="Ailment Distribution" 
                    description="Categorical diagnosis breakdown"
                    accentColor="amber" 
                    icon={<Activity className="h-4 w-4" />}
                    className="md:col-span-4 glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                >
                    <div className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={ailmentData} 
                                    dataKey="value" 
                                    innerRadius={70} 
                                    outerRadius={95}
                                    paddingAngle={5}
                                >
                                    {ailmentData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} className="stroke-white stroke-2" />)}
                                </Pie>
                                <Tooltip />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    formatter={(v) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{v}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ERPCard>
            </div>

            {/* Infirmary Records */}
            <ERPCard 
                title="Recent Medical Visits" 
                description="Latest student visits to the infirmary"
                accentColor="rose" 
                icon={<HeartPulse className="h-4 w-4" />}
                className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto -mx-4 -mb-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-y border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Reason / Diagnosis</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Vitals</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {infirmaryLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <Heart className="h-12 w-12" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero medical incidents recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                infirmaryLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                                    <User className="h-5 w-5 text-slate-400 group-hover:text-rose-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900">{log.student?.profile?.first_name} {log.student?.profile?.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.student?.admission_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px]">
                                                <p className="font-bold text-slate-700">{log.visit_reason}</p>
                                                <p className="text-[10px] text-slate-400 line-clamp-1">{log.symptoms || "No secondary symptoms recorded"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-3 w-3 text-rose-400" />
                                                <span className="font-black text-slate-600">{log.temperature ? `${log.temperature}°F` : "--"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={cn(
                                                "rounded-lg px-2 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                                                log.status === "under_observation" ? "bg-rose-500 text-white shadow-rose-200" :
                                                log.status === "discharged" ? "bg-emerald-500 text-white shadow-emerald-200" :
                                                "bg-amber-500 text-white shadow-amber-200"
                                            )}>
                                                {log.status?.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isAdminOrTeacher && log.status === "under_observation" && (
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(log.id, "referral")} className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200">Referral</Button>
                                                    <Button size="sm" onClick={() => handleStatusChange(log.id, "discharged")} className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest border-none">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Discharge
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ERPCard>

            {/* Medical Dossiers */}
            <ERPCard 
                title="Preserved Medical Dossiers" 
                description="Long-term health profiles and critical metadata"
                accentColor="emerald" 
                icon={<Stethoscope className="h-4 w-4" />}
                className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
            >
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {students.slice(0, 9).map((student) => {
                        const profile = profileLookup[student.id];
                        return (
                            <div key={student.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                                <div className="flex items-start justify-between gap-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{student.profile?.full_name || student.admission_number}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.admission_number}</p>
                                        </div>
                                    </div>
                                    {isAdminOrTeacher && (
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenProfile(student.id)} className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Blood Group</span>
                                        <Badge variant="outline" className="rounded-md font-black text-[10px] text-rose-600 bg-rose-50 border-rose-100">{profile?.blood_group || "N/A"}</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Critical Allergies</span>
                                        <p className="text-xs font-bold text-slate-600 line-clamp-1">{profile?.allergies?.join(", ") || "No known allergies"}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900/5 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldAlert className="h-3 w-3 text-amber-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Emergency Protocol</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-700">{profile?.emergency_contact_name || "Emergency Contact Missing"}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{profile?.emergency_contact_phone || "No terminal phone recorded"}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600">
                        View Complete Medical Registry
                    </Button>
                </div>
            </ERPCard>

            {/* Modals are preserved below with original logic */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader><DialogTitle className="font-black uppercase tracking-widest text-sm">Health Profile Synchronization</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Target</Label>
                            <Select value={profileForm.student_id} onValueChange={handleOpenProfile}>
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue placeholder="Select student dossier" /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">{students.map((student) => <SelectItem key={student.id} value={student.id} className="font-bold">{student.profile?.full_name || student.admission_number}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Blood Group</Label><Input value={profileForm.blood_group} onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-none" /></div>
                            <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Insurance Identifier</Label><Input value={profileForm.insurance_number} onChange={(e) => setProfileForm({ ...profileForm, insurance_number: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-none" /></div>
                        </div>
                        <Button onClick={handleSaveProfile} disabled={loading} className="h-12 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-black">{loading ? "Synchronizing..." : "Commit Profile Changes"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                <DialogContent className="max-w-xl rounded-2xl">
                    <DialogHeader><DialogTitle className="font-black uppercase tracking-widest text-sm">New Infirmary Log Entry</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Entry</Label>
                            <Select value={logForm.student_id} onValueChange={(value) => setLogForm({ ...logForm, student_id: value })}>
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue placeholder="Identify student" /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">{students.map((student) => <SelectItem key={student.id} value={student.id} className="font-bold">{student.profile?.full_name || student.admission_number}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Reason</Label><Input value={logForm.visit_reason} onChange={(e) => setLogForm({ ...logForm, visit_reason: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-none" /></div>
                        <Button onClick={handleCreateLog} disabled={loading} className="h-12 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-black">{loading ? "Processing Log..." : "Finalize Visit Entry"}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}