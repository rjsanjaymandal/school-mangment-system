import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/lib/services/user";
import { 
    Mail, 
    Shield, 
    Calendar, 
    UserCircle2, 
    Clock,
    History,
    Edit,
    Globe,
    Phone,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await UserService.getCurrentProfile();
    const role = profile && !("error" in profile) ? profile.role : "student";
    const fullName = profile && !("error" in profile) ? profile.full_name : "User Profile";

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
            <PageHeader
                title="Identity Hub"
                description="Manage your personal profile and institutional credentials."
                icon={UserCircle2}
            >
                <Button className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
                    <Edit className="h-4 w-4" />
                    Edit Details
                </Button>
            </PageHeader>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Profile Overview Card */}
                <Card className="card-premium rounded-[2.5rem] p-10 lg:col-span-1 space-y-8 flex flex-col items-center text-center">
                    <div className="h-32 w-32 rounded-[2.5rem] bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <Avatar className="h-full w-full rounded-[2rem]">
                            <AvatarImage src={profile && !("error" in profile) ? profile.avatar_url : ""} />
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-4xl">
                                {fullName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {fullName}
                        </h2>
                        <div className="flex items-center justify-center gap-x-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {role} Identity
                            </p>
                        </div>
                    </div>
                    <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-x-6">
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Verified</p>
                        </div>
                        <div className="text-center border-l border-slate-100 dark:border-slate-800 pl-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {new Date(user.created_at).getFullYear()}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Information Sections */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="card-premium rounded-[2.5rem] p-10 space-y-10">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    Contact Matrix
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-x-5">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Primary Email</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-5">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mobile Contact</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {profile && !("error" in profile) ? profile.phone || "Not specified" : "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    Access Protocol
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-x-5">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">System Permissions</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{role} Authority</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-5">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Regional Scope</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Main Campus / Cloud Gateway</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="card-premium rounded-[2.5rem] p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-x-3">
                                <History className="h-5 w-5 text-blue-500" />
                                Neural Access Logs
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all">
                                <div className="flex items-center gap-x-4">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-sm">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Active Session Entry</p>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
