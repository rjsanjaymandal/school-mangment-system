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
                    <h2 className="text-4xl font-black tracking-tight text-foreground">
                        Finance & Payroll
                    </h2>
                    <p className="text-muted-foreground font-medium tracking-tight">
                        Enterprise Treasury and HR Finance Management
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-2xl border-border bg-white font-bold gap-x-2">
                                <CreditCard className="h-4 w-4" /> Record Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader>
                                <DialogTitle className="font-black text-2xl">Record Payment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Student</Label>
                                    <Select value={payForm.student_id} onValueChange={(v) => setPayForm({ ...payForm, student_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.profile?.first_name} {s.profile?.last_name} ({s.admission_number})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Fee Structure</Label>
                                    <Select value={payForm.fee_id} onValueChange={(v) => setPayForm({ ...payForm, fee_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select fee" /></SelectTrigger>
                                        <SelectContent>
                                            {fees.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.name} — ₹{f.amount}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Amount</Label>
                                        <Input type="number" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Method</Label>
                                        <Select value={payForm.payment_method} onValueChange={(v) => setPayForm({ ...payForm, payment_method: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["cash", "card", "upi", "bank_transfer", "cheque", "online"].map((m) => (
                                                    <SelectItem key={m} value={m}>{m.replace("_", " ").toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleRecordPayment} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold">
                                    {loading ? "Processing..." : "Record Payment"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue">
                                <Plus className="h-4 w-4" /> New Fee Structure
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader>
                                <DialogTitle className="font-black text-2xl">Create Fee Structure</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Fee Name</Label>
                                    <Input value={feeForm.name} onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="Annual Tuition" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Amount (₹)</Label>
                                        <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Due Date</Label>
                                        <Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Class</Label>
                                        <Select value={feeForm.class_id} onValueChange={(v) => setFeeForm({ ...feeForm, class_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Type</Label>
                                        <Select value={feeForm.fee_type} onValueChange={(v) => setFeeForm({ ...feeForm, fee_type: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["tuition", "transport", "library", "lab", "sports", "other"].map((t) => (
                                                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleCreateFee} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold">
                                    {loading ? "Creating..." : "Create Fee Structure"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-6 md:grid-cols-3">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="border-none glass futuristic-card group">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                {stat.title}
                            </p>
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-3xl font-black text-foreground tracking-tighter">
                                    {stat.value}
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-bold ${stat.trend === "up" ? "text-green-500 bg-green-50" : "text-blue-500 bg-blue-50"} border-none`}
                                >
                                    {stat.change}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="fees" className="space-y-6">
                <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14">
                    <TabsTrigger value="fees" className="rounded-xl px-8 py-3 data-[state=active]:bg-card data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <DollarSign className="h-4 w-4" /> Fee Management
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-xl px-8 py-3 data-[state=active]:bg-card data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <CreditCard className="h-4 w-4" /> Payment History
                    </TabsTrigger>
                    <TabsTrigger value="payroll" className="rounded-xl px-8 py-3 data-[state=active]:bg-card data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <Briefcase className="h-4 w-4" /> Staff Payroll
                    </TabsTrigger>
                </TabsList>

                {/* Fee Structures Tab */}
                <TabsContent value="fees" className="space-y-6">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Fee Name</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Type</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Amount</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Due Date</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Class</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {fees.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">No fee structures defined yet. Click "New Fee Structure" to create one.</td></tr>
                                ) : (
                                    fees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-6 px-8 font-bold text-foreground">{fee.name}</td>
                                            <td className="py-6 px-8">
                                                <Badge variant="outline" className="font-bold text-[10px] uppercase">
                                                    {fee.fee_type || "tuition"}
                                                </Badge>
                                            </td>
                                            <td className="py-6 px-8 font-black text-foreground">₹{Number(fee.amount).toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-8 text-muted-foreground font-mono text-xs">{fee.due_date || "—"}</td>
                                            <td className="py-6 px-8 text-muted-foreground font-medium">{fee.class?.name || "All Classes"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-6">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Student</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Fee</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Amount</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Method</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No payments recorded yet.</td></tr>
                                ) : (
                                    payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-6 px-8 flex items-center gap-x-4">
                                                <div className="h-10 w-10 rounded-xl bg-card text-white flex items-center justify-center font-bold neon-blue">
                                                    {(p.student?.profile?.first_name?.[0] || "?")}
                                                </div>
                                                <span className="font-bold text-foreground">
                                                    {p.student?.profile?.first_name} {p.student?.profile?.last_name}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-muted-foreground font-medium">{p.fee?.name || "—"}</td>
                                            <td className="py-6 px-8 font-black text-foreground">₹{Number(p.amount_paid).toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-8">
                                                <Badge variant="outline" className="font-bold text-[10px] uppercase">
                                                    {(p.payment_method || "cash").replace("_", " ")}
                                                </Badge>
                                            </td>
                                            <td className="py-6 px-8">
                                                <Badge variant="outline" className={cn(
                                                    "font-bold text-[10px]",
                                                    p.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                                                        p.status === "pending" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                                            "bg-red-50 text-red-600 border-red-100"
                                                )}>
                                                    {(p.status || "completed").toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-6 px-8 text-muted-foreground font-mono text-xs">{p.receipt_number || "—"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* Payroll Tab */}
                <TabsContent value="payroll" className="space-y-6">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Staff Member</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Base Salary</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Bonuses</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Deductions</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Period</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {staffPayrolls.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No payroll records yet.</td></tr>
                                ) : (
                                    staffPayrolls.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-6 px-8 font-bold text-foreground">
                                                {p.staff?.first_name} {p.staff?.last_name}
                                            </td>
                                            <td className="py-6 px-8 font-black text-foreground">₹{Number(p.base_salary).toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-8 text-green-600 font-bold">+₹{Number(p.bonuses || 0).toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-8 text-red-500 font-bold">-₹{Number(p.deductions || 0).toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-8 text-muted-foreground font-mono text-xs">{p.month}/{p.year}</td>
                                            <td className="py-6 px-8">
                                                <Badge variant="outline" className={cn(
                                                    "font-bold text-[10px]",
                                                    p.status === "paid" ? "bg-green-50 text-green-600 border-green-100" : "bg-yellow-50 text-yellow-600 border-yellow-100"
                                                )}>
                                                    {(p.status || "pending").toUpperCase()}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

