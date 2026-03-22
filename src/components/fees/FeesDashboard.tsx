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

    const statCards = [
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
            change: "+14%",
            trend: "up",
            color: "blue",
        },
        {
            title: "Outstanding",
            value: `₹${stats.outstanding.toLocaleString("en-IN")}`,
            change: stats.outstanding > 0 ? "Pending" : "Clear",
            trend: stats.outstanding > 0 ? "down" : "up",
            color: "purple",
        },
        {
            title: "Staff Payroll",
            value: `₹${stats.staffPayroll.toLocaleString("en-IN")}`,
            change: `${staffPayrolls.length} records`,
            trend: "up",
            color: "indigo",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 mb-4">
                        <span className="h-1.5 w-1.5 rounded-sm bg-primary animate-pulse shadow-sm shadow-primary/50" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Treasury Live</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Finance & Payroll</h2>
                    <p className="text-foreground/60 font-medium tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">Enterprise Treasury and HR Finance Management</p>
                </div>
                <div className="flex gap-x-4">
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-sm border-primary/20 bg-background font-black uppercase tracking-[0.2em] px-8 py-6 h-auto text-[11px] gap-x-2 hover:bg-primary/5 hover:border-primary/40 transition-all">
                                <CreditCard className="h-4 w-4" /> Record Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border border-border max-w-lg rounded-sm p-0 overflow-hidden">
                            <div className="bg-card/40 p-6 border-b border-border">
                                <DialogTitle className="font-black text-2xl uppercase tracking-tight">Record Transaction</DialogTitle>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Append new payment node to ledger</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Personnel / Student</Label>
                                    <Select value={payForm.student_id} onValueChange={(v) => setPayForm({ ...payForm, student_id: v })}>
                                        <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11">
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 border-border">
                                            {students.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold uppercase text-[10px]">
                                                    {s.profile?.first_name} {s.profile?.last_name} ({s.admission_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Fee Structure Node</Label>
                                    <Select value={payForm.fee_id} onValueChange={(v) => setPayForm({ ...payForm, fee_id: v })}>
                                        <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11">
                                            <SelectValue placeholder="Select fee" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 border-border">
                                            {fees.map((f) => (
                                                <SelectItem key={f.id} value={f.id} className="font-bold uppercase text-[10px]">
                                                    {f.name} — ₹{f.amount}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Amount (INR)</Label>
                                        <Input type="number" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} placeholder="0.00" className="rounded-sm bg-background/50 border-border font-black text-sm h-11" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Protocol (Method)</Label>
                                        <Select value={payForm.payment_method} onValueChange={(v) => setPayForm({ ...payForm, payment_method: v })}>
                                            <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-card/90 border-border">
                                                {["cash", "card", "upi", "bank_transfer", "cheque", "online"].map((m) => (
                                                    <SelectItem key={m} value={m} className="font-bold uppercase text-[10px]">{m.replace("_", " ").toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleRecordPayment} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow shadow-xl text-[11px] mt-2">
                                    {loading ? "Processing..." : "Commit Transaction"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] px-8 py-6 h-auto text-[11px] gap-x-2 emerald-glow shadow-2xl">
                                <Plus className="h-4 w-4" /> New Fee Structure
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border border-border max-w-lg rounded-sm p-0 overflow-hidden">
                            <div className="bg-card/40 p-6 border-b border-border">
                                <DialogTitle className="font-black text-2xl uppercase tracking-tight">Initialize Fee Node</DialogTitle>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Configure institutional revenue structure</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Fee Name</Label>
                                    <Input value={feeForm.name} onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="e.g. Annual Tuition" className="rounded-sm bg-background/50 border-border font-bold uppercase text-xs h-11" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Amount (₹)</Label>
                                        <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="0.00" className="rounded-sm bg-background/50 border-border font-black text-sm h-11" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Maturity Date (Due)</Label>
                                        <Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} className="rounded-sm bg-background/50 border-border font-bold h-11" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Sector</Label>
                                        <Select value={feeForm.class_id} onValueChange={(v) => setFeeForm({ ...feeForm, class_id: v })}>
                                            <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11"><SelectValue placeholder="All Classes" /></SelectTrigger>
                                            <SelectContent className="bg-card/90 border-border">
                                                {classes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id} className="font-bold uppercase text-[10px]">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Classification</Label>
                                        <Select value={feeForm.fee_type} onValueChange={(v) => setFeeForm({ ...feeForm, fee_type: v })}>
                                            <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-card/90 border-border">
                                                {["tuition", "transport", "library", "lab", "sports", "other"].map((t) => (
                                                    <SelectItem key={t} value={t} className="font-bold uppercase text-[10px]">{t.replace("_", " ").toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleCreateFee} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow shadow-xl text-[11px] mt-2">
                                    {loading ? "Initializing..." : "Commit Fee Structure"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-6 md:grid-cols-3">
                {statCards.map((stat) => (
                    <div key={stat.title} className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 relative z-10">
                            {stat.title}
                        </p>
                        <div className="flex items-baseline justify-between relative z-10">
                            <h3 className="text-3xl font-black text-foreground tracking-tighter">
                                {stat.value}
                            </h3>
                            <div className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-sm font-black text-[9px] uppercase tracking-widest",
                                stat.trend === "up" ? "bg-primary/10 text-primary border border-primary/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            )}>
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="fees" className="space-y-6">
                <TabsList className="bg-card/40 backdrop-blur-xl border border-border p-1 rounded-sm h-14 w-fit">
                    <TabsTrigger value="fees" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow">
                        <DollarSign className="h-4 w-4" /> Treasury Node
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2">
                        <CreditCard className="h-4 w-4" /> Transaction Log
                    </TabsTrigger>
                    <TabsTrigger value="payroll" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2">
                        <Briefcase className="h-4 w-4" /> Staff Payroll
                    </TabsTrigger>
                </TabsList>

                {/* Fee Structures Tab */}
                <TabsContent value="fees" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Structure Name</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Classification</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Amount (INR)</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Maturity Date</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Target Sector</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {fees.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">No Treasury structures initialized.</td></tr>
                                    ) : (
                                        fees.map((fee) => (
                                            <tr key={fee.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-6 px-8">
                                                    <span className="font-black text-foreground uppercase tracking-tight text-xs">{fee.name}</span>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <div className="inline-flex items-center px-2 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 font-black text-[9px] uppercase tracking-widest">
                                                        {fee.fee_type || "tuition"}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 font-black text-foreground text-sm tracking-tight italic">₹{Number(fee.amount).toLocaleString("en-IN")}</td>
                                                <td className="py-6 px-8 text-foreground/40 font-black text-[10px] tracking-widest">{fee.due_date || "—"}</td>
                                                <td className="py-6 px-8">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{fee.class?.name || "Global / Core"}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Personnel / Student</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Node Origin</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Transaction Vol</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Protocol</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Ledger Status</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Receipt ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payments.length === 0 ? (
                                        <tr><td colSpan={6} className="py-20 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">No transaction records found.</td></tr>
                                    ) : (
                                        payments.map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-6 px-8 flex items-center gap-x-4">
                                                    <div className="h-10 w-10 rounded-sm bg-card text-white flex items-center justify-center font-black text-[10px] shadow-lg border border-primary/20">
                                                        {(p.student?.profile?.first_name?.[0] || "?")}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground uppercase text-[11px] tracking-tight">{p.student?.profile?.first_name} {p.student?.profile?.last_name}</span>
                                                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{p.student?.admission_number}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 font-black text-foreground/60 text-[10px] uppercase tracking-widest">{p.fee?.name || "—"}</td>
                                                <td className="py-6 px-8 font-black text-foreground text-sm italic tracking-tight">₹{Number(p.amount_paid).toLocaleString("en-IN")}</td>
                                                <td className="py-6 px-8">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{(p.payment_method || "cash").replace("_", " ")}</span>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <div className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest",
                                                        p.status === "completed" ? "bg-primary/10 text-primary border border-primary/20" :
                                                            p.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                                                                "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    )}>
                                                        {(p.status || "completed")}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 text-foreground/40 font-black text-[10px] tracking-widest">{p.receipt_number || "NO-LEID"}</td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Payroll Tab */}
                <TabsContent value="payroll" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Staff Personnel</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Base Cap</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Incentives</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Deductions</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Interval (M/Y)</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {staffPayrolls.length === 0 ? (
                                        <tr><td colSpan={6} className="py-20 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">No payroll records detected.</td></tr>
                                    ) : (
                                        staffPayrolls.map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-6 px-8">
                                                    <span className="font-black text-foreground uppercase text-[11px] tracking-tight">{p.staff?.first_name} {p.staff?.last_name}</span>
                                                </td>
                                                <td className="py-6 px-8 font-black text-foreground text-sm italic tracking-tight">₹{Number(p.base_salary).toLocaleString("en-IN")}</td>
                                                <td className="py-6 px-8 text-primary font-black text-[11px] tracking-tighter hover:scale-105 transition-transform">+₹{Number(p.bonuses || 0).toLocaleString("en-IN")}</td>
                                                <td className="py-6 px-8 text-red-500 font-black text-[11px] tracking-tighter hover:scale-105 transition-transform">-₹{Number(p.deductions || 0).toLocaleString("en-IN")}</td>
                                                <td className="py-6 px-8 text-foreground/40 font-black text-[10px] tracking-widest uppercase">{p.month}/{p.year}</td>
                                                <td className="py-6 px-8">
                                                    <div className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest",
                                                        p.status === "paid" ? "bg-primary/10 text-primary border border-primary/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                                    )}>
                                                        {(p.status || "pending")}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

