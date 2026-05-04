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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
    const role = await getSessionRole();
    const isAdmin = role === "admin";
    const { data: staff } = await getStaffById(params.id);

    if (!staff) {
        notFound();
    }

    const sectionHeaderClass = "text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2";
    const infoLabelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";
    const infoValueClass = "text-sm font-bold text-slate-900 dark:text-white";

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/hr/directory">
                    <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Directory
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl border-slate-200 dark:border-slate-800">
                        <IdCard className="h-4 w-4" />
                        Print ID Card
                    </Button>
                    <Link href={`/hr/staff/${params.id}/edit`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold shadow-sm">
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 opacity-10 absolute top-0 left-0 right-0" />
                
                <div className="p-8 md:p-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <Avatar className="h-40 w-40 border-8 border-white dark:border-slate-900 shadow-2xl">
                            <AvatarImage src={staff.photo_url} className="object-cover" />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-4xl font-black">
                                {staff.first_name[0]}{staff.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                    {staff.first_name} {staff.last_name}
                                </h1>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {staff.status || 'Active'}
                                </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Fingerprint className="h-4 w-4" />
                                    <span className="font-mono text-sm font-bold tracking-tight">{staff.staff_id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="text-sm font-bold">{staff.designation?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Award className="h-4 w-4" />
                                    <span className="text-sm font-bold">{staff.department?.name}</span>
                                </div>
                            </div>
                        </div>
                        
                        {isAdmin && (
                            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <div className={infoLabelClass}>Monthly Salary</div>
                                <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                                    ₹{staff.monthly_salary?.toLocaleString()}
                                    <ShieldCheck className="h-4 w-4 opacity-30" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Column 1: Personal & Education */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className={sectionHeaderClass}><User className="h-3 w-3" /> Personal Records</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <div className={infoLabelClass}>Father's Name</div>
                                <div className={infoValueClass}>{staff["father's_name"]}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Mother's Name</div>
                                <div className={infoValueClass}>{staff.mother_name || "N/A"}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className={infoLabelClass}>Gender</div>
                                    <div className={infoValueClass + " capitalize"}>{staff.gender}</div>
                                </div>
                                <div>
                                    <div className={infoLabelClass}>Marital Status</div>
                                    <div className={infoValueClass + " capitalize"}>{staff.marital_status}</div>
                                </div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Date of Birth</div>
                                <div className={infoValueClass}>{staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : "N/A"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className={sectionHeaderClass}><Languages className="h-3 w-3" /> Language & Identity</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <div className={infoLabelClass}>Mother Tongue</div>
                                <div className={infoValueClass}>{staff.mother_tongue}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Proficiency</div>
                                <div className={infoValueClass}>{staff.regional_language_proficiency || "Standard"}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Aadhar Number</div>
                                <div className={infoValueClass}>{staff.aadhar_number || "XXXXXXXXXXXX"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Contact & Employment */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className={sectionHeaderClass}><Phone className="h-3 w-3" /> Contact Details</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className={infoLabelClass}>Mobile</div>
                                    <div className={infoValueClass}>{staff.mobile}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <div className={infoLabelClass}>Email</div>
                                    <div className={infoValueClass}>{staff.email}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 pt-2">
                                <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <div className={infoLabelClass}>Address</div>
                                    <div className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                                        {staff.address}<br/>
                                        {staff.city}, {staff.state} - {staff.pincode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className={sectionHeaderClass}><Calendar className="h-3 w-3" /> Employment Info</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <div className={infoLabelClass}>Staff Type</div>
                                <div className={infoValueClass + " capitalize"}>{staff.staff_type?.replace('_', ' ')}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Date of Joining</div>
                                <div className={infoValueClass}>{staff.date_of_joining ? new Date(staff.date_of_joining).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Portal Login</div>
                                <Badge className={staff.is_login_enabled ? "bg-emerald-500" : "bg-slate-400"}>
                                    {staff.is_login_enabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Professional & Compliance */}
                <div className="space-y-8">
                    {/* ID Card Preview */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                        <h3 className={sectionHeaderClass}><IdCard className="h-3 w-3" /> ID Card Preview</h3>
                        
                        <div className="relative w-full aspect-[1/1.58] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mx-auto max-w-[240px]">
                            {/* Card Header */}
                            <div className="bg-slate-900 h-16 flex flex-col items-center justify-center p-2">
                                <div className="flex items-center gap-1">
                                    <div className="h-4 w-4 bg-white rounded flex items-center justify-center">
                                        <Award className="h-2 w-2 text-slate-900" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Edu Maysan</span>
                                </div>
                                <span className="text-[6px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-0.5">Staff Identity</span>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex flex-col items-center text-center space-y-3">
                                <Avatar className="h-20 w-20 border-2 border-slate-100 shadow-md">
                                    <AvatarImage src={staff.photo_url} className="object-cover" />
                                    <AvatarFallback className="bg-emerald-50 text-emerald-700 font-black text-xl">
                                        {staff.first_name[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <div className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">
                                        {staff.first_name} {staff.last_name}
                                    </div>
                                    <div className="text-[8px] font-bold text-emerald-600 uppercase mt-1">
                                        {staff.designation?.name}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-100" />

                                <div className="grid grid-cols-1 gap-2 w-full text-left px-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] font-black text-slate-400 uppercase">ID No:</span>
                                        <span className="text-[7px] font-bold text-slate-900 font-mono">{staff.staff_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] font-black text-slate-400 uppercase">Dept:</span>
                                        <span className="text-[7px] font-bold text-slate-900">{staff.department?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] font-black text-slate-400 uppercase">DOJ:</span>
                                        <span className="text-[7px] font-bold text-slate-900">{staff.date_of_joining ? new Date(staff.date_of_joining).toLocaleDateString() : "N/A"}</span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="pt-2">
                                    <div className="h-6 w-24 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                                        <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#ccc_2px,#ccc_3px)] opacity-50" />
                                    </div>
                                    <span className="text-[5px] font-bold text-slate-400 uppercase mt-1 block">Barcoded Secure ID</span>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="absolute -bottom-8 -right-8 opacity-[0.03] rotate-12">
                                <Award className="h-32 w-32" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className={sectionHeaderClass}><Award className="h-3 w-3" /> Qualifications</h3>
                        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
                            <div className="text-indigo-900 dark:text-indigo-400 font-black text-sm mb-2">Primary Qualification</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {staff.highest_qualification}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className={infoLabelClass}>Other Skills / Languages</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {staff.languages_known?.map((lang: string) => (
                                    <Badge key={lang} variant="secondary" className="bg-slate-100 text-slate-700 border-none">
                                        {lang}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className={sectionHeaderClass}><ShieldCheck className="h-3 w-3" /> Banking & Tax</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <div className={infoLabelClass}>PAN Number</div>
                                <div className={infoValueClass}>{staff.pan_number || "N/A"}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>Bank Account</div>
                                <div className={infoValueClass}>{staff.bank_account || "XXXXXXXXXXXX"}</div>
                            </div>
                            <div>
                                <div className={infoLabelClass}>IFSC Code</div>
                                <div className={infoValueClass}>{staff.ifsc_code || "N/A"}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
