"use client";

import { useState } from "react";
import { 
    GraduationCap, Save, UserPlus, Info, 
    Users, MapPin, Contact, FileText, CheckCircle2 
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
import { cn } from "@/lib/utils";
import { createStudent } from "@/app/actions/students";

export default function StudentEnrollmentPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
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
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                class_id: formData.class_id,
                category: formData.category,
                religion: formData.religion,
                mother_tongue: formData.mother_tongue,
                rte_status: formData.rte_status === "true",
                admission_date: formData.admission_date
            });

            if ("error" in res && res.error) {
                toast.error(String(res.error));
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
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-emerald-50 flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enroll New Student</h1>
                        <p className="text-sm text-slate-500">Academic Year 2026-27</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-md"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Student"}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <ERPCard title="Admission Details" accentColor="emerald" icon={<Info className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Admission Date</Label>
                            <Input 
                                type="date" 
                                className="h-12 rounded-md bg-white border-slate-200 font-medium" 
                                value={formData.admission_date}
                                onChange={(e) => setFormData(p => ({ ...p, admission_date: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Admission Type</Label>
                            <Select 
                                value={formData.admission_type}
                                onValueChange={(v) => setFormData(p => ({ ...p, admission_type: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200 font-medium">
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
                            <Label className="text-sm font-medium text-slate-600">Assigned Class</Label>
                            <Select 
                                value={formData.class_id}
                                onValueChange={(v) => setFormData(p => ({ ...p, class_id: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200 font-medium">
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
                </ERPCard>

                {/* 2. General Details */}
                <ERPCard title="General Information" accentColor="blue" icon={<Users className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input 
                                placeholder="Enter first name" 
                                value={formData.first_name}
                                onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input 
                                placeholder="Enter last name" 
                                value={formData.last_name}
                                onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select 
                                value={formData.gender}
                                onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                            <Input 
                                type="date" 
                                className="h-12 rounded-md bg-white border-slate-200 font-medium" 
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                            />
                        </div>
                    </div>
                </ERPCard>

                {/* 3. Demographic Details */}
                <ERPCard title="Demographic Segmentation" accentColor="slate" icon={<FileText className="h-4 w-4" />}>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Category / Caste</Label>
                            <Select 
                                value={formData.category}
                                onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200 font-medium">
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
                            <Label className="text-sm font-medium text-slate-600">Religion</Label>
                            <Select 
                                value={formData.religion}
                                onValueChange={(v) => setFormData(p => ({ ...p, religion: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200 font-medium">
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
                            <Label className="text-sm font-medium text-slate-600">Mother Tongue</Label>
                            <Input 
                                value={formData.mother_tongue}
                                onChange={(e) => setFormData(p => ({ ...p, mother_tongue: e.target.value }))}
                                className="h-12 rounded-md bg-white border-slate-200 font-medium" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">RTE Status</Label>
                            <Select 
                                value={formData.rte_status}
                                onValueChange={(v) => setFormData(p => ({ ...p, rte_status: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200 font-medium">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="false">Non-RTE</SelectItem>
                                    <SelectItem value="true">RTE Candidate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ERPCard>

                {/* 4. Contact Details */}
                <ERPCard title="Contact & Residency" accentColor="slate" icon={<Contact className="h-4 w-4" />}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Primary Mobile</Label>
                            <Input 
                                placeholder="+91 00000 00000" 
                                className="h-12 rounded-md bg-white border-slate-200 font-medium"
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Email Address (Optional)</Label>
                            <Input 
                                type="email" 
                                placeholder="student@example.com" 
                                className="h-12 rounded-md bg-white border-slate-200 font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Permanent Address</Label>
                            <Input 
                                placeholder="Flat/House No, Street, City, State, PIN" 
                                className="h-12 rounded-md bg-white border-slate-200 font-medium"
                                value={formData.address}
                                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </ERPCard>
            </form>
        </div>
    );
}
