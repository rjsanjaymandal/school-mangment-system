"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Heart, Plus, User, Stethoscope, HeartPulse, History, ShieldAlert, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createInfirmaryLog, updateInfirmaryStatus, upsertHealthProfile } from "@/app/actions/health";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { Input } from "@/components/ui/input";
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
        <div className="space-y-8 animate-in fade-in duration-700">
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

            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 rounded bg-indigo-50 text-indigo-600">
                                <History className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Visit Trends</h3>
                                <p className="text-[10px] text-slate-500">Visits frequency over the academic year</p>
                            </div>
                        </div>
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
                    </div>
                </div>

                <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 rounded bg-amber-50 text-amber-600">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Ailment Distribution</h3>
                                <p className="text-[10px] text-slate-500">Categorical diagnosis breakdown</p>
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-1.5 rounded bg-rose-50 text-rose-600">
                            <HeartPulse className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Recent Medical Visits</h3>
                            <p className="text-[10px] text-slate-500">Latest student visits to the infirmary</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-y border-slate-100">
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reason / Diagnosis</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vitals</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</span></th>
                                    <th className="px-6 py-4 text-right"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {infirmaryLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Heart className="h-12 w-12 text-slate-200" />
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero medical incidents recorded</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    infirmaryLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{log.student?.profile?.first_name} {log.student?.profile?.last_name}</p>
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
                                                    <span className="font-black text-slate-600">{log.temperature ? `${log.temperature}\u00b0F` : "--"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white",
                                                    log.status === "under_observation" ? "bg-rose-500" :
                                                    log.status === "discharged" ? "bg-emerald-500" : "bg-amber-500"
                                                )}>
                                                    {log.status?.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isAdminOrTeacher && log.status === "under_observation" && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleStatusChange(log.id, "referral")} className="h-8 rounded-lg border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all">Referral</button>
                                                        <button onClick={() => handleStatusChange(log.id, "discharged")} className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest px-3 shadow-lg transition-all flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> Discharge
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                            <Stethoscope className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Preserved Medical Dossiers</h3>
                            <p className="text-[10px] text-slate-500">Long-term health profiles and critical metadata</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {students.slice(0, 9).map((student: any) => {
                            const profile = profileLookup[student.id];
                            return (
                                <div key={student.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-start justify-between gap-3 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{student.profile?.full_name || student.admission_number}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.admission_number}</p>
                                            </div>
                                        </div>
                                        {isAdminOrTeacher && (
                                            <button onClick={() => handleOpenProfile(student.id)} className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 inline-flex items-center justify-center">
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Blood Group</span>
                                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600">{profile?.blood_group || "N/A"}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Critical Allergies</span>
                                            <p className="text-xs font-bold text-slate-600 line-clamp-1">{profile?.allergies?.join(", ") || "No known allergies"}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
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
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 h-10 px-6">
                            View Complete Medical Registry
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Health Profile Synchronization</h2>
                            <button onClick={() => setIsProfileOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Student Target</label>
                                <select
                                    className="w-full h-12 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 bg-white focus:border-blue-300 outline-none"
                                    value={profileForm.student_id}
                                    onChange={(e) => handleOpenProfile(e.target.value)}
                                >
                                    <option value="">Select student dossier</option>
                                    {students.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.profile?.full_name || s.admission_number}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Blood Group</label>
                                    <Input value={profileForm.blood_group} onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })} className="h-11 rounded-xl border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Insurance Identifier</label>
                                    <Input value={profileForm.insurance_number} onChange={(e) => setProfileForm({ ...profileForm, insurance_number: e.target.value })} className="h-11 rounded-xl border-slate-200" />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? "Synchronizing..." : "Commit Profile Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Modal */}
            {isLogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">New Infirmary Log Entry</h2>
                            <button onClick={() => setIsLogOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Student Entry</label>
                                <select
                                    className="w-full h-12 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 bg-white focus:border-blue-300 outline-none"
                                    value={logForm.student_id}
                                    onChange={(e) => setLogForm({ ...logForm, student_id: e.target.value })}
                                >
                                    <option value="">Identify student</option>
                                    {students.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.profile?.full_name || s.admission_number}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Primary Reason</label>
                                <Input value={logForm.visit_reason} onChange={(e) => setLogForm({ ...logForm, visit_reason: e.target.value })} className="h-11 rounded-xl border-slate-200" />
                            </div>
                            <button
                                onClick={handleCreateLog}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? "Processing Log..." : "Finalize Visit Entry"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}