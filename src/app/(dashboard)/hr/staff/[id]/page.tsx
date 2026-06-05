import { getStaffById } from "@/app/actions/hr";
import { getSessionRole } from "@/lib/auth-utils";
import { 
    User, 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Briefcase, 
    Award, 
    ShieldCheck, 
    Languages,
    Fingerprint,
    IdCard,
    Edit
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        notFound();
    }

    const role = await getSessionRole();
    const isAdmin = role === "admin";
    const { data: staff } = await getStaffById(id);

    if (!staff) {
        notFound();
    }

    const department = Array.isArray(staff.department) ? staff.department[0] : staff.department;
    const designation = Array.isArray(staff.designation) ? staff.designation[0] : staff.designation;

    const sectionHeaderClass = "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2";
    const infoLabelClass = "text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5";
    const infoValueClass = "text-sm font-bold text-slate-900";

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <Link href="/hr/directory">
                    <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </Link>
                <div className="flex items-center gap-2">
                    <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        Print ID Card
                    </button>
                    <Link href={`/hr/staff/${id}/edit`}>
                        <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-10 absolute top-0 left-0 right-0" />
                
                <div className="p-8 md:p-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <Avatar className="h-40 w-40 border-8 border-white dark:border-slate-900 shadow-2xl">
                            <AvatarImage src={staff.photo_url} className="object-cover" />
                            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-2xl font-semibold">
                                {staff.first_name[0]}{staff.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                    {staff.first_name} {staff.last_name}
                                </h1>
                                <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30")}>
                                    {staff.status || 'Active'}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Fingerprint className="h-4 w-4" />
                                    <span className="font-mono text-sm font-bold tracking-tight">{staff.staff_id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="text-sm font-bold">{designation?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Award className="h-4 w-4" />
                                    <span className="text-sm font-bold">{department?.name}</span>
                                </div>
                            </div>
                        </div>
                        
                        {isAdmin && (
                            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Monthly Salary</label>
                                <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                                    ₹{staff.monthly_salary?.toLocaleString()}
                                    <ShieldCheck className="h-4 w-4 opacity-30" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Personal & Education */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5">
                        <h3 className={sectionHeaderClass}><User className="h-3 w-3" /> Personal Records</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className={infoLabelClass}>Father's Name</label>
                                <div className={infoValueClass}>{staff["father's_name"]}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Mother's Name</label>
                                <div className={infoValueClass}>{staff.mother_name || "N/A"}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={infoLabelClass}>Gender</label>
                                    <div className={infoValueClass + " capitalize"}>{staff.gender}</div>
                                </div>
                                <div>
                                    <label className={infoLabelClass}>Marital Status</label>
                                    <div className={infoValueClass + " capitalize"}>{staff.marital_status}</div>
                                </div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Date of Birth</label>
                                <div className={infoValueClass}>{staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : "N/A"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5">
                        <h3 className={sectionHeaderClass}><Languages className="h-3 w-3" /> Language & Identity</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className={infoLabelClass}>Mother Tongue</label>
                                <div className={infoValueClass}>{staff.mother_tongue}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Proficiency</label>
                                <div className={infoValueClass}>{staff.regional_language_proficiency || "Standard"}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Aadhar Number</label>
                                <div className={infoValueClass}>{staff.aadhar_number || "XXXXXXXXXXXX"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Contact & Employment */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5">
                        <h3 className={sectionHeaderClass}><Phone className="h-3 w-3" /> Contact Details</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <label className={infoLabelClass}>Mobile</label>
                                    <div className={infoValueClass}>{staff.mobile}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <label className={infoLabelClass}>Email</label>
                                    <div className={infoValueClass}>{staff.email}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 pt-2">
                                <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <label className={infoLabelClass}>Address</label>
                                    <div className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                                        {staff.address}<br/>
                                        {staff.city}, {staff.state} - {staff.pincode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5">
                        <h3 className={sectionHeaderClass}><Calendar className="h-3 w-3" /> Employment Info</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className={infoLabelClass}>Staff Type</label>
                                <div className={infoValueClass + " capitalize"}>{staff.staff_type?.replace('_', ' ')}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Date of Joining</label>
                                <div className={infoValueClass}>{staff.date_of_joining ? new Date(staff.date_of_joining).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Portal Login</label>
                                <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", staff.is_login_enabled ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800")}>
                                    {staff.is_login_enabled ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Professional & Compliance */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5 relative">
                        <h3 className={sectionHeaderClass}><IdCard className="h-3 w-3" /> ID Card Preview</h3>
                        
                        <div className="relative w-full aspect-[1/1.58] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mx-auto max-w-[240px]">
                            <div className="bg-slate-900 h-16 flex flex-col items-center justify-center p-2">
                                <div className="flex items-center gap-1">
                                    <div className="h-4 w-4 bg-white dark:bg-slate-900 rounded flex items-center justify-center">
                                        <Award className="h-2 w-2 text-slate-900 dark:text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Edu Maysan</span>
                                </div>
                                <span className="text-[6px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-0.5">Staff Identity</span>
                            </div>

                            <div className="p-4 flex flex-col items-center text-center space-y-3">
                                <Avatar className="h-20 w-20 border-2 border-slate-100 dark:border-slate-800 shadow-md">
                                    <AvatarImage src={staff.photo_url} className="object-cover" />
                                    <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black text-xl">
                                        {staff.first_name[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                        {staff.first_name} {staff.last_name}
                                    </div>
                                    <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1">
                                        {designation?.name}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

                                <div className="grid grid-cols-1 gap-2 w-full text-left px-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] font-black text-slate-400 uppercase">ID No:</span>
                                        <span className="text-[7px] font-bold text-slate-900 dark:text-white font-mono">{staff.staff_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] font-black text-slate-400 uppercase">Dept:</span>
                                        <span className="text-[7px] font-bold text-slate-900 dark:text-white">{department?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] font-black text-slate-400 uppercase">DOJ:</span>
                                        <span className="text-[7px] font-bold text-slate-900 dark:text-white">{staff.date_of_joining ? new Date(staff.date_of_joining).toLocaleDateString() : "N/A"}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center border border-slate-200 dark:border-slate-800">
                                        <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#ccc_2px,#ccc_3px)] opacity-50" />
                                    </div>
                                    <span className="text-[5px] font-bold text-slate-400 uppercase mt-1 block">Barcoded Secure ID</span>
                                </div>
                            </div>

                            <div className="absolute -bottom-8 -right-8 opacity-[0.03] rotate-12">
                                <Award className="h-32 w-32" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5">
                        <h3 className={sectionHeaderClass}><Award className="h-3 w-3" /> Qualifications</h3>
                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                            <div className="text-indigo-600 dark:text-indigo-400 font-black text-sm mb-2">Primary Qualification</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {staff.highest_qualification}
                            </div>
                        </div>
                        <div className="mt-5">
                            <label className={infoLabelClass}>Other Skills / Languages</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {staff.languages_known?.map((lang: string) => (
                                    <span key={lang} className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5">
                        <h3 className={sectionHeaderClass}><ShieldCheck className="h-3 w-3" /> Banking & Tax</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className={infoLabelClass}>PAN Number</label>
                                <div className={infoValueClass}>{staff.pan_number || "N/A"}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>Bank Account</label>
                                <div className={infoValueClass}>{staff.bank_account || "XXXXXXXXXXXX"}</div>
                            </div>
                            <div>
                                <label className={infoLabelClass}>IFSC Code</label>
                                <div className={infoValueClass}>{staff.ifsc_code || "N/A"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
