import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/lib/services/user";
import { 
    User, 
    Mail, 
    Shield, 
    Calendar, 
    UserCircle2, 
    ArrowLeft,
    GraduationCap,
    Clock,
    History
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await UserService.getCurrentProfile();
    const role = profile && !("error" in profile) ? profile.role : "student";

    return (
        <div className="max-w-4xl mx-auto space-y-10 page-fade-in py-8">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Workspace
                </Link>
                <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    User Profile
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden soft-shadow-lg">
                {/* Cover / Accent */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 opacity-90" />
                
                <div className="px-10 pb-12 -mt-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-end gap-x-6">
                            <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-slate-950 p-1.5 border border-slate-200 dark:border-slate-800 shadow-xl">
                                <Avatar className="h-full w-full rounded-[1.75rem] overflow-hidden">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-2xl uppercase">
                                        {profile && !("error" in profile) ? profile.full_name?.[0] : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="pb-2 space-y-1">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                    {profile && !("error" in profile) ? profile.full_name : "User Profile"}
                                </h1>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-x-2 uppercase tracking-widest">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {role} Identity
                                </p>
                            </div>
                        </div>
                        <div className="pb-2">
                             <button className="px-6 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-sm font-bold text-xs tracking-wide uppercase">
                                Edit Details
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
                        {/* Information Sections */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">Personal Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Email Address</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">System Role</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">Institutional Status</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Registration Date</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Account Standing</p>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Active / Verified</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent History / Activity - Placeholder style */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-x-3">
                        <History className="h-5 w-5 text-blue-500" />
                        Recent Access Logs
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                        <div className="flex items-center gap-x-4">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">System Login</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today, 08:24 AM</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
