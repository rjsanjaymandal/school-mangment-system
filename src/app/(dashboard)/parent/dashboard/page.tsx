import { createClient } from "@/lib/supabase/server";
import { InstitutionalService } from "@/lib/services/institutional";
import { getSessionRole } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Baby, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Activity,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ParentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch children linked to this guardian
  const { data: childrenLinks } = await supabase
    .from("guardian_students")
    .select("student_id, student:students(*, grade:grades(name))")
    .eq("guardian_id", user?.id);

  const children = childrenLinks?.map(link => link.student) || [];

  return (
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
            <div>
                <div className="flex items-center gap-x-3 mb-4">
                    <div className="px-3 py-1 rounded-sm bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 flex items-center gap-x-2">
                        <ShieldCheck className="h-3 w-3 animate-pulse" />
                        Guardian Node: Verified
                    </div>
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest italic text-purple-500/50">Matrix: Parental Supervision</span>
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                    Insight <span className="text-purple-500 tracking-normal not-italic">/</span> Hub
                </h2>
                <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
                    <Baby className="h-3 w-3 text-purple-500" />
                    Real-time Academic & Welfare Telemetry
                </p>
            </div>
        </div>

        {children.length === 0 ? (
            <div className="p-32 text-center space-y-8 glass-card">
                <div className="h-32 w-32 rounded-sm bg-purple-500/5 border border-purple-500/10 flex items-center justify-center mx-auto text-purple-500/20 skew-x-[-12deg]">
                    <Baby className="h-16 w-16 not-skew-x" />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-foreground/30 uppercase tracking-[0.2em] italic">No Linking Detected</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 mt-6 max-w-sm mx-auto leading-loose italic">
                        No student profiles are currently mapped to this guardian node. Please contact the administrative registry.
                    </p>
                </div>
            </div>
        ) : (
            <div className="space-y-12">
                {children.map((child: any) => (
                    <div key={child.id} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between border-b border-white/5 pb-8">
                            <div className="flex items-center gap-x-8">
                                <div className="h-24 w-24 rounded-sm bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-2xl skew-x-[-12deg] group hover:bg-purple-500 transition-all duration-500">
                                    <Baby className="h-12 w-12 text-purple-500 group-hover:text-white not-skew-x transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-4xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                                        {child.full_name}
                                    </h4>
                                    <div className="flex items-center gap-x-4 mt-3">
                                        <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-500 font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-none">
                                            Grade {child.grade?.name}
                                        </Badge>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 italic">ID: {child.admission_number}</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="h-14 px-10 bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500 text-purple-500 hover:text-white font-black rounded-sm transition-all uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg]">
                                <span className="not-skew-x flex items-center gap-x-3">
                                    Full Telemetry
                                    <TrendingUp className="h-4 w-4" />
                                </span>
                            </Button>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-4">
                            {/* Attendance Pulse */}
                            <div className="glass-card p-10 space-y-8 group transition-all duration-700 hover:border-purple-500">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 italic">Attendance Pulse</p>
                                    <Activity className="h-4 w-4 text-purple-500 animate-bounce" />
                                </div>
                                <div className="flex items-baseline gap-x-3">
                                    <h3 className="text-6xl font-black tracking-tighter text-foreground italic leading-none">94<span className="text-purple-500/30 not-italic tracking-normal">%</span></h3>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[8px] uppercase tracking-widest">STABLE</Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 shadow-[0_0_20px_oklch(var(--purple-500))] transition-all duration-1000" style={{ width: '94%' }} />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 text-right italic">Last Activity: Yesterday</p>
                                </div>
                            </div>

                            {/* Academic Vector */}
                            <div className="glass-card p-10 space-y-8 group transition-all duration-700 hover:border-purple-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 italic">Academic Vector</p>
                                <div className="flex items-baseline gap-x-3">
                                    <h3 className="text-6xl font-black tracking-tighter text-foreground italic leading-none">3.8<span className="text-purple-500/30 not-italic tracking-normal text-3xl">GPA</span></h3>
                                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 italic">Rank: Top 5% of Matrix</p>
                            </div>

                            {/* Financial Ledger */}
                            <div className="glass-card p-10 space-y-8 group transition-all duration-700 hover:border-purple-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 italic">Financial Ledger</p>
                                <div className="flex items-baseline gap-x-3">
                                    <h3 className="text-5xl font-black tracking-tighter text-foreground-p italic leading-none tracking-normal">₹12.5k</h3>
                                    <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 font-black text-[8px] uppercase tracking-widest">PENDING</Badge>
                                </div>
                                <Button className="w-full bg-purple-500 text-white font-black rounded-sm h-12 uppercase tracking-[0.3em] text-[8px] skew-x-[-12deg] shadow-[0_0_30px_oklch(var(--purple-500)/0.2)]">
                                    <span className="not-skew-x">Liquidate Due</span>
                                </Button>
                            </div>

                            {/* Communication Port */}
                            <div className="glass-card p-10 space-y-8 group transition-all duration-700 hover:border-purple-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 italic">Communication Port</p>
                                <div className="flex -space-x-3">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="h-12 w-12 rounded-sm bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-xl skew-x-[-12deg] hover:z-10 hover:bg-purple-500 transition-all">
                                            <GraduationCap className="h-5 w-5 text-purple-500 hover:text-white not-skew-x" />
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full border-purple-500/20 text-purple-500 font-black rounded-sm h-12 uppercase tracking-[0.3em] text-[8px] skew-x-[-12deg] hover:bg-purple-500/5">
                                    <span className="not-skew-x flex items-center gap-x-3 justify-center">
                                        <MessageSquare className="h-3 w-3" />
                                        Secure Channel
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}

