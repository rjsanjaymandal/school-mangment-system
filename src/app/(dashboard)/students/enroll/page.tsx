"use client";

import { useState } from "react";
import { 
    GraduationCap, Save, UserPlus, Info, 
    Users, MapPin, Contact, FileText, CheckCircle2 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createStudent } from "@/app/actions/students";

export default function StudentEnrollmentPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        admission_date: new Date().toISOString().split('T')[0],
        admission_type: "new",
        class_id: "",
        gender: "male",
        date_of_birth: "",
        category: "General",
        religion: "Not Specified",
        mother_tongue: "English",
        rte_status: "false",
        phone: "",
        address: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await createStudent({
                full_name: formData.full_name,
                email: formData.email,
                class_id: formData.class_id,
                category: formData.category,
                religion: formData.religion,
                mother_tongue: formData.mother_tongue,
                rte_status: formData.rte_status === "true",
                admission_date: formData.admission_date
            });

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Student Enrolled Successfully", {
                    description: "The record has been synchronized with the institutional registry.",
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                });
            }
        } catch (error) {
            toast.error("Critical failure during enrollment synchronization.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between reveal-1">
                <div className="flex items-center gap-x-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center emerald-glow">
                        <UserPlus className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                            Enroll New Student
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                            Institutional Admission Intake • Academic Year 2026-27
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest gap-x-3 shadow-2xl active:scale-95 transition-all"
                >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Confirm Enrollment"}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 reveal-2">
                {/* 1. Admission Details */}
                <Card className="card-premium rounded-[2.5rem] p-10 border-l-4 border-l-primary relative overflow-hidden">
                    <div className="flex items-center gap-x-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Info className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Admission Type & Logistics</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admission Date</Label>
                            <Input 
                                type="date" 
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold" 
                                value={formData.admission_date}
                                onChange={(e) => setFormData(p => ({ ...p, admission_date: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admission Type</Label>
                            <Select 
                                value={formData.admission_type}
                                onValueChange={(v) => setFormData(p => ({ ...p, admission_type: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="new">New Admission</SelectItem>
                                    <SelectItem value="transfer">Transfer Entry</SelectItem>
                                    <SelectItem value="readmission">Readmission</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Class</Label>
                            <Select 
                                value={formData.class_id}
                                onValueChange={(v) => setFormData(p => ({ ...p, class_id: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold">
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="1">Grade 1 - Alpha</SelectItem>
                                    <SelectItem value="2">Grade 2 - Beta</SelectItem>
                                    <SelectItem value="3">Grade 3 - Gamma</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* 2. General Details */}
                <Card className="card-premium rounded-[2.5rem] p-10 border-l-4 border-l-primary/50">
                    <div className="flex items-center gap-x-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">General Information</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name (Legal)</Label>
                            <Input 
                                placeholder="e.g. Aryan Sharma" 
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold"
                                value={formData.full_name}
                                onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</Label>
                            <Select 
                                value={formData.gender}
                                onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</Label>
                            <Input 
                                type="date" 
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold" 
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                            />
                        </div>
                    </div>
                </Card>

                {/* 3. Demographic Details */}
                <Card className="card-premium rounded-[2.5rem] p-10 border-l-4 border-l-primary/30">
                    <div className="flex items-center gap-x-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Demographic Segmentation</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category / Caste</Label>
                            <Select 
                                value={formData.category}
                                onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="OBC">OBC</SelectItem>
                                    <SelectItem value="SC">SC</SelectItem>
                                    <SelectItem value="ST">ST</SelectItem>
                                    <SelectItem value="EWS">EWS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Religion</Label>
                            <Select 
                                value={formData.religion}
                                onValueChange={(v) => setFormData(p => ({ ...p, religion: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="Hindu">Hindu</SelectItem>
                                    <SelectItem value="Muslim">Muslim</SelectItem>
                                    <SelectItem value="Sikh">Sikh</SelectItem>
                                    <SelectItem value="Christian">Christian</SelectItem>
                                    <SelectItem value="Not Specified">Not Specified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mother Tongue</Label>
                            <Input 
                                value={formData.mother_tongue}
                                onChange={(e) => setFormData(p => ({ ...p, mother_tongue: e.target.value }))}
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">RTE Status</Label>
                            <Select 
                                value={formData.rte_status}
                                onValueChange={(v) => setFormData(p => ({ ...p, rte_status: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="false">Non-RTE</SelectItem>
                                    <SelectItem value="true">RTE Candidate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* 4. Contact Details */}
                <Card className="card-premium rounded-[2.5rem] p-10 border-l-4 border-l-primary/10">
                    <div className="flex items-center gap-x-4 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Contact className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Contact & Residency</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Mobile</Label>
                            <Input 
                                placeholder="+91 00000 00000" 
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold"
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address (Optional)</Label>
                            <Input 
                                type="email" 
                                placeholder="student@example.com" 
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold"
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permanent Address</Label>
                            <Input 
                                placeholder="Flat/House No, Street, City, State, PIN" 
                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 font-bold"
                                value={formData.address}
                                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
}
