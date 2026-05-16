"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    GraduationCap, Save, ArrowLeft, Info, 
    Users, MapPin, Contact, FileText, CheckCircle2,
    Loader2, X, AlertCircle, Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/client";
import { updateStudent } from "@/app/actions/students";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EditStudentPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        admission_number: "",
        roll_number: "",
        class_id: "",
        gender: "male",
        date_of_birth: "",
        blood_group: "",
        category: "General",
        religion: "Not Specified",
        mother_tongue: "English",
        rte_status: "false",
        status: "active" as any,
        phone: "",
        address: ""
    });

    const fetchData = useCallback(async () => {
        try {
            const supabase = createClient();
            const [student, classRes] = await Promise.all([
                InstitutionalService.getStudentById(id, supabase),
                supabase.from("classes").select("id, name").order("name")
            ]);

            if (classRes.data) setClasses(classRes.data);

            if (student) {
                setFormData({
                    first_name: student.profile?.first_name || "",
                    last_name: student.profile?.last_name || "",
                    email: student.profile?.email || "",
                    admission_number: student.admission_number || "",
                    roll_number: student.roll_number || "",
                    class_id: student.class_id || "",
                    gender: student.gender || "male",
                    date_of_birth: student.date_of_birth || "",
                    blood_group: student.blood_group || "",
                    category: student.category || "General",
                    religion: student.religion || "Not Specified",
                    mother_tongue: student.mother_tongue || "English",
                    rte_status: String(student.rte_status),
                    status: student.status || "active",
                    phone: student.profile?.phone || "",
                    address: student.profile?.address || ""
                });
            }
        } catch (error) {
            toast.error("Failed to fetch student data");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const res = await updateStudent(id, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                admission_number: formData.admission_number,
                roll_number: formData.roll_number,
                class_id: formData.class_id,
                category: formData.category,
                religion: formData.religion,
                mother_tongue: formData.mother_tongue,
                rte_status: formData.rte_status === "true",
                gender: formData.gender,
                date_of_birth: formData.date_of_birth,
                blood_group: formData.blood_group,
                status: formData.status,
                phone: formData.phone,
                address: formData.address
            });

            if (res && "error" in res && res.error) {
                toast.error(String(res.error));
            } else {
                toast.success("Student Updated Successfully");
                router.push(`/students/${id}`);
            }
        } catch (error) {
            toast.error("Critical failure during record synchronization.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Central Registry...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-1000">
            <div className="animate-in slide-in-from-top-4 duration-700">
                <UnifiedPageHeader 
                    title="Edit Student Record"
                    subtitle={`Updating Profile for ${formData.first_name} ${formData.last_name}`}
                    icon={GraduationCap}
                    color="emerald"
                    actions={
                        <div className="flex items-center gap-3">
                            <Button variant="outline" asChild className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold uppercase text-[10px] tracking-widest active:scale-95">
                                <Link href={`/students/${id}`}>
                                    <X className="h-4 w-4 mr-2" /> Cancel
                                </Link>
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="h-11 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Committing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" /> Update Record
                                    </>
                                )}
                            </Button>
                        </div>
                    }
                />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-left-4 duration-700 delay-150">
                    <ERPCard 
                        title="Academic Identity" 
                        description="Institutional identifiers and placement"
                        accentColor="emerald" 
                        icon={<Sparkles className="h-4 w-4" />}
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">Admission Number</Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <Input 
                                        className="h-12 pl-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all"
                                        value={formData.admission_number}
                                        onChange={(e) => setFormData(p => ({ ...p, admission_number: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">Roll Number</Label>
                                <Input 
                                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all"
                                    value={formData.roll_number}
                                    onChange={(e) => setFormData(p => ({ ...p, roll_number: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">Class Stream</Label>
                                <Select 
                                    value={formData.class_id}
                                    onValueChange={(v) => setFormData(p => ({ ...p, class_id: v }))}
                                >
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                        {classes.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id} className="font-bold text-slate-700">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </ERPCard>

                    <ERPCard 
                        title="Personal Dossier" 
                        description="Core demographic metadata"
                        accentColor="blue" 
                        icon={<Users className="h-4 w-4" />}
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">First Name</Label>
                                <Input 
                                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Last Name</Label>
                                <Input 
                                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Gender</Label>
                                    <Select 
                                        value={formData.gender}
                                        onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl font-bold">
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 group">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Blood Group</Label>
                                    <Select 
                                        value={formData.blood_group}
                                        onValueChange={(v) => setFormData(p => ({ ...p, blood_group: v }))}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl font-bold">
                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Date of Birth</Label>
                                <div className="relative">
                                    <Input 
                                        type="date"
                                        className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </ERPCard>
                </div>

                {/* Right Column - Logistics & Contact */}
                <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-right-4 duration-700 delay-300">
                    <ERPCard 
                        title="Demographic Profile" 
                        accentColor="slate" 
                        icon={<Info className="h-4 w-4" />}
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="space-y-6 p-1">
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-900 transition-colors">Category</Label>
                                <Select 
                                    value={formData.category}
                                    onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 transition-all">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold">
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="OBC">OBC</SelectItem>
                                        <SelectItem value="SC">SC</SelectItem>
                                        <SelectItem value="ST">ST</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-900 transition-colors">Religion</Label>
                                <Input 
                                    className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 transition-all"
                                    value={formData.religion}
                                    onChange={(e) => setFormData(p => ({ ...p, religion: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-900 transition-colors">RTE Protocol</Label>
                                <Select 
                                    value={formData.rte_status}
                                    onValueChange={(v) => setFormData(p => ({ ...p, rte_status: v }))}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 transition-all">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold">
                                        <SelectItem value="true">Active RTE</SelectItem>
                                        <SelectItem value="false">Non-RTE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </ERPCard>

                    <ERPCard 
                        title="Contact Layer" 
                        accentColor="indigo" 
                        icon={<Contact className="h-4 w-4" />}
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="space-y-6 p-1">
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Email Channel</Label>
                                <div className="relative">
                                    <Input 
                                        className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Phone Terminal</Label>
                                <Input 
                                    className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Residential Coordinates</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-indigo-500/40 group-focus-within:text-indigo-500 transition-colors" />
                                    <textarea 
                                        className="w-full min-h-[100px] pl-10 pt-2.5 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-xs"
                                        value={formData.address}
                                        onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </ERPCard>

                    {/* Status Sentinel */}
                    <ERPCard 
                        title="Institutional Status" 
                        accentColor="rose" 
                        icon={<AlertCircle className="h-4 w-4" />}
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="space-y-4 p-1">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive State</Label>
                            <Select 
                                value={formData.status}
                                onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}
                            >
                                <SelectTrigger className={cn(
                                    "h-14 rounded-xl border-none font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-inner",
                                    formData.status === 'active' ? "bg-emerald-500 text-white shadow-emerald-200/50" : "bg-rose-500 text-white shadow-rose-200/50"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                    <SelectItem value="active" className="font-black text-[10px] uppercase text-emerald-600 tracking-widest">Active Member</SelectItem>
                                    <SelectItem value="inactive" className="font-black text-[10px] uppercase text-rose-600 tracking-widest">Inactive/Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[9px] text-slate-400 font-medium italic text-center px-4">
                                {formData.status === 'active' 
                                    ? "Student has full access to institutional resources and academic tracks." 
                                    : "Student record is preserved but access to active portals is restricted."}
                            </p>
                        </div>
                    </ERPCard>
                </div>
            </form>
        </div>
    );
}
