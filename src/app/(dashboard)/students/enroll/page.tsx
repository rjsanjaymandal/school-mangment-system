"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    UserPlus, Save, CheckCircle2, ArrowLeft, ArrowRight, 
    User, Users, MapPin, Contact, Heart, Pencil, 
    RotateCw, ShieldCheck, Activity, GraduationCap,
    Stethoscope, Smartphone, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createStudent, generateRollNumber } from "@/app/actions/students";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Shared UI Framework
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { ERPCard } from "@/components/ui/erp-card";

const STEPS = [
    { id: 1, title: "Admission", icon: ShieldCheck, color: "emerald" },
    { id: 2, title: "Personal", icon: User, color: "blue" },
    { id: 3, title: "Guardian", icon: Users, color: "purple" },
    { id: 4, title: "Health", icon: Stethoscope, color: "rose" },
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

    const updateForm = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                toast.success("Enrollment Successful", {
                    description: "Student added to registry.",
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
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Unified Page Header */}
            <UnifiedPageHeader 
                title="Add Student"
                subtitle="Register a new student"
                icon={UserPlus}
                color="emerald"
                actions={
                    <Link href="/students">
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Student List
                        </Button>
                    </Link>
                }
            />

            {/* Stepper Framework */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between px-4">
                    {STEPS.map((step, idx) => {
                        const isCompleted = currentStep > step.id;
                        const isActive = currentStep === step.id;
                        
                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center group">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border-2",
                                        isCompleted ? "bg-emerald-500 border-emerald-400 text-white rotate-6" : 
                                        isActive ? "bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white scale-110 shadow-xl" : 
                                        "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] mt-3 transition-colors",
                                        isActive || isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className="flex-1 h-[2px] mx-6 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        <div className={cn(
                                            "absolute inset-0 bg-emerald-500 transition-all duration-700 ease-in-out",
                                            currentStep > step.id ? "translate-x-0" : "-translate-x-full"
                                        )} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    {/* Step 1: Admission Details */}
                    {currentStep === 1 && (
                        <ERPCard
                            title="Admission Details"
                            description="Basic enrollment information"
                            icon={<ShieldCheck className="h-5 w-5" />}
                            color="emerald"
                            className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name *</Label>
                                    <Input placeholder="Enter first name" value={formData.first_name} onChange={(e) => updateForm("first_name", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name *</Label>
                                    <Input placeholder="Enter last name" value={formData.last_name} onChange={(e) => updateForm("last_name", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Date</Label>
                                    <Input type="date" value={formData.admission_date} onChange={(e) => updateForm("admission_date", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-tighter text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Class *</Label>
                                    <select value={formData.class_id} onChange={(e) => handleClassChange(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:ring-emerald-500 transition-all">
                                        <option value="" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Select Class</option>
                                        {classes.map((c) => (<option key={c.id} value={c.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{c.name}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            placeholder="System Generated" 
                                            value={formData.roll_number} 
                                            onChange={(e) => {
                                                updateForm("roll_number", e.target.value);
                                                updateForm("auto_roll", false);
                                            }} 
                                            className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-black font-mono tracking-widest text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                                            disabled={formData.auto_roll}
                                        />
                                        {formData.roll_number && (
                                            <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900" onClick={regenerateRollNumber}>
                                                <RotateCw className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer ml-1 mt-1">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.auto_roll}
                                            onChange={(e) => {
                                                updateForm("auto_roll", e.target.checked);
                                                if (e.target.checked && formData.class_id) regenerateRollNumber();
                                            }}
                                            className="rounded-md border-slate-200 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500"
                                        />
                                        Auto-generate Roll#
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Type</Label>
                                    <select value={formData.admission_type} onChange={(e) => updateForm("admission_type", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="new" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">New Admission</option>
                                        <option value="transfer" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Transfer Student</option>
                                        <option value="readmission" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Re-admission</option>
                                    </select>
                                </div>
                            </div>
                        </ERPCard>
                    )}

                    {/* Step 2: Personal Details */}
                    {currentStep === 2 && (
                        <ERPCard
                            title="Personal Information"
                            description="Demographic and personal data"
                            icon={<User className="h-5 w-5" />}
                            color="blue"
                            className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth *</Label>
                                    <Input type="date" value={formData.date_of_birth} onChange={(e) => updateForm("date_of_birth", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-tighter text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</Label>
                                    <select value={formData.gender} onChange={(e) => updateForm("gender", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="male" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Male</option>
                                        <option value="female" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Female</option>
                                        <option value="other" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</Label>
                                    <select value={formData.blood_group} onChange={(e) => updateForm("blood_group", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Select</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (<option key={bg} value={bg} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{bg}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</Label>
                                    <select value={formData.category} onChange={(e) => updateForm("category", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="General" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">General</option>
                                        <option value="OBC" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">OBC</option>
                                        <option value="SC" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">SC</option>
                                        <option value="ST" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">ST</option>
                                        <option value="EWS" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">EWS</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Religion</Label>
                                    <select value={formData.religion} onChange={(e) => updateForm("religion", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="Hindu" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Hindu</option>
                                        <option value="Muslim" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Muslim</option>
                                        <option value="Sikh" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Sikh</option>
                                        <option value="Christian" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Christian</option>
                                        <option value="Not Specified" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Not Specified</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mother Tongue</Label>
                                    <select value={formData.mother_tongue} onChange={(e) => updateForm("mother_tongue", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="English" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">English</option>
                                        <option value="Hindi" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Hindi</option>
                                        <option value="Punjabi" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Punjabi</option>
                                        <option value="Urdu" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Urdu</option>
                                        <option value="Bengali" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Bengali</option>
                                        <option value="Marathi" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Marathi</option>
                                        <option value="Other" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Other</option>
                                    </select>
                                </div>
                            </div>
                        </ERPCard>
                    )}

                    {/* Step 3: Guardian Details */}
                    {currentStep === 3 && (
                        <ERPCard
                            title="Guardian Information"
                            description="Parent and contact details"
                            icon={<Users className="h-5 w-5" />}
                            color="purple"
                            className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Father's Name *</Label>
                                    <Input placeholder="Enter father's name" value={formData.father_name} onChange={(e) => updateForm("father_name", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Father's Phone *</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input placeholder="+91 XXXXX XXXXX" value={formData.father_phone} onChange={(e) => updateForm("father_phone", e.target.value)} className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mother's Name</Label>
                                    <Input placeholder="Enter mother's name" value={formData.mother_name} onChange={(e) => updateForm("mother_name", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Phone</Label>
                                    <Input placeholder="Enter backup number" value={formData.emergency_phone} onChange={(e) => updateForm("emergency_phone", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permanent Address</Label>
                                    <div className="relative">
                                        <Home className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                        <Input placeholder="House No, Street, Area" value={formData.address} onChange={(e) => updateForm("address", e.target.value)} className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</Label>
                                        <Input placeholder="City" value={formData.city} onChange={(e) => updateForm("city", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</Label>
                                        <Input placeholder="Zip Code" value={formData.pincode} onChange={(e) => updateForm("pincode", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </ERPCard>
                    )}

                    {/* Step 4: Medical Details */}
                    {currentStep === 4 && (
                        <ERPCard
                            title="Medical Information"
                            description="Health and medical conditions"
                            icon={<Stethoscope className="h-5 w-5" />}
                            color="red"
                            className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Known Allergies</Label>
                                    <Input placeholder="None or specify" value={formData.allergies} onChange={(e) => updateForm("allergies", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Medications</Label>
                                    <Input placeholder="None or specify" value={formData.medications} onChange={(e) => updateForm("medications", e.target.value)} className="h-12 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vision</Label>
                                    <select value={formData.vision} onChange={(e) => updateForm("vision", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="normal" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Normal</option>
                                        <option value="corrected" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Corrected (Glasses)</option>
                                        <option value="impaired" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Impaired</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hearing</Label>
                                    <select value={formData.hearing} onChange={(e) => updateForm("hearing", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                                        <option value="normal" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Normal</option>
                                        <option value="aided" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Hearing Aid</option>
                                        <option value="impaired" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">Impaired</option>
                                    </select>
                                </div>
                            </div>
                        </ERPCard>
                    )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-10">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep} 
                        disabled={currentStep === 1} 
                        className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Previous
                    </Button>
                    
                    <div className="flex gap-4">
                        {currentStep < 4 ? (
                            <Button 
                                type="button" 
                                onClick={nextStep} 
                                disabled={!canProceed()} 
                                className="h-12 px-10 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95 gap-2"
                            >
                                Next Step <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="h-12 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all active:scale-95 gap-2"
                            >
                                {isSubmitting ? <Activity className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSubmitting ? "Saving..." : "Enroll Student"}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}