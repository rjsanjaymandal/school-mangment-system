"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
    Fingerprint, 
    User, 
    Phone, 
    Image as ImageIcon, 
    Save,
    Loader2,
    ShieldCheck,
    Languages,
    MapPin,
    GraduationCap,
    Banknote,
    UploadCloud,
    Briefcase,
    Building2,
    CalendarDays,
    Stethoscope,
    Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { addStaff, updateStaff } from "@/app/actions/hr";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { AddDesignationModal } from "./AddDesignationModal";
import { createClient } from "@/lib/supabase/client";

// Shared UI Framework
import { ERPCard } from "@/components/ui/erp-card";

const formSchema = z.object({
    staff_type: z.enum(["teaching", "non_teaching"]),
    department_id: z.string().min(1, "Department is required"),
    designation_id: z.string().min(1, "Designation is required"),
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    father_name: z.string().min(2, "Father's name is required"),
    mother_name: z.string().optional(),
    gender: z.enum(["male", "female", "other"]),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    marital_status: z.enum(["single", "married", "divorced", "widowed"]),
    caste_category: z.string().optional(),
    highest_qualification: z.string().min(2, "Highest qualification is required"),
    mother_tongue: z.string().min(2, "Mother tongue is required"),
    languages_known: z.string().optional(),
    mobile: z.string().min(10, "Valid mobile number is required"),
    email: z.string().email("Valid email is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    date_of_joining: z.string().min(1, "Date of joining is required"),
    monthly_salary: z.coerce.number().min(0, "Invalid salary"),
    is_login_enabled: z.boolean().default(false),
    regional_language_proficiency: z.string().optional(),
    aadhar_number: z.string().optional(),
    pan_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStaffForm({ departments, designations, onRefreshLists, initialData }: { 
    departments: any[], 
    designations: any[], 
    onRefreshLists: () => void,
    initialData?: any 
}) {
    const router = useRouter();
    const isEdit = !!initialData;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: initialData ? {
            ...initialData,
            monthly_salary: Number(initialData.monthly_salary),
            languages_known: initialData.languages_known?.join(', '),
            date_of_birth: initialData.date_of_birth?.split('T')[0],
            date_of_joining: initialData.date_of_joining?.split('T')[0],
            father_name: initialData["father's_name"],
        } : {
            staff_type: "teaching",
            is_login_enabled: false,
            monthly_salary: 0,
        },
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        try {
            let photo_url = undefined;

            if (photoFile) {
                const supabase = createClient();
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('staff-photos')
                    .upload(fileName, photoFile);

                if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
                
                const { data: publicUrlData } = supabase.storage.from('staff-photos').getPublicUrl(fileName);
                photo_url = publicUrlData.publicUrl;
            }

            const payload = {
                ...data,
                languages_known: data.languages_known ? data.languages_known.split(',').map(l => l.trim()) : [],
                photo_url
            };

            const result = isEdit ? await updateStaff(initialData.id, payload as any) : await addStaff(payload as any);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isEdit ? "Staff updated!" : "Staff member added!");
                router.push('/hr/directory');
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Employment Details */}
                <ERPCard 
                    title="Employment Details" 
                    description="Official role and department" 
                    icon={<Briefcase className="h-5 w-5" />}
                    color="emerald"
                    className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff ID</Label>
                            <Input disabled value={initialData?.staff_id || "Auto-generated"} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Type</Label>
                            <Select onValueChange={(val) => form.setValue("staff_type", val as any)} defaultValue={form.getValues("staff_type")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 text-xs font-bold bg-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="teaching" className="rounded-lg">Teaching Faculty</SelectItem>
                                    <SelectItem value="non_teaching" className="rounded-lg">Non-Teaching Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</Label>
                            <Select onValueChange={(val) => form.setValue("department_id", val)} defaultValue={form.getValues("department_id")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 text-xs font-bold bg-white">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {departments.map(d => (<SelectItem key={d.id} value={d.id} className="rounded-lg">{d.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</Label>
                            <Select onValueChange={(val) => form.setValue("designation_id", val)} defaultValue={form.getValues("designation_id")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 text-xs font-bold bg-white">
                                    <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {designations.map(d => (<SelectItem key={d.id} value={d.id} className="rounded-lg">{d.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ERPCard>

                {/* Photo Upload */}
                <ERPCard 
                    title="Profile Photo" 
                    description="Recent passport sized photograph" 
                    icon={<ImageIcon className="h-5 w-5" />}
                    color="blue"
                    className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                >
                    <div className="flex flex-col items-center justify-center h-full mt-6 space-y-6">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 shadow-inner">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-slate-200" />
                                )}
                            </div>
                            <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            <label htmlFor="photo-upload" className="absolute -bottom-3 -right-3 h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-all">
                                <UploadCloud className="h-5 w-5" />
                            </label>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center max-w-[200px]">
                            Upload a clear photo for the institutional ID card
                        </p>
                    </div>
                </ERPCard>

                {/* Personal Information */}
                <ERPCard 
                    title="Personal Information" 
                    description="Basic identity details" 
                    icon={<User className="h-5 w-5" />}
                    color="purple"
                    className="glass futuristic-card border-none shadow-xl rounded-2xl p-8 lg:col-span-2"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</Label>
                            <Input {...form.register("first_name")} className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</Label>
                            <Input {...form.register("last_name")} className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Father's Name</Label>
                            <Input {...form.register("father_name")} className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</Label>
                            <Input type="date" {...form.register("date_of_birth")} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</Label>
                            <Select onValueChange={(val) => form.setValue("gender", val as any)} defaultValue={form.getValues("gender")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 text-xs font-bold bg-white">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="male" className="rounded-lg">Male</SelectItem>
                                    <SelectItem value="female" className="rounded-lg">Female</SelectItem>
                                    <SelectItem value="other" className="rounded-lg">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marital Status</Label>
                            <Select onValueChange={(val) => form.setValue("marital_status", val as any)} defaultValue={form.getValues("marital_status")}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 text-xs font-bold bg-white">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="single" className="rounded-lg">Single</SelectItem>
                                    <SelectItem value="married" className="rounded-lg">Married</SelectItem>
                                    <SelectItem value="divorced" className="rounded-lg">Divorced</SelectItem>
                                    <SelectItem value="widowed" className="rounded-lg">Widowed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ERPCard>

                {/* Professional & Contact */}
                <ERPCard 
                    title="Contact & Skills" 
                    description="Communication and qualifications" 
                    icon={<ShieldCheck className="h-5 w-5" />}
                    color="amber"
                    className="glass futuristic-card border-none shadow-xl rounded-2xl p-8 lg:col-span-2"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</Label>
                            <Input {...form.register("mobile")} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                            <Input {...form.register("email")} className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</Label>
                            <Input type="date" {...form.register("date_of_joining")} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Qualification</Label>
                            <Input {...form.register("highest_qualification")} placeholder="e.g. M.Sc, PhD" className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Language</Label>
                            <Input {...form.register("mother_tongue")} className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Other Languages</Label>
                            <Input {...form.register("languages_known")} className="h-12 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</Label>
                            <Textarea {...form.register("address")} className="rounded-xl border-slate-200 text-xs font-bold resize-none" rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Monthly Pay (₹)</Label>
                            <Input type="number" {...form.register("monthly_salary")} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhar Number</Label>
                            <Input {...form.register("aadhar_number")} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Number</Label>
                            <Input {...form.register("pan_number")} className="h-12 rounded-xl border-slate-200 text-xs font-black font-mono uppercase" />
                        </div>
                    </div>
                </ERPCard>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl sticky bottom-8 z-50 animate-in slide-in-from-bottom-10 duration-1000">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-12 px-12 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isEdit ? "Update Staff" : "Add Staff Member"}
                </Button>
            </div>
        </form>
    );
}
