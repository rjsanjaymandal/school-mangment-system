"use client";

import { useState, useMemo } from "react";
import {
    Trophy,
    Users,
    Calendar,
    Zap,
    Star,
    Palette,
    Music,
    Plus,
    Search,
    Flag,
    ArrowRight,
    Dumbbell,
    TrendingUp,
    Activity as ActivityIcon,
} from "lucide-react";
import { 
    AreaChart, Area, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid,
    PieChart, Pie, Cell
} from "recharts";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Activity, Teacher } from "@/types/database";
import { createActivity } from "@/app/actions/activities";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { toast } from "sonner";

const upcomingFixtures = [
    {
        id: "101",
        team: "Edu Maysan Lions (Varsity)",
        opponent: "Green-Valley High",
        sport: "Basketball",
        venue: "North Court",
        time: "Friday, 04:00 PM",
    },
    {
        id: "102",
        team: "Soccer Vanguard",
        opponent: "St. Jude Acad.",
        sport: "Football",
        venue: "Institutional Field",
        time: "Saturday, 10:00 AM",
    },
];

export default function ActivitiesDashboard({ 
    initialActivities,
    teachers,
    userRole,
    isStudent = false
}: { 
    initialActivities: Activity[],
    teachers: Teacher[],
    userRole?: string | null,
    isStudent?: boolean
}) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const [searchTerm, setSearchTerm] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredActivities = initialActivities.filter((activity) =>
        (activity.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (activity.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const participationTrends = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const athletesBase = [78, 85, 72, 90, 82, 88];
        const artistsBase = [52, 48, 60, 55, 62, 58];
        return months.map((m, i) => ({
            name: m,
            Athletes: athletesBase[i],
            Artists: artistsBase[i],
        }));
    }, []);

    const housePerformance = useMemo(() => {
        const categories = ["Sports", "Arts", "Tech", "Social", "Music"];
        const scores = [85, 72, 78, 65, 80];
        return categories.map((c, i) => ({
            subject: c,
            A: scores[i],
            fullMark: 100
        }));
    }, []);

    const activityStats = useMemo(() => ({
        total: initialActivities.length,
        categories: [...new Set(initialActivities.map(a => a.category))].length,
        capacity: initialActivities.reduce((sum, a) => sum + (a.max_participants || 0), 0),
        engagement: initialActivities.length > 0 ? 78 : 0,
    }), [initialActivities]);

    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

    const handleInitialize = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsInitializing(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const result = await createActivity({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                location: formData.get("location") as string || "",
                schedule: formData.get("schedule") as string || "",
                max_participants: parseInt(formData.get("max_participants") as string),
                teacher_in_charge: formData.get("teacher_id") as string || undefined
            });

            if (result.success) {
                toast.success(result.message);
                setShowCreateModal(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to create club/activity");
        } finally {
            setIsInitializing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-6">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg emerald-glow transition-all hover:scale-105">
                        <Trophy className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            Clubs & Activities
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                            School Clubs, Sports and Extra-curricular Activities
                        </p>
                    </div>
                </div>
                {!isStudent && isAdminOrTeacher && (
                    <div className="flex gap-x-4">
                        <button className="h-11 rounded-xl border border-slate-200 bg-white/80 px-6 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm">
                            <Calendar className="h-4 w-4" />
                            Venue Bookings
                        </button>
                        <button onClick={() => setShowCreateModal(true)} className="h-11 rounded-xl bg-emerald-600 text-white px-6 text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Club/Activity
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Activities" value={activityStats.total} icon={Trophy} color="emerald" description="All clubs & activities" />
                <DashboardStatCard title="Categories" value={activityStats.categories} icon={Palette} color="blue" description="Activity categories" />
                <DashboardStatCard title="Total Capacity" value={activityStats.capacity} icon={Users} color="purple" description="Available slots" />
                <DashboardStatCard title="Engagement" value={`${activityStats.engagement}%`} icon={TrendingUp} color="amber" description="Participation rate" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1 w-full relative z-10 mt-10">
                <div className="md:col-span-8 bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900">
                                    Participation <span className="text-blue-500">Matrix</span>
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                    Engagement Over Time
                                </p>
                            </div>
                            <ActivityIcon className="h-6 w-6 text-emerald-500 opacity-20 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={participationTrends}>
                                    <defs>
                                        <linearGradient id="colorAthletes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorArtists" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888870", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888850", fontSize: 10 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                    />
                                    <Area type="monotone" dataKey="Athletes" stroke="#10b981" fillOpacity={1} fill="url(#colorAthletes)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="Artists" stroke="#3b82f6" fillOpacity={1} fill="url(#colorArtists)" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-lg font-black tracking-tight text-slate-900">
                            House <span className="text-blue-500">/</span> Performance
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Competency Distribution</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={housePerformance}>
                                <PolarGrid stroke="#88888820" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#88888860", fontSize: 8, fontWeight: "bold" }} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                />
                                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-x-3">
                            <Flag className="h-4 w-4" />
                            Clubs & Activities Directory
                        </h3>
                        <div className="relative w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <Input
                                placeholder="Search activities..."
                                className="pl-10 rounded-xl h-11 bg-white border-slate-200 font-black text-[10px] uppercase tracking-widest placeholder:text-slate-300 focus:border-emerald-300 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredActivities.map((activity) => (
                            <div key={activity.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 uppercase tracking-widest">
                                        {activity.max_participants || 0} CAP
                                    </span>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-emerald-600 transition-colors">
                                    {activity.name}
                                </h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                    {activity.category || "GENERAL"}
                                </p>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                                            Description
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-600 line-clamp-2">
                                            {activity.description || "Active operations underway"}
                                        </p>
                                    </div>
                                    <button className="w-full text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-emerald-50 transition-all">
                                        VIEW DETAILS <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredActivities.length === 0 && (
                            <div className="col-span-2 text-center text-slate-400 py-10 bg-white border border-slate-200 rounded-xl">
                                No activities match your search.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-x-2">
                        <Dumbbell className="h-4 w-4 text-slate-700" />
                        Sports Fixtures
                    </h3>

                    <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 border-b border-emerald-100 p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                Upcoming Matches
                            </h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingFixtures.map((fix) => (
                                <div key={fix.id} className="p-5 space-y-4 hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                                                {fix.team}
                                            </h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                VS {fix.opponent}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                                                Sport / Location
                                            </span>
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                                {fix.sport} • {fix.venue}
                                            </span>
                                        </div>
                                        <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                            HOME
                                        </span>
                                    </div>
                                    <button className="w-full h-10 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-all">
                                        VIEW DETAILS
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center leading-relaxed">
                                Team rosters are synchronized with student eligibility records.
                            </p>
                        </div>
                    </div>

                    {!isStudent && (
                        <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    Sports Engagement
                                </h4>
                                <TrendingUp className="h-5 w-5 text-emerald-500 animate-pulse" />
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Club Participation</span>
                                        <span className="text-emerald-600">92%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-1000" style={{ width: "92%" }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Athletic Engagement</span>
                                        <span className="text-emerald-600">65%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-500 shadow-sm transition-all duration-1000" style={{ width: "65%" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900">New Club/Activity</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Create a new creative or athletic group</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">&times;</button>
                        </div>
                        <form onSubmit={handleInitialize} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Name</label>
                                <input name="name" required placeholder="E.g., Chess Club" className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                                    <select name="category" required className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                        <option value="">Select...</option>
                                        <option value="Arts">Arts & Culture</option>
                                        <option value="Sports">Athletics</option>
                                        <option value="Tech">Technology</option>
                                        <option value="Social">Social Welfare</option>
                                        <option value="Music">Music</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capacity</label>
                                    <input name="max_participants" type="number" defaultValue={50} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teacher-in-Charge</label>
                                <select name="teacher_id" className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                    <option value="">Select Teacher...</option>
                                    {(teachers || []).map((t) => (<option key={t.id} value={t.id}>{t.profile?.first_name || ''} {t.profile?.last_name || ''}</option>))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
                                <textarea name="description" rows={3} placeholder="Activity description..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none resize-none" />
                            </div>
                            <button type="submit" disabled={isInitializing} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {isInitializing ? "CREATING..." : "Save Club/Activity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
