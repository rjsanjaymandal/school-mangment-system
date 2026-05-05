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
    UploadCloud
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
            father_name: initialData["father's_name"], // Map back correctly
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

            // Upload photo if exists
            if (photoFile) {
                const supabase = createClient();
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('staff-photos')
                    .upload(fileName, photoFile);

                if (uploadError) {
                    throw new Error(`Failed to upload photo: ${uploadError.message}`);
                }
                
                const { data: publicUrlData } = supabase.storage
                    .from('staff-photos')
                    .getPublicUrl(fileName);
                    
                photo_url = publicUrlData.publicUrl;
            }

            const payload = {
                ...data,
                languages_known: data.languages_known ? data.languages_known.split(',').map(l => l.trim()) : [],
                photo_url
            };

            let result;
            if (isEdit) {
                result = await updateStaff(initialData.id, payload as any);
            } else {
                result = await addStaff(payload as any);
            }

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isEdit ? "Staff updated successfully!" : "Staff member registered successfully!");
                router.push('/hr/directory');
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Neo-Indian specific styling class variables
    const sectionHeaderClass = "flex items-center gap-3 text-lg font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 mb-6 border-b border-emerald-100 dark:border-emerald-900 pb-3";
    const iconWrapperClass = "p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400";

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            
            {/* SECTION A: Identification */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Fingerprint className="h-32 w-32 text-emerald-600" />
                </div>
                <h2 className={sectionHeaderClass}>
                    <div className={iconWrapperClass}><Fingerprint className="h-5 w-5" /></div>
                    A. Staff Identification
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-3">
                        <Label>Staff ID</Label>
                        <Input disabled value={initialData?.staff_id || "Auto-generated (e.g. GCC-2026-0001)"} className="bg-slate-50 italic text-muted-foreground font-mono" />
                    </div>
                    
                    <div className="space-y-3">
                        <Label>Staff Type <span className="text-destructive">*</span></Label>
                        <Select 
                            onValueChange={(val) => form.setValue("staff_type", val as "teaching" | "non_teaching")} 
                            defaultValue={form.getValues("staff_type")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="teaching">Teaching Faculty</SelectItem>
                                <SelectItem value="non_teaching">Non-Teaching Staff</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.staff_type && <p className="text-xs text-destructive">{form.formState.errors.staff_type.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Department <span className="text-destructive">*</span></Label>
                            <AddDepartmentModal onAdd={onRefreshLists} />
                        </div>
                        <Select 
                            onValueChange={(val) => form.setValue("department_id", val)} 
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.department_id && <p className="text-xs text-destructive">{form.formState.errors.department_id.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Designation <span className="text-destructive">*</span></Label>
                            <AddDesignationModal departments={departments} onAdd={onRefreshLists} />
                        </div>
                        <Select 
                            onValueChange={(val) => form.setValue("designation_id", val)} 
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                            <SelectContent>
                                {designations.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.designation_id && <p className="text-xs text-destructive">{form.formState.errors.designation_id.message}</p>}
                    </div>

                    <div className="space-y-3 flex items-center justify-between md:col-span-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mt-auto h-[72px]">
                        <div className="space-y-0.5">
                            <Label className="text-emerald-800 dark:text-emerald-400 font-bold">Enable Portal Login</Label>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Creates an auth account for the staff member</p>
                        </div>
                        <Switch 
                            checked={form.watch("is_login_enabled")}
                            onCheckedChange={(val) => form.setValue("is_login_enabled", val)}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION B: Personal Details */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className={sectionHeaderClass}>
                    <div className={iconWrapperClass}><User className="h-5 w-5" /></div>
                    B. Personal Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <Label>First Name <span className="text-destructive">*</span></Label>
                        <Input {...form.register("first_name")} placeholder="e.g. Rahul" />
                        {form.formState.errors.first_name && <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>}
                    </div>
                    
                    <div className="space-y-3">
                        <Label>Last Name <span className="text-destructive">*</span></Label>
                        <Input {...form.register("last_name")} placeholder="e.g. Sharma" />
                        {form.formState.errors.last_name && <p className="text-xs text-destructive">{form.formState.errors.last_name.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Father's Name <span className="text-destructive">*</span></Label>
                        <Input {...form.register("father_name")} placeholder="e.g. R.K. Sharma" />
                        {form.formState.errors.father_name && <p className="text-xs text-destructive">{form.formState.errors.father_name.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Gender <span className="text-destructive">*</span></Label>
                        <Select onValueChange={(val) => form.setValue("gender", val as any)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.gender && <p className="text-xs text-destructive">{form.formState.errors.gender.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Date of Birth <span className="text-destructive">*</span></Label>
                        <Input type="date" {...form.register("date_of_birth")} />
                        {form.formState.errors.date_of_birth && <p className="text-xs text-destructive">{form.formState.errors.date_of_birth.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Marital Status <span className="text-destructive">*</span></Label>
                        <Select onValueChange={(val) => form.setValue("marital_status", val as any)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.marital_status && <p className="text-xs text-destructive">{form.formState.errors.marital_status.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Caste / Category (Optional)</Label>
                        <Input {...form.register("caste_category")} placeholder="e.g. General, OBC, SC/ST" />
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2"><GraduationCap className="h-3 w-3"/> Highest Qualification <span className="text-destructive">*</span></Label>
                        <Input {...form.register("highest_qualification")} placeholder="e.g. M.Sc. Mathematics, B.Ed." />
                        {form.formState.errors.highest_qualification && <p className="text-xs text-destructive">{form.formState.errors.highest_qualification.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2"><Languages className="h-3 w-3"/> Mother Tongue <span className="text-destructive">*</span></Label>
                        <Input {...form.register("mother_tongue")} placeholder="e.g. Hindi, Marathi" />
                        {form.formState.errors.mother_tongue && <p className="text-xs text-destructive">{form.formState.errors.mother_tongue.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Other Languages Known</Label>
                        <Input {...form.register("languages_known")} placeholder="e.g. English, Sanskrit (comma separated)" />
                    </div>

                    <div className="space-y-3">
                        <Label>Regional Language Proficiency</Label>
                        <Input {...form.register("regional_language_proficiency")} placeholder="e.g. Fluent in Marathi, Basic Kannada" />
                    </div>
                </div>
            </div>

            {/* SECTION C: Contact & Salary */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className={sectionHeaderClass}>
                    <div className={iconWrapperClass}><Phone className="h-5 w-5" /></div>
                    C. Contact & Compensation
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <Label>Mobile Number <span className="text-destructive">*</span></Label>
                        <Input {...form.register("mobile")} placeholder="+91 9876543210" />
                        {form.formState.errors.mobile && <p className="text-xs text-destructive">{form.formState.errors.mobile.message}</p>}
                    </div>
                    
                    <div className="space-y-3">
                        <Label>Email Address <span className="text-destructive">*</span></Label>
                        <Input type="email" {...form.register("email")} placeholder="staff@edumaysan.com" />
                        {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Date of Joining <span className="text-destructive">*</span></Label>
                        <Input type="date" {...form.register("date_of_joining")} />
                        {form.formState.errors.date_of_joining && <p className="text-xs text-destructive">{form.formState.errors.date_of_joining.message}</p>}
                    </div>

                    <div className="space-y-3 md:col-span-3">
                        <Label className="flex items-center gap-2"><MapPin className="h-3 w-3"/> Permanent Address <span className="text-destructive">*</span></Label>
                        <Textarea {...form.register("address")} placeholder="Full address..." className="resize-none" rows={3} />
                        {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2"><Banknote className="h-3 w-3"/> Monthly Salary (₹) <span className="text-destructive">*</span></Label>
                        <Input type="number" {...form.register("monthly_salary")} placeholder="e.g. 45000" />
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest italic">Restricted to Admin View</p>
                        {form.formState.errors.monthly_salary && <p className="text-xs text-destructive">{form.formState.errors.monthly_salary.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Aadhar Number</Label>
                        <Input {...form.register("aadhar_number")} placeholder="XXXX-XXXX-XXXX" />
                    </div>

                    <div className="space-y-3">
                        <Label>PAN Number</Label>
                        <Input {...form.register("pan_number")} placeholder="ABCDE1234F" className="uppercase" />
                    </div>
                </div>
            </div>

            {/* SECTION D: Media */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className={sectionHeaderClass}>
                    <div className={iconWrapperClass}><ImageIcon className="h-5 w-5" /></div>
                    D. Media & Documents
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4 md:col-span-1 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-colors bg-slate-50 dark:bg-slate-900/50">
                        {photoPreview ? (
                            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 border-4 border-white dark:border-slate-900 shadow-inner">
                                <User className="h-12 w-12 opacity-50" />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full mt-4">
                                <UploadCloud className="h-4 w-4" />
                                {photoPreview ? "Change Photo" : "Upload Staff Photo"}
                            </Label>
                            <Input 
                                id="photo-upload" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-800 space-y-2">
                            <h4 className="font-bold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Image Guidelines</h4>
                            <ul className="text-xs list-disc list-inside space-y-1 opacity-80">
                                <li>Recent passport-sized photograph</li>
                                <li>Clear front-facing pose</li>
                                <li>Plain white or light background</li>
                                <li>Maximum file size: 5MB</li>
                                <li>Formats: JPEG, PNG, WEBP</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 sticky bottom-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50">
                <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting} className="rounded-xl px-8 font-bold">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-bold gap-2 shadow-lg shadow-emerald-600/20">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSubmitting ? (isEdit ? "Updating..." : "Registering...") : (isEdit ? "Update Profile" : "Register Staff Member")}
                </Button>
            </div>
        </form>
    );
}
