import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/lib/services/user";
import { 
    Mail, 
    Shield, 
    Calendar, 
    UserCircle2, 
    Clock,
    Phone,
    MapPin
} from "lucide-react";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ERPCard } from "@/components/ui/erp-card";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await UserService.getCurrentProfile(supabase);
    const role = profile && !("error" in profile) ? profile.role : "student";
    const fullName = profile && !("error" in profile) ? profile.full_name : "User Profile";

    return (
        <div className="animate-in fade-in duration-700 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>Settings</span>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white font-bold">Profile</span>
                </div>
                <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all">
                    <UserCircle2 className="h-4 w-4 mr-2 inline" />
                    Edit Profile
                </button>
            </div>

            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">My Profile</h1>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Overview Card */}
                <ERPCard accentColor="emerald" className="lg:col-span-1">
                    <div className="flex flex-col items-center p-6">
                        <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 p-2 border-2 border-emerald-200 mb-4">
                            <Avatar className="h-full w-full rounded-full">
                                <AvatarImage src={profile && !("error" in profile) ? profile.avatar_url : ""} />
                                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-3xl">
                                    {fullName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                {fullName}
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                                    {role}
                                </span>
                            </div>
                        </div>
                        <div className="w-full pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Active</p>
                            </div>
                            <div className="text-center border-l border-slate-100 dark:border-slate-800 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Joined</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {new Date(user.created_at).getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>
                </ERPCard>

                {/* Contact & Personal Info */}
                <div className="lg:col-span-2 space-y-6">
                    <ERPCard accentColor="blue" title="Contact Information" icon={<Mail className="h-5 w-5 text-blue-600" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile && !("error" in profile) ? profile.phone || "Not set" : "Not set"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Address</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile && !("error" in profile) ? profile.address || "Not set" : "Not set"}</p>
                                </div>
                            </div>
                        </div>
                    </ERPCard>

                    <ERPCard accentColor="purple" title="Account Details" icon={<Shield className="h-5 w-5 text-purple-600" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Role</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Created At</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Last Login</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </ERPCard>
                </div>
            </div>
        </div>
    );
}