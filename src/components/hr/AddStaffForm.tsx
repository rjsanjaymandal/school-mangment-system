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

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addStaff, updateStaff } from "@/app/actions/hr";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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

const iconColors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
};

function FormCard({ title, description, icon, color = "emerald", children, className }: { 
    title: string; description: string; icon: React.ReactNode; color?: string; children: React.ReactNode; className?: string 
}) {
    return (
        <div className={cn("bg-white border border-slate-200 rounded-xl overflow-hidden", className)}>
            <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", iconColors[color])}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-tight text-slate-900">{title}</h3>
                        <p className="text-[10px] text-slate-500 font-bold">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

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
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employment Details */}
                <FormCard 
                    title="Employment Details" 
                    description="Official role and department" 
                    icon={<Briefcase className="h-5 w-5" />}
                    color="emerald"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Staff ID</label>
                            <Input disabled value={initialData?.staff_id || "Auto-generated"} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono bg-slate-50" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Staff Type</label>
                            <select {...form.register("staff_type")} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                <option value="teaching">Teaching Faculty</option>
                                <option value="non_teaching">Non-Teaching Staff</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Department</label>
                            <select {...form.register("department_id")} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                <option value="">Select department</option>
                                {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Designation</label>
                            <select {...form.register("designation_id")} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                <option value="">Select designation</option>
                                {designations.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                            </select>
                        </div>
                    </div>
                </FormCard>

                {/* Photo Upload */}
                <FormCard 
                    title="Profile Photo" 
                    description="Recent passport sized photograph" 
                    icon={<ImageIcon className="h-5 w-5" />}
                    color="blue"
                >
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 shadow-inner">
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
                </FormCard>

                {/* Personal Information */}
                <FormCard 
                    title="Personal Information" 
                    description="Basic identity details" 
                    icon={<User className="h-5 w-5" />}
                    color="purple"
                    className="lg:col-span-2"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">First Name</label>
                            <Input {...form.register("first_name")} className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Last Name</label>
                            <Input {...form.register("last_name")} className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Father's Name</label>
                            <Input {...form.register("father_name")} className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Date of Birth</label>
                            <Input type="date" {...form.register("date_of_birth")} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Gender</label>
                            <select {...form.register("gender")} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Marital Status</label>
                            <select {...form.register("marital_status")} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>
                    </div>
                </FormCard>

                {/* Contact & Skills */}
                <FormCard 
                    title="Contact & Skills" 
                    description="Communication and qualifications" 
                    icon={<ShieldCheck className="h-5 w-5" />}
                    color="amber"
                    className="lg:col-span-2"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Mobile Number</label>
                            <Input {...form.register("mobile")} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Email Address</label>
                            <Input {...form.register("email")} className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Joining Date</label>
                            <Input type="date" {...form.register("date_of_joining")} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Primary Qualification</label>
                            <Input {...form.register("highest_qualification")} placeholder="e.g. M.Sc, PhD" className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Primary Language</label>
                            <Input {...form.register("mother_tongue")} className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Other Languages</label>
                            <Input {...form.register("languages_known")} className="h-11 rounded-xl border-slate-200 text-xs font-bold" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Full Address</label>
                            <textarea {...form.register("address")} className="w-full h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none resize-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1.5">Monthly Pay (₹)</label>
                            <Input type="number" {...form.register("monthly_salary")} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Aadhar Number</label>
                            <Input {...form.register("aadhar_number")} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">PAN Number</label>
                            <Input {...form.register("pan_number")} className="h-11 rounded-xl border-slate-200 text-xs font-black font-mono uppercase" />
                        </div>
                    </div>
                </FormCard>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 p-6 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl sticky bottom-8 z-50 animate-in slide-in-from-bottom-10 duration-1000">
                <button type="button" onClick={() => router.back()} className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isEdit ? "Update Staff" : "Add Staff Member"}
                </button>
            </div>
        </form>
    );
}
