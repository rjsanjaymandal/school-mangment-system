"use client";
import { useMemo, useState } from "react";
import {
    IndianRupee,
    CreditCard,
    TrendingUp,
    Download,
    Plus,
    Search,
    Users,
    Briefcase,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Activity,
    PieChart as PieIcon,
    BarChart3
} from "lucide-react";
import { 
    AreaChart, Area, 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createFee, recordPayment } from "@/app/actions/fees";
import { createPayroll, processPayroll, submitLeaveRequest, updateLeaveStatus } from "@/app/actions/payroll";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

interface FeesDashboardProps {
    fees: any[];
    payments: any[];
    students: any[];
    classes: any[];
    staffPayrolls: any[];
    leaveRequests: any[];
    isStudent?: boolean;
    stats: {
        totalRevenue: number;
        outstanding: number;
        staffPayroll: number;
    };
    dashboardStats?: any;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function FeesDashboard({
    fees,
    payments,
    students,
    classes,
    staffPayrolls,
    leaveRequests,
    isStudent = false,
    stats,
    dashboardStats,
}: FeesDashboardProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Enable live updates for fee-related tables
    useRealtimeSync(["payments", "fee_structures", "fee_assignments"]);

    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    // --- Financial Intelligence Layer ---
    const collectionMatrix = useMemo(() => {
        const totals = MONTH_LABELS.reduce<Record<string, { name: string; amt: number }>>((acc, month) => {
            acc[month] = { name: month, amt: 0 };
            return acc;
        }, {});

        payments.forEach((payment) => {
            const sourceDate = payment.payment_date || payment.created_at;
            if (!sourceDate) return;

            const month = new Date(sourceDate).toLocaleDateString("en-US", { month: "short" });
            if (!totals[month]) return;

            totals[month].amt += Number(payment.amount_paid || 0);
        });

        return MONTH_LABELS.map((month) => totals[month]);
    }, [payments]);

    const vectorDistribution = useMemo(() => {
        const methodMap: Record<string, number> = {};
        payments.forEach(p => {
            methodMap[p.payment_method] = (methodMap[p.payment_method] || 0) + 1;
        });
        return Object.entries(methodMap).map(([name, value]) => ({ name, value }));
    }, [payments]);

    // Fee form state
    const [feeForm, setFeeForm] = useState({
        name: "",
        amount: "",
        due_date: "",
        class_id: "",
        fee_type: "tuition",
        description: "",
    });

    // Payment form state
    const [payForm, setPayForm] = useState({
        student_id: "",
        fee_id: "",
        amount_paid: "",
        payment_method: "cash",
    });

    const handleCreateFee = async () => {
        setLoading(true);
        const result = await createFee({
            ...feeForm,
            amount: parseFloat(feeForm.amount),
            class_id: feeForm.class_id || undefined,
        });
        setLoading(false);
        if (result.success) {
            setIsAddFeeOpen(false);
            setFeeForm({ name: "", amount: "", due_date: "", class_id: "", fee_type: "tuition", description: "" });
            router.refresh();
        }
    };

    const handleRecordPayment = async () => {
        setLoading(true);
        const result = await recordPayment({
            ...payForm,
            amount_paid: parseFloat(payForm.amount_paid),
        });
        setLoading(false);
        if (result.success) {
            setIsPaymentOpen(false);
            setPayForm({ student_id: "", fee_id: "", amount_paid: "", payment_method: "cash" });
            router.refresh();
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000">
            {/* Action Bar */}
            {!isStudent && (
                <div className="flex items-center justify-end gap-4 mb-10 border-b border-border pb-8">
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 px-8 bg-secondary border border-border text-primary font-bold rounded-lg transition-all uppercase tracking-widest text-[9px] hover:bg-primary hover:text-primary-foreground group">
                                Record Payment
                                <CreditCard className="ml-2 h-4 w-4 group-hover:animate-bounce" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border p-0 overflow-hidden max-w-xl rounded-xl">
                            <div className="p-6 border-b border-border bg-secondary/30">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Record <span className="text-primary">Payment</span></h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 italic">Manual Payment Entry</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Student</Label>
                                    <Select value={payForm.student_id} onValueChange={(v) => setPayForm({ ...payForm, student_id: v })}>
                                        <SelectTrigger className="bg-background border-border h-12 font-bold text-xs uppercase italic"><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold text-[10px] uppercase italic">{s.profile?.full_name} ({s.admission_number})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Fee Structure</Label>
                                    <Select value={payForm.fee_id} onValueChange={(v) => setPayForm({ ...payForm, fee_id: v })}>
                                        <SelectTrigger className="bg-background border-border h-12 font-bold text-xs uppercase italic"><SelectValue placeholder="Select Fee" /></SelectTrigger>
                                        <SelectContent>
                                            {fees.map((f) => (
                                                <SelectItem key={f.id} value={f.id} className="font-bold text-[10px] uppercase italic">{f.name} — ₹{f.amount}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Amount (₹)</Label>
                                        <Input type="number" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} className="bg-background border-border h-12 font-bold text-sm italic" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Payment Method</Label>
                                        <Select value={payForm.payment_method} onValueChange={(v) => setPayForm({ ...payForm, payment_method: v })}>
                                            <SelectTrigger className="bg-background border-border h-12 font-bold text-xs uppercase italic"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["cash", "card", "upi", "bank_transfer", "cheque", "online"].map((m) => (
                                                    <SelectItem key={m} value={m} className="font-bold text-[10px] uppercase italic">{m.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleRecordPayment} disabled={loading} className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-sm transition-all hover:scale-[1.02] rounded-lg">
                                    {loading ? "PROCESSING..." : "RECORD PAYMENT"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-8 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm uppercase tracking-widest text-[9px] transition-all hover:scale-105">
                                Add New Fee
                                <Plus className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border p-0 overflow-hidden max-w-xl rounded-xl">
                            <div className="p-6 border-b border-border bg-secondary/30">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Create <span className="text-primary">Fee</span> Structure</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 italic">Fee Schema Definition</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Fee Name</Label>
                                    <Input value={feeForm.name} onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })} className="bg-background border-border h-12 font-bold text-sm italic focus-visible:ring-primary/50" placeholder="e.g. Annual Tuition Fee" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Amount (₹)</Label>
                                        <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} className="bg-background border-border h-12 font-bold text-sm italic focus-visible:ring-primary/50" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Due Date</Label>
                                        <Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} className="bg-background border-border h-12 font-bold text-sm italic focus-visible:ring-primary/50" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Target Class</Label>
                                        <Select value={feeForm.class_id} onValueChange={(v) => setFeeForm({ ...feeForm, class_id: v })}>
                                            <SelectTrigger className="bg-background border-border h-12 font-bold text-xs uppercase italic focus:ring-primary/50"><SelectValue placeholder="All Classes" /></SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id} className="font-bold text-[10px] uppercase italic">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Category</Label>
                                        <Select value={feeForm.fee_type} onValueChange={(v) => setFeeForm({ ...feeForm, fee_type: v })}>
                                            <SelectTrigger className="bg-background border-border h-12 font-bold text-xs uppercase italic focus:ring-primary/50"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["tuition", "transport", "library", "lab", "sports", "other"].map((t) => (
                                                    <SelectItem key={t} value={t} className="font-bold text-[10px] uppercase italic">{t.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleCreateFee} disabled={loading} className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] shadow-sm transition-all hover:scale-[1.02] rounded-lg">
                                    {loading ? "CREATING..." : "CREATE FEE STRUCTURE"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* --- Analytics Layer: Institutional Fiscal Intelligence --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1">
                <div className="md:col-span-8 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    Collection <span className="text-primary italic">Matrix</span>
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic flex items-center gap-2">
                                    Temporal Revenue Vector Analysis
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Activity className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                                {dashboardStats?.recovery_percentage && (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black italic">
                                        {dashboardStats.recovery_percentage}% RECOVERY
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={collectionMatrix}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888870", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888840", fontSize: 10 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                    />
                                    <Area type="monotone" dataKey="amt" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-card border border-border p-8 rounded-xl relative overflow-hidden group space-y-6">
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground mb-4">
                            Recent <span className="text-primary italic">Flow</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border/50">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground italic">Collected Today</span>
                                <span className="text-sm font-black text-foreground italic">₹{dashboardStats?.collected_today?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border/50">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground italic">This Week</span>
                                <span className="text-sm font-black text-foreground italic">₹{dashboardStats?.collected_week?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border/50">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground italic">This Month</span>
                                <span className="text-sm font-black text-foreground italic">₹{dashboardStats?.collected_month?.toLocaleString() || "0"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground mb-4">
                            Target <span className="text-primary italic">Gap</span>
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase italic mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-primary">{dashboardStats?.recovery_percentage || 0}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000" 
                                    style={{ width: `${dashboardStats?.recovery_percentage || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid gap-10 lg:grid-cols-4 reveal-2">
                <div className="bg-card border-2 border-primary/20 p-10 rounded-xl skew-x-[-6deg] relative overflow-hidden group transition-all duration-700 hover:emerald-border-glow shadow-2xl">
                    <div className="not-skew-x relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 italic">Fiscal_Revenue</p>
                        <div className="flex items-baseline gap-x-3">
                            <h3 className="text-5xl font-black italic tracking-tighter text-foreground leading-none">
                                ₹{(dashboardStats?.total_collected || stats.totalRevenue).toLocaleString()}
                            </h3>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary italic bg-primary/10 px-2 py-1">Verified Audit</span>
                            <div className="flex items-center gap-x-2 text-primary font-black italic text-xs">
                                <TrendingUp className="h-4 w-4" />
                                {dashboardStats?.recovery_percentage ? `${dashboardStats.recovery_percentage}%` : "+12%"}
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-8 -bottom-8 opacity-5 skew-x-[12deg] group-hover:scale-110 transition-transform duration-1000">
                         <BarChart3 className="h-32 w-32 text-primary" />
                    </div>
                </div>

                <div className="bg-card border border-border p-10 rounded-xl skew-x-[-6deg] relative overflow-hidden group transition-all duration-700 hover:border-red-500/40 shadow-sm">
                    <div className="not-skew-x relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-6 italic">Deficit_Vector</p>
                        <h3 className="text-5xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{(dashboardStats?.total_pending || stats.outstanding).toLocaleString()}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-6 italic">Unallocated Receivables</p>
                    </div>
                </div>

                <div className="bg-card border border-border p-10 rounded-xl skew-x-[-6deg] relative overflow-hidden group transition-all duration-700 hover:border-blue-500/40 shadow-sm">
                    <div className="not-skew-x relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-6 italic">Institutional_Flow</p>
                        <h3 className="text-5xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.staffPayroll.toLocaleString()}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-6 italic">Staff Resource Allocation</p>
                    </div>
                </div>

                <div className="bg-card border border-border p-10 rounded-xl skew-x-[-6deg] relative overflow-hidden group transition-all duration-700 shadow-sm">
                    <div className="not-skew-x relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-6 italic">Temporal_Cadence</p>
                        <h3 className="text-5xl font-black italic tracking-tighter text-foreground leading-none underline decoration-amber-500/20 underline-offset-8">
                            {new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase()}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-6 italic">Active Fiscal Cycle</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="fees" className="space-y-10">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <TabsList className="bg-secondary/30 border border-border p-1 rounded-xl h-12 w-fit">
                        <TabsTrigger
                            value="fees"
                            className="rounded-lg px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-widest text-[10px] transition-all gap-x-2"
                        >
                            <IndianRupee className="h-3.5 w-3.5" />
                            Fee Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="payments"
                            className="rounded-lg px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-widest text-[10px] transition-all gap-x-2"
                        >
                            <CreditCard className="h-3.5 w-3.5" />
                            Transaction History
                        </TabsTrigger>
                        {!isStudent && (
                            <TabsTrigger
                                value="payroll"
                                className="rounded-lg px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-widest text-[10px] transition-all gap-x-2"
                            >
                                <Briefcase className="h-3.5 w-3.5" />
                                Staff Payroll
                            </TabsTrigger>
                        )}
                        {!isStudent && (
                            <>
                                <TabsTrigger
                                    value="family_dues"
                                    className="rounded-lg px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-widest text-[10px] transition-all gap-x-2"
                                >
                                    <Users className="h-3.5 w-3.5" />
                                    Family Dues
                                </TabsTrigger>
                                <TabsTrigger
                                    value="class_breakdown"
                                    className="rounded-lg px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-widest text-[10px] transition-all gap-x-2"
                                >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    Class Breakdown
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="fees" className="outline-none">
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Fee Name</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Due Date</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-primary italic">Target Class</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="group hover:bg-secondary/20 transition-all duration-300">
                                        <td className="px-8 py-5 font-bold text-foreground uppercase italic tracking-tight text-xs group-hover:text-primary transition-colors">{fee.name}</td>
                                        <td className="px-8 py-5">
                                            <Badge variant="outline" className="text-[8px] font-bold tracking-widest uppercase border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-lg italic">{fee.fee_type}</Badge>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-foreground text-sm italic tracking-tighter group-hover:translate-x-1 transition-transform">₹{fee.amount.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">{fee.due_date}</td>
                                        <td className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">{fee.class?.name || "General"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="outline-none">
                   <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Method</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-primary italic">Receipt ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.map((p) => (
                                    <tr key={p.id} className="group hover:bg-secondary/20 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground uppercase italic tracking-tight text-xs group-hover:text-primary transition-colors">{p.student?.profile?.full_name}</span>
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1 italic">{p.student?.admission_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-foreground text-sm italic tracking-tighter">₹{p.amount_paid.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">{p.payment_method}</td>
                                        <td className="px-8 py-5">
                                            <Badge className={cn(
                                                "text-[8px] font-bold tracking-widest uppercase rounded-lg px-3 py-1",
                                                p.status === "completed" ? "bg-emerald-500 text-white shadow-sm" : "bg-red-500 text-white"
                                            )}>
                                                {p.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">{p.receipt_number || "PENDING"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                
                <TabsContent value="payroll" className="outline-none">
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Faculty Name</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Base Salary</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Incentives</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Deductions</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Month/Year</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-primary italic">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {staffPayrolls.map((p) => (
                                    <tr key={p.id} className="group hover:bg-secondary/20 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground uppercase italic tracking-tight text-xs group-hover:text-primary transition-colors">
                                                    {p.staff?.first_name} {p.staff?.last_name}
                                                </span>
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1 italic">{p.staff?.employee_id || "STAFF-ID"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-foreground text-sm italic tracking-tighter transition-transform group-hover:translate-x-1">₹{p.base_salary.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-emerald-500 font-bold text-xs italic tracking-tighter">+₹{(p.bonuses || 0).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-red-500 font-bold text-xs italic tracking-tighter">-₹{(p.deductions || 0).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">{p.month}/{p.year}</td>
                                        <td className="px-8 py-5 text-right">
                                            <Badge className={cn(
                                                "text-[8px] font-bold tracking-widest uppercase rounded-lg px-3 py-1",
                                                p.status === "paid" ? "bg-emerald-500 text-white shadow-sm" : "bg-yellow-500 text-white"
                                            )}>
                                                {p.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                
                {!isStudent && (
                    <>
                        <TabsContent value="family_dues" className="outline-none">
                            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Parent/Guardian</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Phone</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Students</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-primary italic">Total Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {(dashboardStats?.top_pending_families || []).map((fam: any, idx: number) => (
                                            <tr key={idx} className="group hover:bg-secondary/20 transition-all duration-300">
                                                <td className="px-8 py-5 font-bold text-foreground uppercase italic tracking-tight text-xs group-hover:text-primary transition-colors">{fam.parent_name}</td>
                                                <td className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">{fam.phone}</td>
                                                <td className="px-8 py-5">
                                                    <Badge variant="secondary" className="text-[8px] font-black italic">{fam.student_count} STUDENTS</Badge>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-red-500 italic tracking-tighter">₹{fam.total_pending.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        <TabsContent value="class_breakdown" className="outline-none">
                            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Class Name</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Assigned</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Collected</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-primary italic">Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {(dashboardStats?.class_wise_data || []).map((cls: any, idx: number) => (
                                            <tr key={idx} className="group hover:bg-secondary/20 transition-all duration-300">
                                                <td className="px-8 py-5 font-bold text-foreground uppercase italic tracking-tight text-xs group-hover:text-primary transition-colors">{cls.class_name}</td>
                                                <td className="px-8 py-5 text-[10px] font-bold uppercase italic tracking-tighter text-muted-foreground">₹{cls.assigned.toLocaleString()}</td>
                                                <td className="px-8 py-5 text-[10px] font-bold uppercase italic tracking-tighter text-emerald-600">₹{cls.collected.toLocaleString()}</td>
                                                <td className="px-8 py-5 text-right font-black text-red-500 italic tracking-tighter">₹{cls.pending.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}

