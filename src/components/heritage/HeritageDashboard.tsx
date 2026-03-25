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
import { Alumni, Student } from "@/types/database";
import { graduateStudent } from "@/app/actions/heritage";
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
import { toast } from "sonner";

export default function HeritageDashboard({ 
    initialAlumni,
    students,
    userRole
}: { 
    initialAlumni: Alumni[],
    students: Student[],
    userRole?: string | null
}) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const [searchTerm, setSearchTerm] = useState("");
    const [isGraduating, setIsGraduating] = useState(false);
    const [open, setOpen] = useState(false);

    const filteredAlumni = initialAlumni.filter((alumnus) =>
        `${alumnus.first_name} ${alumnus.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alumnus.current_profession && alumnus.current_profession.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleGraduate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsGraduating(true);
        const formData = new FormData(e.currentTarget);
        const studentId = formData.get("studentId") as string;
        const year = parseInt(formData.get("year") as string);
        const profession = formData.get("profession") as string;
        const company = formData.get("company") as string;

        try {
            const result = await graduateStudent(studentId, {
                graduation_year: year,
                current_profession: profession,
                company: company
            });

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to execute graduation protocol");
        } finally {
            setIsGraduating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-6">
                    <div className="h-16 w-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg emerald-glow">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                            Institutional Heritage
                        </h2>
                        <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                            Preserving Scholastic Genealogy & Institutional Legacy Protocols
                        </p>
                    </div>
                </div>
                {isAdminOrTeacher && (
                    <div className="flex gap-x-3">
                        <Button
                            variant="outline"
                            className="rounded-sm border-border bg-card/40 backdrop-blur-md font-black gap-x-2 uppercase tracking-widest text-[10px] text-foreground/80 hover:text-primary transition-all shadow-xl h-12 px-6"
                        >
                            <Send className="h-4 w-4" />
                            Campaigns
                        </Button>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow shadow-emerald-500/20 uppercase tracking-widest text-[10px] h-12 px-6">
                                    <Plus className="h-4 w-4" />
                                    Record Graduation
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-card border-primary/20 rounded-sm">
                                <form onSubmit={handleGraduate}>
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-primary">Initialize Graduation Node</DialogTitle>
                                        <DialogDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                                            Transmitting Scholastic Records to Legacy Registry
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Select Student Node</p>
                                            <Select name="studentId" required>
                                                <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                    <SelectValue placeholder="Identify student record..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id} className="text-xs font-bold uppercase tracking-tight">
                                                            {student.profile?.first_name} {student.profile?.last_name} ({student.admission_number})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Class Year</p>
                                                <Input name="year" type="number" defaultValue={new Date().getFullYear()} required className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Profession</p>
                                                <Input name="profession" placeholder="Student" className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Affiliation / Company</p>
                                            <Input name="company" placeholder="Institutional Path..." className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isGraduating}
                                            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] h-14 rounded-sm emerald-glow"
                                        >
                                            {isGraduating ? "EXECUTING PROTOCOL..." : "EXECUTE TRANSITION"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-4 pt-4">
                {/* Alumni Statistics */}
                <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden shadow-2xl group hover:border-primary transition-all emerald-glow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users2 className="h-24 w-24 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 italic">Total Registry Nodes</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{initialAlumni.length}</h3>
                </Card>

                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Endowment Delta</p>
                    <div className="flex items-center gap-x-4">
                        <h3 className="text-4xl font-black text-foreground tracking-tighter italic">₹2.4M</h3>
                        <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                </Card>

                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Scholastic Continuity</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic underline decoration-primary/20 underline-offset-4">84%</h3>
                </Card>

                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 shadow-2xl group hover:border-primary transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 italic">Mentorship Active</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">124</h3>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Alumni Directory */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic flex items-center gap-x-3">
                            <Users className="h-4 w-4" />
                            Genealogy Registry
                        </h3>
                        <div className="flex gap-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                                <Input
                                    placeholder="Search records..."
                                    className="pl-9 h-10 text-xs rounded-sm border-border bg-background/50 text-foreground placeholder:text-foreground/40 focus:ring-primary w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredAlumni.map((alumnus) => (
                                <div
                                    key={alumnus.id}
                                    className="p-8 flex items-center gap-x-8 hover:bg-primary/5 transition-all group border-b border-primary/5 last:border-0"
                                >
                                    <div className="h-20 w-20 rounded-sm bg-background border border-border flex items-center justify-center font-black text-3xl text-foreground/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-md emerald-glow relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 flex items-center justify-center">
                                            <GraduationCap className="h-12 w-12" />
                                        </div>
                                        <span className="relative z-10">{alumnus.first_name[0]}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-x-4 mb-2">
                                            <h4 className="font-black text-foreground text-xl uppercase tracking-tighter italic group-hover:text-primary transition-colors">
                                                {alumnus.first_name} {alumnus.last_name}
                                            </h4>
                                            <Badge className="bg-primary text-primary-foreground border-none font-black text-[9px] px-3 py-1 rounded-sm uppercase tracking-[0.2em] emerald-glow">
                                                GEN_NODE_{alumnus.graduation_year}
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
                                                "text-[10px] font-black border-none bg-emerald-50 text-emerald-600"
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
                            <Heart className="h-20 w-20 fill-emerald-500 text-emerald-500" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-2 text-emerald-400">
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
                                    <div className="h-full bg-emerald-500 w-[72%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-white text-foreground font-black rounded-sm hover:bg-white/90 border-none mt-2 shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px]">
                                LAUNCH CAMPAIGN
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 overflow-hidden">
                        <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Transition Intelligence
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <div className="space-y-4">
                            <div className="p-4 rounded-sm bg-slate-50 border border-border flex items-center gap-x-3">
                                <div className="h-10 w-10 rounded-sm bg-white border border-border flex items-center justify-center text-muted-foreground">
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
                            <div className="p-4 rounded-sm bg-primary/5 border border-primary/10 flex items-center gap-x-3">
                                <div className="h-10 w-10 rounded-sm bg-white border border-primary/20 flex items-center justify-center text-primary">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-primary leading-none mb-1 text-center font-black uppercase tracking-tighter italic">
                                        Auto-Generate Certificates
                                    </p>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-primary h-6 text-[10px] font-black uppercase tracking-[0.2em] p-0 hover:bg-transparent"
                                    >
                                        EXECUTE BATCH →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none glass futuristic-card bg-linear-to-br from-emerald-600 to-emerald-500 text-white p-6 relative group overflow-hidden rounded-sm shadow-2xl">
                        <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent" />
                        <div className="relative z-10 space-y-4">
                            <div className="h-10 w-10 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-lg uppercase italic tracking-tighter">Legacy Mentorship</h4>
                                <p className="text-xs opacity-80 font-medium">
                                    32 Alumni have volunteered for the Tier-1 University Prep
                                    program.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full h-10 border border-white/20 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-white/20"
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

