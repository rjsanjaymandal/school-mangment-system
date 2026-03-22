"use client";

import { useState } from "react";
import {
    GraduationCap,
    Users,
    Heart,
    Award,
    TrendingUp,
    Search,
    Plus,
    Filter,
    Users2,
    Building2,
    Send,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Alumni } from "@/types/database";

export default function HeritageDashboard({ initialAlumni }: { initialAlumni: Alumni[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAlumni = initialAlumni.filter((alumnus) =>
        `${alumnus.first_name} ${alumnus.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alumnus.current_profession && alumnus.current_profession.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <div className="h-14 w-14 rounded-2xl bg-card border border-white/10 flex items-center justify-center text-white neon-purple">
                        <GraduationCap className="h-7 w-7 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-foreground">
                            Alumni Directory
                        </h2>
                        <p className="text-muted-foreground font-medium tracking-tight">
                            Preserving Legacy & Community Engagement for Edu Maysan Alumni
                        </p>
                    </div>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        variant="outline"
                        className="rounded-2xl border-border bg-white font-bold gap-x-2"
                    >
                        <Send className="h-4 w-4" />
                        Campaigns
                    </Button>
                    <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-purple shadow-purple-500/20">
                        <Plus className="h-4 w-4" />
                        Record Graduation
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {/* Alumni Statistics */}
                <Card className="border-none glass futuristic-card p-6 bg-linear-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users2 className="h-24 w-24 text-purple-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                        Total Alumni
                    </p>
                    <h3 className="text-3xl font-black mt-2 text-white">{initialAlumni.length}</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-purple-300">
                        Recorded in Database
                    </div>
                </Card>

                <Card className="border-none glass futuristic-card p-6 border-purple-100 bg-purple-50/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                        Endowment Yields
                    </p>
                    <h3 className="text-3xl font-black mt-2 text-foreground">₹2.4M</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-purple-600">
                        <TrendingUp className="h-4 w-4" />
                        +18% Annual Growth
                    </div>
                </Card>

                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Higher Ed. Placement
                    </p>
                    <h3 className="text-3xl font-black mt-2 text-foreground">84%</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-500">
                        Tier-1 University Entry
                    </div>
                </Card>

                <Card className="border-none glass futuristic-card p-6 border-blue-100 bg-blue-50/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                        Mentorship Active
                    </p>
                    <h3 className="text-3xl font-black mt-2 text-foreground">124</h3>
                    <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-400">
                        Institutional Guides
                    </div>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Alumni Directory */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-x-2">
                            <Users className="h-4 w-4" />
                            Alumni Directory
                        </h3>
                        <div className="flex gap-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search alumni..."
                                    className="pl-9 h-9 text-xs rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-9 border-border"
                            >
                                <Filter className="h-3 w-3 mr-2" />
                                Refine
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredAlumni.map((alumnus) => (
                                <div
                                    key={alumnus.id}
                                    className="p-6 flex items-center gap-x-6 hover:bg-slate-50 transition-all group"
                                >
                                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-2xl text-muted-foreground group-hover:bg-purple-900 group-hover:text-white transition-all shadow-inner">
                                        {alumnus.first_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-x-3 mb-1">
                                            <h4 className="font-black text-foreground text-lg">
                                                {alumnus.first_name} {alumnus.last_name}
                                            </h4>
                                            <Badge className="bg-card text-white border-none font-black text-[10px] px-2 py-0.5">
                                                CLASS OF {alumnus.graduation_year}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-x-4 text-xs font-bold text-muted-foreground tracking-tight">
                                            <span className="flex items-center gap-x-1">
                                                <Building2 className="h-3 w-3" />
                                                {alumnus.company || "Unknown Company"}
                                            </span>
                                            <span className="flex items-center gap-x-1">
                                                <Award className="h-3 w-3" />
                                                {alumnus.current_profession || "Alumnus"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-y-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] font-black border-none bg-purple-50 text-purple-600"
                                            )}
                                        >
                                            ALUMNUS
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl font-black text-[10px] uppercase text-blue-500 p-0 h-auto hover:bg-transparent"
                                        >
                                            Connect Profile →
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredAlumni.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No alumni found matching your search.
                                </div>
                            )}
                        </div>
                        {filteredAlumni.length > 0 && (
                            <CardFooter className="bg-slate-50 p-4 flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase text-muted-foreground">
                                    Showing all records
                                </p>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                {/* Global Legacy Map & Donors */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Alumni Controls
                    </h3>

                    <Card className="border-none glass futuristic-card bg-card text-white p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Heart className="h-20 w-20 fill-purple-500 text-purple-500" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-2 text-purple-400">
                            Alumni Fund
                        </h4>
                        <p className="text-xs opacity-60 font-medium leading-relaxed">
                            A new endowment campaign for the **Neural Research Wing** is
                            active. Target: ₹500,000.
                        </p>
                        <div className="mt-6 flex flex-col gap-y-3">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="opacity-60">Completion</span>
                                    <span>72%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-purple-500 w-[72%] shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-white text-foreground font-black rounded-xl hover:bg-white/90 border-none mt-2 shadow-xl shadow-purple-900/40">
                                LAUNCH CAMPAIGN
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-none glass futuristic-card p-6 overflow-hidden">
                        <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Transition Intelligence
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-border flex items-center gap-x-3">
                                <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground">
                                    <Users2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Next Batch
                                    </h5>
                                    <p className="text-xs font-bold text-foreground leading-none">
                                        Class of 2024 (182 Students)
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-x-3">
                                <div className="h-10 w-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-500">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-blue-900 leading-none mb-1 text-center">
                                        Auto-Generate Certificates
                                    </p>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-blue-700 h-6 text-[10px] font-black uppercase tracking-[0.2em] p-0 hover:bg-transparent"
                                    >
                                        EXECUTE BATCH →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none glass futuristic-card bg-linear-to-br from-purple-600 to-purple-500 text-white p-6 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent" />
                        <div className="relative z-10 space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-lg">Legacy Mentorship</h4>
                                <p className="text-xs opacity-80 font-medium">
                                    32 Alumni have volunteered for the Tier-1 University Prep
                                    program.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full h-10 border border-white/20 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20"
                            >
                                MATCH MENTORS
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

