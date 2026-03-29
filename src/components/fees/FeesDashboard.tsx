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

            {/* Metric Grid */}
            <div className="grid gap-10 lg:grid-cols-3">
                <div className="bg-card border border-border p-8 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                        <TrendingUp className="h-32 w-32 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 italic">Total Revenue</p>
                    <div className="relative z-10 flex items-baseline gap-x-3">
                        <h3 className="text-6xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.totalRevenue.toLocaleString()}
                        </h3>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-[8px] uppercase tracking-widest italic">+14%</Badge>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full mt-8 overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: '82%' }} />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-3 italic">Finalized Collection</p>
                </div>

                <div className="bg-card border border-border p-8 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm hover:border-red-500/40">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-6 italic">Outstanding Invoices</p>
                    <div className="relative z-10 flex items-baseline gap-x-3">
                        <h3 className="text-6xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.outstanding.toLocaleString()}
                        </h3>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full mt-8 overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${Math.min(100, (stats.outstanding / stats.totalRevenue) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-3 italic">Pending Payments</p>
                </div>

                <div className="bg-card border border-border p-8 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 italic">Staff Payroll</p>
                    <div className="relative z-10 flex items-baseline gap-x-3">
                        <h3 className="text-6xl font-black italic tracking-tighter text-foreground leading-none">
                            ₹{stats.staffPayroll.toLocaleString()}
                        </h3>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full mt-8 overflow-hidden text-center flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-primary mr-2" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Monthly Outflow</span>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-3 italic">Institutional Expenses</p>
                </div>
            </div>

            <Tabs defaultValue="fees" className="space-y-10">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <TabsList className="bg-secondary/30 border border-border p-1 rounded-xl h-12 w-fit">
                        <TabsTrigger
                            value="fees"
                            className="rounded-lg px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-widest text-[10px] transition-all gap-x-2"
                        >
                            <DollarSign className="h-3.5 w-3.5" />
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
            </Tabs>
        </div>
    );
}

