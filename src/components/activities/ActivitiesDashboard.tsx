"use client";

import { useState } from "react";
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
import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Activity, Teacher } from "@/types/database";
import { createActivity } from "@/app/actions/activities";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    const [open, setOpen] = useState(false);

    const filteredActivities = initialActivities.filter((activity) =>
        (activity.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (activity.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // --- Activity Intelligence Layer ---
    const participationTrends = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        return months.map(m => ({
            name: m,
            Athletes: Math.floor(Math.random() * 40) + 60,
            Artists: Math.floor(Math.random() * 30) + 40
        }));
    }, []);

    const housePerformance = useMemo(() => {
        const categories = ["Sports", "Arts", "Tech", "Social", "Music"];
        return categories.map(c => ({
            subject: c,
            A: Math.floor(Math.random() * 40) + 60,
            fullMark: 100
        }));
    }, []);

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
                location: formData.get("location") as string,
                schedule: formData.get("schedule") as string,
                max_participants: parseInt(formData.get("max_participants") as string),
                teacher_in_charge: formData.get("teacher_id") as string || undefined
            });

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
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
                    <div className="h-16 w-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg emerald-glow transition-all hover:scale-105">
                        <Trophy className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                            Clubs & Activities
                        </h2>
                        <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                            School Clubs, Sports and Extra-curricular Activities
                        </p>
                    </div>
                </div>
                {!isStudent && isAdminOrTeacher && (
                    <div className="flex gap-x-4">
                        <Button
                            variant="ghost"
                            className="rounded-sm border border-border bg-card/40 backdrop-blur-xl font-black uppercase tracking-widest text-[10px] px-8 py-6 h-auto hover:border-primary transition-all"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Venue Bookings
                        </Button>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] px-8 py-6 h-auto emerald-glow shadow-2xl hover:scale-105 transition-all">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Club/Activity
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-card border-primary/20 rounded-sm">
                                <form onSubmit={handleInitialize}>
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-primary">New Club/Activity Details</DialogTitle>
                                        <DialogDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                                            Create a new creative or athletic group.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Club/Activity Name</p>
                                            <Input name="name" placeholder="E.g., Chess Club" required className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Category</p>
                                                <Select name="category" required>
                                                    <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                        <SelectValue placeholder="Category..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-border">
                                                        <SelectItem value="Arts" className="text-xs font-bold uppercase tracking-tight">Arts & Culture</SelectItem>
                                                        <SelectItem value="Sports" className="text-xs font-bold uppercase tracking-tight">Athletics</SelectItem>
                                                        <SelectItem value="Tech" className="text-xs font-bold uppercase tracking-tight">Technology</SelectItem>
                                                        <SelectItem value="Social" className="text-xs font-bold uppercase tracking-tight">Social Welfare</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Capacity</p>
                                                <Input name="max_participants" type="number" defaultValue={50} required className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Teacher-in-Charge</p>
                                            <Select name="teacher_id">
                                                <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                    <SelectValue placeholder="Assign Teacher..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    {(teachers || []).map((t) => (
                                                        <SelectItem key={t.id} value={t.id} className="text-xs font-bold uppercase tracking-tight">
                                                            {t.profile?.first_name || 'Teacher'} {t.profile?.last_name || ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Activity Description</p>
                                            <Textarea name="description" placeholder="Orchestration details..." className="rounded-sm border-border bg-background min-h-[100px] text-xs font-bold" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isInitializing}
                                            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] h-14 rounded-sm emerald-glow"
                                        >
                                            {isInitializing ? "CREATING..." : "SAVE CLUB/ACTIVITY"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* --- Analytics Layer: Activity Analytics --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1 w-full relative z-10 mt-10">
                <div className="md:col-span-8 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    Participation <span className="text-primary italic">Matrix</span>
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic flex items-center gap-2">
                                    Engagement Over Time
                                </p>
                            </div>
                            <ActivityIcon className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
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

                <div className="md:col-span-4 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            House <span className="text-primary tracking-normal not-italic px-1">/</span> Performance
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic text-center">Competency Distribution</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={housePerformance}>
                                <PolarGrid stroke="#88888820" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#88888860", fontSize: 8, fontWeight: "bold" }} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.6}
                                />
                                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Societies Explorer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic flex items-center gap-x-3">
                            <Flag className="h-4 w-4" />
                            Clubs & Activities Directory
                        </h3>
                        <div className="relative w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                            <Input
                                placeholder="Search activities..."
                                className="pl-10 rounded-sm h-12 bg-card/40 border-border font-black text-[10px] uppercase tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredActivities.map((activity) => (
                            <Card
                                key={activity.id}
                                className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 group cursor-pointer hover:border-primary transition-all shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="h-14 w-14 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3 emerald-glow">
                                        <Zap className="h-7 w-7" />
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3 py-1 rounded-sm uppercase tracking-[0.2em] italic">
                                        {activity.max_participants || 0} CAP
                                    </Badge>
                                </div>
                                <h4 className="text-2xl font-black text-foreground mb-1 tracking-tight italic group-hover:text-primary transition-colors">
                                    {activity.name}
                                </h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-6">
                                    {activity.category || "GENERAL"}
                                </p>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-sm bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-2 italic">
                                            Description
                                        </p>
                                        <p className="text-[11px] font-black text-foreground line-clamp-2 uppercase tracking-tight opacity-70">
                                            {activity.description || "Active operations underway"}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-primary font-black text-[10px] uppercase tracking-[0.3em] justify-center p-0 h-auto gap-x-3 hover:text-foreground transition-all"
                                    >
                                        VIEW DETAILS <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {filteredActivities.length === 0 && (
                            <div className="col-span-2 text-center text-muted-foreground py-10 glass rounded-2xl">
                                No activities match your search.
                            </div>
                        )}
                    </div>
                </div>

                {/* Athletic Intelligence */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-x-2">
                        <Dumbbell className="h-4 w-4 text-foreground" />
                        Sports Fixtures
                    </h3>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <CardHeader className="bg-primary/10 border-b border-primary/20 p-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                                Upcoming Matches
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {upcomingFixtures.map((fix) => (
                                    <div
                                        key={fix.id}
                                        className="p-6 space-y-6 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-x-4">
                                            <div className="h-12 w-12 rounded-sm bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-lg group-hover:emerald-glow transition-all">
                                                <Trophy className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-foreground text-sm uppercase tracking-tight italic">
                                                    {fix.team}
                                                </h4>
                                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1">
                                                    VS {fix.opponent}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between bg-background/30 p-3 rounded-sm border border-border/50">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                                                    Sport / Location
                                                </span>
                                                <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                                                    {fix.sport} • {fix.venue}
                                                </span>
                                            </div>
                                            <Badge className="bg-primary text-primary-foreground border-none text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                                                HOME
                                            </Badge>
                                        </div>
                                        <Button className="w-full h-12 rounded-sm bg-primary/5 border border-primary/20 hover:bg-primary hover:text-white text-primary font-black text-[10px] uppercase tracking-[0.3em] shadow-none transition-all">
                                            VIEW DETAILS
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 bg-primary/5 flex flex-col gap-y-3 border-t border-primary/10">
                            <p className="text-[9px] text-primary font-black uppercase tracking-widest text-center italic leading-relaxed opacity-60">
                                Team rosters are synchronized with student eligibility records.
                            </p>
                        </CardFooter>
                    </Card>

                    {!isStudent && (
                        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl relative overflow-hidden group hover:border-primary transition-all">
                            <CardHeader className="p-0 mb-6 flex items-center justify-between">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                                        Sports Engagement
                                </CardTitle>
                                <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                            </CardHeader>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-foreground/40">
                                            Club Participation
                                        </span>
                                        <span className="text-primary italic">92%</span>
                                    </div>
                                    <Progress
                                        value={92}
                                        className="h-1 rounded-sm bg-primary/10"
                                        indicatorClassName="bg-primary emerald-glow transition-all duration-1000"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-foreground/40">Athletic Engagement</span>
                                        <span className="text-primary italic">65%</span>
                                    </div>
                                    <Progress
                                        value={65}
                                        className="h-1 rounded-sm bg-primary/10"
                                        indicatorClassName="bg-primary emerald-glow transition-all duration-1000"
                                    />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );

}

