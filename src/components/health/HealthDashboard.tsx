"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Heart, Plus, User } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createInfirmaryLog, updateInfirmaryStatus, upsertHealthProfile } from "@/app/actions/health";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Health Dashboard</h2>
                    <p className="text-sm text-slate-500">Medical records and health profiles</p>
                </div>
                {isAdminOrTeacher && (
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="px-3 py-1.5 border-red-200 text-red-600 bg-red-50 gap-x-2">
                            <AlertTriangle className="h-3 w-3" /> {activeVisits.length} Active Visits
                        </Badge>
                        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                            <DialogTrigger asChild><Button variant="outline" onClick={resetProfileForm} className="rounded-md">Manage Profile</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Health Profile</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Student</Label>
                                        <Select value={profileForm.student_id} onValueChange={handleOpenProfile}>
                                            <SelectTrigger className="rounded-md"><SelectValue placeholder="Select student" /></SelectTrigger>
                                            <SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.profile?.full_name || student.admission_number}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Blood Group</Label><Input value={profileForm.blood_group} onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })} className="rounded-md" /></div>
                                        <div className="space-y-2"><Label>Insurance Number</Label><Input value={profileForm.insurance_number} onChange={(e) => setProfileForm({ ...profileForm, insurance_number: e.target.value })} className="rounded-md" /></div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label>Allergies</Label><Textarea value={profileForm.allergies} onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })} className="rounded-md" /></div>
                                        <div className="space-y-2"><Label>Chronic Conditions</Label><Textarea value={profileForm.chronic_conditions} onChange={(e) => setProfileForm({ ...profileForm, chronic_conditions: e.target.value })} className="rounded-md" /></div>
                                        <div className="space-y-2"><Label>Medications</Label><Textarea value={profileForm.medications} onChange={(e) => setProfileForm({ ...profileForm, medications: e.target.value })} className="rounded-md" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Emergency Contact</Label><Input value={profileForm.emergency_contact_name} onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })} className="rounded-md" /></div>
                                        <div className="space-y-2"><Label>Emergency Phone</Label><Input value={profileForm.emergency_contact_phone} onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })} className="rounded-md" /></div>
                                    </div>
                                    <Button onClick={handleSaveProfile} disabled={loading} className="rounded-md bg-emerald-600 hover:bg-emerald-700">{loading ? "Saving..." : "Save Profile"}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                            <DialogTrigger asChild><Button className="rounded-md bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2" /> Record Visit</Button></DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader><DialogTitle>Infirmary Visit</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Student</Label>
                                        <Select value={logForm.student_id} onValueChange={(value) => setLogForm({ ...logForm, student_id: value })}>
                                            <SelectTrigger className="rounded-md"><SelectValue placeholder="Select student" /></SelectTrigger>
                                            <SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.profile?.full_name || student.admission_number}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label>Reason</Label><Input value={logForm.visit_reason} onChange={(e) => setLogForm({ ...logForm, visit_reason: e.target.value })} className="rounded-md" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Symptoms</Label><Textarea value={logForm.symptoms} onChange={(e) => setLogForm({ ...logForm, symptoms: e.target.value })} className="rounded-md" /></div>
                                        <div className="space-y-2"><Label>Temperature (deg F)</Label><Input type="number" step="0.1" value={logForm.temperature} onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })} className="rounded-md" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Treatment</Label><Textarea value={logForm.treatment_provided} onChange={(e) => setLogForm({ ...logForm, treatment_provided: e.target.value })} className="rounded-md" /></div>
                                        <div className="space-y-2"><Label>Medication</Label><Textarea value={logForm.medication_given} onChange={(e) => setLogForm({ ...logForm, medication_given: e.target.value })} className="rounded-md" /></div>
                                    </div>
                                    <Button onClick={handleCreateLog} disabled={loading} className="rounded-md bg-emerald-600 hover:bg-emerald-700">{loading ? "Recording..." : "Record Visit"}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Total Visits</p>
                        <h3 className="text-2xl font-bold mt-1">{infirmaryLogs.length}</h3>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Under Observation</p>
                        <h3 className="text-2xl font-bold mt-1 text-red-600">{activeVisits.length}</h3>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500">Health Profiles</p>
                        <h3 className="text-2xl font-bold mt-1">{healthProfiles.length}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-12 gap-6">
                <Card className="md:col-span-7 border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="pb-2 border-b bg-slate-50/50">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-600" />
                            Monthly Visits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry}>
                                    <defs>
                                        <linearGradient id="health-visits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="visits" stroke="#ef4444" fill="url(#health-visits)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-5 border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="pb-2 border-b bg-slate-50/50">
                        <CardTitle className="text-base">Ailment Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={ailmentData} dataKey="value" innerRadius={60} outerRadius={90}>
                                        {ailmentData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base">Infirmary Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Student</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Reason</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Temperature</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {infirmaryLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-slate-500">No infirmary visits recorded yet.</td>
                                    </tr>
                                ) : (
                                    infirmaryLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{log.student?.profile?.first_name} {log.student?.profile?.last_name}</p>
                                                        <p className="text-xs text-slate-500">{log.student?.admission_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{log.visit_reason}</td>
                                            <td className="px-4 py-3 text-slate-600">{log.temperature ? `${log.temperature}°F` : "-"}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={cn(
                                                    log.status === "under_observation" ? "border-red-200 text-red-600 bg-red-50" :
                                                    log.status === "discharged" ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                                                    "border-amber-200 text-amber-600 bg-amber-50"
                                                )}>
                                                    {log.status?.replace("_", " ")}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isAdminOrTeacher && log.status === "under_observation" && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(log.id, "referral")} className="h-8">Referral</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(log.id, "discharged")} className="h-8">
                                                            <CheckCircle className="h-4 w-4 mr-1" /> Discharge
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
                </CardContent>
            </Card>

            {/* Health Profiles */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Health Profiles</CardTitle>
                        {isAdminOrTeacher && <Button variant="outline" size="sm" onClick={() => setIsProfileOpen(true)} className="rounded-md"><Plus className="h-4 w-4 mr-2" /> Add Profile</Button>}
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {students.slice(0, 9).map((student) => {
                            const profile = profileLookup[student.id];
                            return (
                                <Card key={student.id} className="p-4 border border-slate-200">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{student.profile?.full_name || student.admission_number}</p>
                                                <p className="text-xs text-slate-500">{student.admission_number}</p>
                                            </div>
                                        </div>
                                        {isAdminOrTeacher && <Button variant="ghost" size="sm" onClick={() => handleOpenProfile(student.id)} className="h-8">{profile ? "Edit" : "Create"}</Button>}
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm">
                                        <p><span className="text-slate-500">Blood group:</span> {profile?.blood_group || "Not recorded"}</p>
                                        <p><span className="text-slate-500">Allergies:</span> {profile?.allergies?.join(", ") || "None recorded"}</p>
                                        <p><span className="text-slate-500">Emergency:</span> {profile?.emergency_contact_name ? `${profile.emergency_contact_name} • ${profile.emergency_contact_phone || "No phone"}` : "Not recorded"}</p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}