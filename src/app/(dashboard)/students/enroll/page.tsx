"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Save, CheckCircle2, ArrowLeft, ArrowRight, User, Users, MapPin, Contact, Heart, Pencil, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createStudent, generateRollNumber } from "@/app/actions/students";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, title: "Admission", icon: User },
    { id: 2, title: "Personal", icon: Users },
    { id: 3, title: "Guardian", icon: Contact },
    { id: 4, title: "Medical", icon: Heart },
];

export default function StudentEnrollmentPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        // Step 1: Admission
        admission_date: new Date().toISOString().split('T')[0],
        admission_type: "new",
        class_id: "",
        roll_number: "",
        auto_roll: true,
        // Step 2: Personal
        first_name: "",
        last_name: "",
        gender: "male",
        date_of_birth: "",
        blood_group: "",
        category: "General",
        religion: "Not Specified",
        mother_tongue: "English",
        rte_status: "false",
        // Step 3: Guardian
        father_name: "",
        father_phone: "",
        father_occupation: "",
        mother_name: "",
        mother_phone: "",
        mother_occupation: "",
        guardian_relation: "Father",
        emergency_phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        // Step 4: Medical
        allergies: "",
        medications: "",
        medical_conditions: "",
        vision: "normal",
        hearing: "normal",
    });

    useEffect(() => {
        const fetchClasses = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("classes").select("id, name").order("name");
            if (data) setClasses(data);
        };
        fetchClasses();
    }, []);

    const handleClassChange = useCallback(async (classId: string) => {
        updateForm("class_id", classId);
        if (formData.auto_roll && classId) {
            try {
                const rollNo = await generateRollNumber(classId);
                updateForm("roll_number", rollNo);
            } catch {
                updateForm("roll_number", "");
            }
        }
    }, [formData.auto_roll]);

    const regenerateRollNumber = async () => {
        if (formData.class_id) {
            try {
                const rollNo = await generateRollNumber(formData.class_id);
                updateForm("roll_number", rollNo);
                toast.success("Roll number regenerated");
            } catch {
                toast.error("Failed to generate roll number");
            }
        }
    };

    const updateForm = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setCurrentStep(s => Math.min(s + 1, 4));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

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
                admission_date: formData.admission_date,
                gender: formData.gender,
                date_of_birth: formData.date_of_birth,
                blood_group: formData.blood_group,
                phone: formData.emergency_phone || formData.father_phone,
                address: formData.address,
            });

            if ("error" in res && res.error) {
                toast.error(String(res.error));
            } else {
                toast.success("Student Enrolled Successfully", {
                    description: "Record synchronized with institutional registry.",
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                });
                setTimeout(() => router.push("/students"), 1500);
            }
        } catch (error) {
            toast.error("Enrollment failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) return formData.class_id && formData.first_name;
        if (currentStep === 2) return formData.last_name && formData.date_of_birth;
        if (currentStep === 3) return formData.father_name && formData.father_phone;
        return true;
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild className="shrink-0">
                    <Link href="/students"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Enroll New Student</h1>
                        <p className="text-sm text-slate-500">Academic Year 2026-27</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-xl">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                                    currentStep >= step.id 
                                        ? "bg-emerald-600 text-white" 
                                        : "bg-slate-100 text-slate-400"
                                )}>
                                    {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                </div>
                                <span className={cn("text-xs mt-1", currentStep >= step.id ? "text-emerald-600 font-medium" : "text-slate-400")}>
                                    {step.title}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={cn("h-0.5 w-12 md:w-20 mx-2", currentStep > step.id ? "bg-emerald-600" : "bg-slate-200")} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                {/* Step 1: Admission Details */}
                {currentStep === 1 && (
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b">
                            <User className="h-5 w-5 text-emerald-600" />
                            <h2 className="font-semibold">Admission Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name *</Label>
                                <Input placeholder="Enter first name" value={formData.first_name} onChange={(e) => updateForm("first_name", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name *</Label>
                                <Input placeholder="Enter last name" value={formData.last_name} onChange={(e) => updateForm("last_name", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Admission Date</Label>
                                <Input type="date" value={formData.admission_date} onChange={(e) => updateForm("admission_date", e.target.value)} className="h-11" />
                            </div>
<div className="space-y-2">
                                <Label>Assigned Class *</Label>
                                <Select value={formData.class_id} onValueChange={handleClassChange}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Select class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Roll Number</Label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        placeholder="Auto-generated" 
                                        value={formData.roll_number} 
                                        onChange={(e) => {
                                            updateForm("roll_number", e.target.value);
                                            updateForm("auto_roll", false);
                                        }} 
                                        className="h-11 font-mono"
                                        disabled={formData.auto_roll}
                                    />
                                    {formData.roll_number && (
                                        <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={regenerateRollNumber} title="Regenerate">
                                            <RotateCw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.auto_roll}
                                        onChange={(e) => {
                                            updateForm("auto_roll", e.target.checked);
                                            if (e.target.checked && formData.class_id) {
                                                regenerateRollNumber();
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    Auto-generate
                                </label>
                            </div>
                            <div className="space-y-2">
                                <Label>Admission Type</Label>
                                <Select value={formData.admission_type} onValueChange={(v) => updateForm("admission_type", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New Admission</SelectItem>
                                        <SelectItem value="transfer">Transfer Entry</SelectItem>
                                        <SelectItem value="readmission">Readmission</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Roll Number</Label>
                                <Input placeholder="Auto-generated" value={formData.roll_number} onChange={(e) => updateForm("roll_number", e.target.value)} className="h-11" />
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 2: Personal Details */}
                {currentStep === 2 && (
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Date of Birth *</Label>
                                <Input type="date" value={formData.date_of_birth} onChange={(e) => updateForm("date_of_birth", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={formData.gender} onValueChange={(v) => updateForm("gender", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Blood Group</Label>
                                <Select value={formData.blood_group} onValueChange={(v) => updateForm("blood_group", v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (<SelectItem key={bg} value={bg}>{bg}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(v) => updateForm("category", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="OBC">OBC</SelectItem>
                                        <SelectItem value="SC">SC</SelectItem>
                                        <SelectItem value="ST">ST</SelectItem>
                                        <SelectItem value="EWS">EWS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Religion</Label>
                                <Select value={formData.religion} onValueChange={(v) => updateForm("religion", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hindu">Hindu</SelectItem>
                                        <SelectItem value="Muslim">Muslim</SelectItem>
                                        <SelectItem value="Sikh">Sikh</SelectItem>
                                        <SelectItem value="Christian">Christian</SelectItem>
                                        <SelectItem value="Not Specified">Not Specified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Mother Tongue</Label>
                                <Select value={formData.mother_tongue} onValueChange={(v) => updateForm("mother_tongue", v === "custom" ? "" : v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Hindi">Hindi</SelectItem>
                                        <SelectItem value="Punjabi">Punjabi</SelectItem>
                                        <SelectItem value="Urdu">Urdu</SelectItem>
                                        <SelectItem value="Bengali">Bengali</SelectItem>
                                        <SelectItem value="Marathi">Marathi</SelectItem>
                                        <SelectItem value="Tamil">Tamil</SelectItem>
                                        <SelectItem value="Telugu">Telugu</SelectItem>
                                        <SelectItem value="Kannada">Kannada</SelectItem>
                                        <SelectItem value="Malayalam">Malayalam</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>RTE Status</Label>
                                <Select value={formData.rte_status} onValueChange={(v) => updateForm("rte_status", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Non-RTE</SelectItem>
                                        <SelectItem value="true">RTE Candidate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 3: Guardian Details */}
                {currentStep === 3 && (
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b">
                            <Contact className="h-5 w-5 text-purple-600" />
                            <h2 className="font-semibold">Guardian Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Father's Name *</Label>
                                <Input placeholder="Enter father's name" value={formData.father_name} onChange={(e) => updateForm("father_name", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Father's Phone *</Label>
                                <Input placeholder="+91 XXXXX XXXXX" value={formData.father_phone} onChange={(e) => updateForm("father_phone", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Father's Occupation</Label>
                                <Input placeholder="Enter occupation" value={formData.father_occupation} onChange={(e) => updateForm("father_occupation", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Mother's Name</Label>
                                <Input placeholder="Enter mother's name" value={formData.mother_name} onChange={(e) => updateForm("mother_name", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Mother's Phone</Label>
                                <Input placeholder="+91 XXXXX XXXXX" value={formData.mother_phone} onChange={(e) => updateForm("mother_phone", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Emergency Contact</Label>
                                <Input placeholder="+91 XXXXX XXXXX" value={formData.emergency_phone} onChange={(e) => updateForm("emergency_phone", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => updateForm("email", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Guardian Relation</Label>
                                <Select value={formData.guardian_relation} onValueChange={(v) => updateForm("guardian_relation", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Father">Father</SelectItem>
                                        <SelectItem value="Mother">Mother</SelectItem>
                                        <SelectItem value="Guardian">Guardian</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Permanent Address</Label>
                                <Input placeholder="House/Flat No, Street, Area" value={formData.address} onChange={(e) => updateForm("address", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input placeholder="City" value={formData.city} onChange={(e) => updateForm("city", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input placeholder="State" value={formData.state} onChange={(e) => updateForm("state", e.target.value)} className="h-11" />
                            </div>
                        </div>
                    </Card>
                )}

                {/* Step 4: Medical Details */}
                {currentStep === 4 && (
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b">
                            <Heart className="h-5 w-5 text-red-500" />
                            <h2 className="font-semibold">Medical Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Known Allergies</Label>
                                <Input placeholder="None or specify" value={formData.allergies} onChange={(e) => updateForm("allergies", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Medications</Label>
                                <Input placeholder="None or specify" value={formData.medications} onChange={(e) => updateForm("medications", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Medical Conditions</Label>
                                <Input placeholder="None or specify" value={formData.medical_conditions} onChange={(e) => updateForm("medical_conditions", e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Vision</Label>
                                <Select value={formData.vision} onValueChange={(v) => updateForm("vision", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="corrected">Corrected (Glasses)</SelectItem>
                                        <SelectItem value="impaired">Impaired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Hearing</Label>
                                <Select value={formData.hearing} onValueChange={(v) => updateForm("hearing", v)}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="aided">Aided</SelectItem>
                                        <SelectItem value="impaired">Impaired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Previous
                    </Button>
                    <div className="flex gap-2">
                        {currentStep < 4 ? (
                            <Button type="button" onClick={nextStep} disabled={!canProceed()} className="gap-2 bg-emerald-600">
                                Next <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting} className="gap-2 bg-emerald-600">
                                <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Enroll Student"}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}