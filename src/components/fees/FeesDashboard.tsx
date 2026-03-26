"use client";

import { useState } from "react";
import {
    DollarSign,
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
} from "lucide-react";
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
}

export function FeesDashboard({
    fees,
    payments,
    students,
    classes,
    staffPayrolls,
    leaveRequests,
    isStudent = false,
    stats,
}: FeesDashboardProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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
                <div className="flex items-center justify-end gap-6 mb-12 border-b border-white/5 pb-8">
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-14 px-10 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 font-black rounded-sm transition-all uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg] hover:bg-emerald-500 hover:text-white group">
                                <span className="not-skew-x flex items-center gap-x-3">
                                    Record Transaction
                                    <CreditCard className="h-4 w-4 group-hover:animate-bounce" />
                                </span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-white/10 p-0 overflow-hidden max-w-xl">
                            <div className="p-8 bg-white/5 border-b border-white/10">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Initiate <span className="text-emerald-500">Liquidation</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 mt-2">Protocol: Manual Revenue Injection</p>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Personnel Node (Student)</Label>
                                    <Select value={payForm.student_id} onValueChange={(v) => setPayForm({ ...payForm, student_id: v })}>
                                        <SelectTrigger className="glass-card border-white/10 h-14 font-black text-xs uppercase italic skew-x-[-8deg]"><SelectValue placeholder="Select Target Node" /></SelectTrigger>
                                        <SelectContent className="glass-panel">
                                            {students.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="font-black text-[10px] uppercase italic">{s.profile?.full_name} ({s.admission_number})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Financial Structure Node</Label>
                                    <Select value={payForm.fee_id} onValueChange={(v) => setPayForm({ ...payForm, fee_id: v })}>
                                        <SelectTrigger className="glass-card border-white/10 h-14 font-black text-xs uppercase italic skew-x-[-8deg]"><SelectValue placeholder="Select Fee Schema" /></SelectTrigger>
                                        <SelectContent className="glass-panel">
                                            {fees.map((f) => (
                                                <SelectItem key={f.id} value={f.id} className="font-black text-[10px] uppercase italic">{f.name} — ₹{f.amount}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Transaction Volume</Label>
                                        <Input type="number" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} className="glass-card border-white/10 h-14 font-black text-sm italic skew-x-[-8deg]" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Payment Protocol</Label>
                                        <Select value={payForm.payment_method} onValueChange={(v) => setPayForm({ ...payForm, payment_method: v })}>
                                            <SelectTrigger className="glass-card border-white/10 h-14 font-black text-xs uppercase italic skew-x-[-8deg]"><SelectValue /></SelectTrigger>
                                            <SelectContent className="glass-panel">
                                                {["cash", "card", "upi", "bank_transfer", "cheque", "online"].map((m) => (
                                                    <SelectItem key={m} value={m} className="font-black text-[10px] uppercase italic">{m.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleRecordPayment} disabled={loading} className="w-full h-20 bg-emerald-500 text-white font-black uppercase tracking-[0.4em] text-[11px] skew-x-[-12deg] shadow-[0_0_50px_oklch(var(--emerald-500)/0.3)] transition-all hover:scale-[1.02]">
                                    {loading ? "COMMITTING..." : "COMMIT LIQUIDATION"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-10 bg-emerald-500 text-white font-black rounded-sm shadow-[0_0_40px_oklch(var(--emerald-500)/0.2)] emerald-border-glow uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg] transition-all hover:scale-105">
                                <span className="not-skew-x flex items-center gap-x-3">
                                    Initialize Fee Node
                                    <Plus className="h-4 w-4" />
                                </span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-white/10 p-0 overflow-hidden max-w-xl">
                            <div className="p-8 bg-white/5 border-b border-white/10">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">Initialize <span className="text-emerald-500">Revenue</span> Node</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 mt-2">Protocol: Financial Schema Definition</p>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Structure Identity (Name)</Label>
                                    <Input value={feeForm.name} onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })} className="glass-card border-white/10 h-14 font-black text-sm italic skew-x-[-8deg] focus-visible:ring-emerald-500/50" placeholder="e.g. ANNUAL TUITION MATRIX" />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Financial Weight (₹)</Label>
                                        <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} className="glass-card border-white/10 h-14 font-black text-sm italic skew-x-[-8deg] focus-visible:ring-emerald-500/50" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Maturity Date (Due)</Label>
                                        <Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} className="glass-card border-white/10 h-14 font-black text-sm italic skew-x-[-8deg] focus-visible:ring-emerald-500/50" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Target Sector</Label>
                                        <Select value={feeForm.class_id} onValueChange={(v) => setFeeForm({ ...feeForm, class_id: v })}>
                                            <SelectTrigger className="glass-card border-white/10 h-14 font-black text-xs uppercase italic skew-x-[-8deg] focus:ring-emerald-500/50"><SelectValue placeholder="All Matrix Nodes" /></SelectTrigger>
                                            <SelectContent className="glass-panel border-white/10">
                                                {classes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id} className="font-black text-[10px] uppercase italic focus:bg-emerald-500/20">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Classification</Label>
                                        <Select value={feeForm.fee_type} onValueChange={(v) => setFeeForm({ ...feeForm, fee_type: v })}>
                                            <SelectTrigger className="glass-card border-white/10 h-14 font-black text-xs uppercase italic skew-x-[-8deg] focus:ring-emerald-500/50"><SelectValue /></SelectTrigger>
                                            <SelectContent className="glass-panel border-white/10">
                                                {["tuition", "transport", "library", "lab", "sports", "other"].map((t) => (
                                                    <SelectItem key={t} value={t} className="font-black text-[10px] uppercase italic focus:bg-emerald-500/20">{t.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleCreateFee} disabled={loading} className="w-full h-20 bg-emerald-500 text-white font-black uppercase tracking-[0.4em] text-[11px] skew-x-[-12deg] shadow-[0_0_50px_oklch(var(--emerald-500)/0.3)] transition-all hover:scale-[1.02]">
                                    {loading ? "INITIALIZING NODE..." : "INITIALIZE STRUCTURE"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* Metric Grid */}
            <div className="grid gap-12 lg:grid-cols-3">
                <div className="glass-card p-10 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                        <TrendingUp className="h-48 w-48 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-8 italic">Revenue Pulse</p>
                    <div className="relative z-10 flex items-baseline gap-x-4">
                        <h3 className="text-7xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.totalRevenue.toLocaleString()}
                        </h3>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[8px] uppercase tracking-widest italic">+14% SIG</Badge>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full mt-10 overflow-hidden">
                        <div className="h-full bg-emerald-500 shadow-[0_0_20px_oklch(var(--emerald-500))] transition-all duration-1000" style={{ width: '82%' }} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mt-4 italic">Total Processed Revenue</p>
                </div>

                <div className="glass-card p-10 relative overflow-hidden group hover:border-red-500/40 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-8 italic">Outstanding Flux</p>
                    <div className="relative z-10 flex items-baseline gap-x-4">
                        <h3 className="text-7xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.outstanding.toLocaleString()}
                        </h3>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full mt-10 overflow-hidden">
                        <div className="h-full bg-red-500 shadow-[0_0_20px_oklch(var(--red-500))] transition-all duration-1000" style={{ width: `${Math.min(100, (stats.outstanding / stats.totalRevenue) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mt-4 italic">Unliquidated Debt Nodes</p>
                </div>

                <div className="glass-card p-10 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-8 italic">Faculty Payouts</p>
                    <div className="relative z-10 flex items-baseline gap-x-4">
                        <h3 className="text-7xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.staffPayroll.toLocaleString()}
                        </h3>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full mt-10 overflow-hidden text-center">
                        <TrendingUp className="h-4 w-4 text-emerald-500 inline mr-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Liquidation Ready</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mt-4 italic">Monthly Institutional Outflow</p>
                </div>
            </div>

            <Tabs defaultValue="fees" className="space-y-12 reveal-1">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-sm h-14 w-fit">
                        <TabsTrigger
                            value="fees"
                            className="rounded-xs px-10 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
                        >
                            <DollarSign className="h-4 w-4 not-skew-x" />
                            Revenue Registry
                        </TabsTrigger>
                        <TabsTrigger
                            value="payments"
                            className="rounded-xs px-10 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
                        >
                            <CreditCard className="h-4 w-4 not-skew-x" />
                            Transaction Matrix
                        </TabsTrigger>
                        {!isStudent && (
                            <TabsTrigger
                                value="payroll"
                                className="rounded-xs px-10 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
                            >
                                <Briefcase className="h-4 w-4 not-skew-x" />
                                Payroll Ledger
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="fees" className="animate-in slide-in-from-bottom-2 duration-700 outline-none">
                    <div className="glass-panel p-2 rounded-sm border border-white/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Structure Name</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Classification</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Financial Scope</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Maturity Date</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Sector Target</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="group hover:bg-white/5 transition-all duration-500">
                                        <td className="px-10 py-6 font-black text-foreground uppercase italic tracking-tight text-xs group-hover:text-emerald-500 transition-colors">{fee.name}</td>
                                        <td className="px-10 py-6">
                                            <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-4 py-1 rounded-none italic">{fee.fee_type}</Badge>
                                        </td>
                                        <td className="px-10 py-6 font-black text-foreground text-sm italic tracking-tighter group-hover:scale-105 origin-left transition-transform">₹{fee.amount.toLocaleString()}</td>
                                        <td className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">{fee.due_date}</td>
                                        <td className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-foreground/30 italic">{fee.class?.name || "Matrix Core"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="animate-in slide-in-from-bottom-2 duration-700 outline-none hover:cursor-crosshair">
                   {/* Similar Registry Table for Payments */}
                   <div className="glass-panel p-2 rounded-sm border border-white/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Personnel Node</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Volume</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Protocol</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Status</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Ledger ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.map((p) => (
                                    <tr key={p.id} className="group hover:bg-white/5 transition-all duration-500">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground uppercase italic tracking-tight text-xs group-hover:text-emerald-500 transition-colors">{p.student?.profile?.full_name}</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30 mt-1 italic">{p.student?.admission_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-black text-foreground text-sm italic tracking-tighter">₹{p.amount_paid.toLocaleString()}</td>
                                        <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">{p.payment_method}</td>
                                        <td className="px-10 py-6">
                                            <Badge className={cn(
                                                "text-[8px] font-black tracking-widest uppercase rounded-none skew-x-[-12deg] px-4 py-1",
                                                p.status === "completed" ? "bg-emerald-500 text-white shadow-[0_0_20px_oklch(var(--emerald-500)/0.4)]" : "bg-red-500 text-white"
                                            )}>
                                                <span className="not-skew-x">{p.status}</span>
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">{p.receipt_number || "NO-REID"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                
                <TabsContent value="payroll" className="animate-in slide-in-from-bottom-2 duration-700 outline-none">
                    <div className="glass-panel p-2 rounded-sm border border-white/10 overflow-hidden shadow-2xl shadow-emerald-500/5">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Personnel Node</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Base Liquid</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Incentives</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Deductions</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Interval</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium tracking-tight">
                                {staffPayrolls.map((p) => (
                                    <tr key={p.id} className="group hover:bg-white/5 transition-all duration-500">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground uppercase italic tracking-tight text-xs group-hover:text-emerald-500 transition-colors">
                                                    {p.staff?.first_name} {p.staff?.last_name}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30 mt-1 italic">{p.staff?.employee_id || "STAFF-NODE"}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-black text-foreground text-sm italic tracking-tighter group-hover:scale-105 origin-left transition-transform">₹{p.base_salary.toLocaleString()}</td>
                                        <td className="px-10 py-6 text-emerald-500 font-black text-xs italic tracking-tighter self-center group-hover:translate-x-1 transition-transform">+₹{(p.bonuses || 0).toLocaleString()}</td>
                                        <td className="px-10 py-6 text-red-500 font-black text-xs italic tracking-tighter self-center group-hover:-translate-x-1 transition-transform">-₹{(p.deductions || 0).toLocaleString()}</td>
                                        <td className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">{p.month}/{p.year}</td>
                                        <td className="px-10 py-6 text-right">
                                            <Badge className={cn(
                                                "text-[8px] font-black tracking-widest uppercase rounded-none skew-x-[-12deg] px-4 py-1",
                                                p.status === "paid" ? "bg-emerald-500 text-white shadow-[0_0_20px_oklch(var(--emerald-500)/0.4)]" : "bg-yellow-500 text-white"
                                            )}>
                                                <span className="not-skew-x">{p.status}</span>
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

