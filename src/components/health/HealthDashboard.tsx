"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Heart, Plus, User } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createInfirmaryLog, updateInfirmaryStatus, upsertHealthProfile } from "@/app/actions/health";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">Medical Infrastructure</h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">Health profiles and infirmary operations</p>
                </div>
                {isAdminOrTeacher && <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="rounded-sm px-4 py-1.5 border-destructive/20 text-destructive bg-destructive/5 gap-x-2 font-black uppercase text-[10px] tracking-widest"><AlertTriangle className="h-3 w-3" /> {activeVisits.length} Active Visits</Badge>
                    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                        <DialogTrigger asChild><Button variant="outline" onClick={resetProfileForm}>Manage Profile</Button></DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader><DialogTitle>Health Profile</DialogTitle></DialogHeader>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Student</Label>
                                    <Select value={profileForm.student_id} onValueChange={handleOpenProfile}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.profile?.full_name || student.admission_number}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Blood Group</Label><Input value={profileForm.blood_group} onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Insurance Number</Label><Input value={profileForm.insurance_number} onChange={(e) => setProfileForm({ ...profileForm, insurance_number: e.target.value })} /></div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Allergies</Label><Textarea value={profileForm.allergies} onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Chronic Conditions</Label><Textarea value={profileForm.chronic_conditions} onChange={(e) => setProfileForm({ ...profileForm, chronic_conditions: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Medications</Label><Textarea value={profileForm.medications} onChange={(e) => setProfileForm({ ...profileForm, medications: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Emergency Contact</Label><Input value={profileForm.emergency_contact_name} onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Emergency Phone</Label><Input value={profileForm.emergency_contact_phone} onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })} /></div>
                                </div>
                                <Button onClick={handleSaveProfile} disabled={loading}>{loading ? "Saving..." : "Save Profile"}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Record Visit</Button></DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader><DialogTitle>Infirmary Visit</DialogTitle></DialogHeader>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Student</Label>
                                    <Select value={logForm.student_id} onValueChange={(value) => setLogForm({ ...logForm, student_id: value })}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.profile?.full_name || student.admission_number}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Reason</Label><Input value={logForm.visit_reason} onChange={(e) => setLogForm({ ...logForm, visit_reason: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Symptoms</Label><Textarea value={logForm.symptoms} onChange={(e) => setLogForm({ ...logForm, symptoms: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Temperature (deg F)</Label><Input type="number" step="0.1" value={logForm.temperature} onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Treatment</Label><Textarea value={logForm.treatment_provided} onChange={(e) => setLogForm({ ...logForm, treatment_provided: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Medication</Label><Textarea value={logForm.medication_given} onChange={(e) => setLogForm({ ...logForm, medication_given: e.target.value })} /></div>
                                </div>
                                <Button onClick={handleCreateLog} disabled={loading}>{loading ? "Recording..." : "Record Visit"}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>}
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                <Card className="md:col-span-7 p-8 border border-border"><div className="mb-6 flex items-center justify-between"><div><h3 className="text-xl font-bold">Incident Telemetry</h3><p className="text-xs text-muted-foreground">Monthly infirmary visits</p></div><Activity className="h-5 w-5 text-primary" /></div><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={telemetry}><defs><linearGradient id="health-visits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Area type="monotone" dataKey="visits" stroke="#ef4444" fill="url(#health-visits)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div></Card>
                <Card className="md:col-span-5 p-8 border border-border"><div className="mb-6"><h3 className="text-xl font-bold">Ailment Profile</h3><p className="text-xs text-muted-foreground">Most common visit reasons</p></div><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={ailmentData} dataKey="value" innerRadius={60} outerRadius={90}>{ailmentData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div></Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Total Visits</p><h3 className="text-4xl font-bold mt-2">{infirmaryLogs.length}</h3></Card>
                <Card className="p-6 border border-destructive/20 bg-destructive/5"><p className="text-xs text-destructive">Under Observation</p><h3 className="text-4xl font-bold mt-2">{activeVisits.length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Health Profiles</p><h3 className="text-4xl font-bold mt-2">{healthProfiles.length}</h3></Card>
            </div>

            <Card className="overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted"><tr><th className="p-4 text-left">Student</th><th className="p-4 text-left">Reason</th><th className="p-4 text-left">Temperature</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-border">
                            {infirmaryLogs.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No infirmary visits recorded yet.</td></tr> : infirmaryLogs.map((log) => <tr key={log.id}><td className="p-4"><div className="font-medium">{log.student?.profile?.first_name} {log.student?.profile?.last_name}</div><div className="text-xs text-muted-foreground">{log.student?.admission_number}</div></td><td className="p-4">{log.visit_reason}</td><td className="p-4">{log.temperature ? `${log.temperature} deg F` : "-"}</td><td className="p-4"><Badge variant="outline" className={cn(log.status === "under_observation" ? "border-destructive/20 text-destructive bg-destructive/5" : log.status === "discharged" ? "border-primary/20 text-primary bg-primary/5" : "border-amber-500/20 text-amber-600 bg-amber-500/5")}>{log.status?.replace("_", " ")}</Badge></td><td className="p-4 text-right">{isAdminOrTeacher && log.status === "under_observation" && <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleStatusChange(log.id, "referral")}>Referral</Button><Button variant="ghost" size="sm" onClick={() => handleStatusChange(log.id, "discharged")}><CheckCircle className="h-4 w-4 mr-1" /> Discharge</Button></div>}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div><h3 className="text-xl font-bold">Health Profiles</h3><p className="text-xs text-muted-foreground">Allergy, medication, and emergency contact details</p></div>
                    {isAdminOrTeacher && <Button variant="outline" onClick={() => setIsProfileOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add / Update Profile</Button>}
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {students.map((student) => {
                        const profile = profileLookup[student.id];
                        return <Card key={student.id} className="p-5 border border-border"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><User className="h-5 w-5" /></div><div><p className="font-medium">{student.profile?.full_name || student.admission_number}</p><p className="text-xs text-muted-foreground">{student.admission_number}</p></div></div>{isAdminOrTeacher && <Button variant="ghost" size="sm" onClick={() => handleOpenProfile(student.id)}>{profile ? "Edit" : "Create"}</Button>}</div><div className="mt-4 space-y-2 text-sm"><p><span className="text-muted-foreground">Blood group:</span> {profile?.blood_group || "Not recorded"}</p><p><span className="text-muted-foreground">Allergies:</span> {profile?.allergies?.join(", ") || "None recorded"}</p><p><span className="text-muted-foreground">Medications:</span> {profile?.medications?.join(", ") || "None recorded"}</p><p><span className="text-muted-foreground">Emergency:</span> {profile?.emergency_contact_name ? `${profile.emergency_contact_name} • ${profile.emergency_contact_phone || "No phone"}` : "Not recorded"}</p></div></Card>;
                    })}
                </div>
            </div>
        </div>
    );
}
