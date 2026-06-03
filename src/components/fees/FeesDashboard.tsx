"use client";
import { useMemo, useState } from "react";
import {
    IndianRupee,
    CreditCard,
    TrendingUp,
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
import { Input } from "@/components/ui/input";
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
    const [activeTab, setActiveTab] = useState("fees");

    useRealtimeSync(["payments", "fee_structures", "fee_assignments"]);

    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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

    const [feeForm, setFeeForm] = useState({
        name: "",
        amount: "",
        due_date: "",
        class_id: "",
        fee_type: "tuition",
        description: "",
    });

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
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Action Bar */}
            {!isStudent && (
                <div className="flex items-center justify-end gap-4 mb-10 border-b border-slate-200 pb-8">
                    <button onClick={() => setIsPaymentOpen(true)} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                        <CreditCard className="mr-2 h-4 w-4 inline" />
                        Record Payment
                    </button>

                    <button onClick={() => setIsAddFeeOpen(true)} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                        <Plus className="mr-2 h-4 w-4 inline" />
                        Add New Fee
                    </button>
                </div>
            )}

            {/* Record Payment Modal */}
            {isPaymentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                        <div className="mb-6">
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Record <span className="text-emerald-600">Payment</span></h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Manual Payment Entry</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Student</label>
                                <select value={payForm.student_id} onChange={(e) => setPayForm({ ...payForm, student_id: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.profile?.full_name} ({s.admission_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Fee Structure</label>
                                <select value={payForm.fee_id} onChange={(e) => setPayForm({ ...payForm, fee_id: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                    <option value="">Select Fee</option>
                                    {fees.map((f) => (
                                        <option key={f.id} value={f.id}>{f.name} — ₹{f.amount}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Amount (₹)</label>
                                    <Input type="number" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} className="bg-white border-slate-200 h-11 font-bold text-sm" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Payment Method</label>
                                    <select value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                        {["cash", "card", "upi", "bank_transfer", "cheque", "online"].map((m) => (
                                            <option key={m} value={m}>{m.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleRecordPayment} disabled={loading} className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                                {loading ? "PROCESSING..." : "RECORD PAYMENT"}
                            </button>
                            <button onClick={() => setIsPaymentOpen(false)} className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all hover:bg-slate-50">
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Fee Modal */}
            {isAddFeeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                        <div className="mb-6">
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Create <span className="text-emerald-600">Fee</span> Structure</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Fee Schema Definition</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Fee Name</label>
                                <Input value={feeForm.name} onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })} className="bg-white border-slate-200 h-11 font-bold text-sm" placeholder="e.g. Annual Tuition Fee" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Amount (₹)</label>
                                    <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} className="bg-white border-slate-200 h-11 font-bold text-sm" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Due Date</label>
                                    <Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} className="bg-white border-slate-200 h-11 font-bold text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Target Class</label>
                                    <select value={feeForm.class_id} onChange={(e) => setFeeForm({ ...feeForm, class_id: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                        <option value="">All Classes</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Category</label>
                                    <select value={feeForm.fee_type} onChange={(e) => setFeeForm({ ...feeForm, fee_type: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                        {["tuition", "transport", "library", "lab", "sports", "other"].map((t) => (
                                            <option key={t} value={t}>{t.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleCreateFee} disabled={loading} className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                                {loading ? "CREATING..." : "CREATE FEE STRUCTURE"}
                            </button>
                            <button onClick={() => setIsAddFeeOpen(false)} className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all hover:bg-slate-50">
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Layer: Institutional Fiscal Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1">
                <div className="md:col-span-8 bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    Collection <span className="text-emerald-600">Matrix</span>
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400/60 mt-3 flex items-center gap-2">
                                    Temporal Revenue Vector Analysis
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Activity className="h-6 w-6 text-emerald-600 opacity-20 group-hover:opacity-100 transition-all" />
                                {dashboardStats?.recovery_percentage && (
                                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20")}>
                                        {dashboardStats.recovery_percentage}% RECOVERY
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={collectionMatrix}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
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
                                    <Area type="monotone" dataKey="amt" stroke="#059669" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-white border border-slate-200 p-8 rounded-xl relative overflow-hidden group space-y-6">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-4">
                            Recent <span className="text-emerald-600">Flow</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Collected Today</span>
                                <span className="text-sm font-black text-slate-900">₹{dashboardStats?.collected_today?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">This Week</span>
                                <span className="text-sm font-black text-slate-900">₹{dashboardStats?.collected_week?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">This Month</span>
                                <span className="text-sm font-black text-slate-900">₹{dashboardStats?.collected_month?.toLocaleString() || "0"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-4">
                            Target <span className="text-emerald-600">Gap</span>
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-emerald-600">{dashboardStats?.recovery_percentage || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                    className="h-full bg-emerald-600 transition-all duration-1000"
                                    style={{ width: `${dashboardStats?.recovery_percentage || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid gap-10 lg:grid-cols-4 reveal-2">
                <div className="bg-white border-2 border-emerald-500/20 p-10 rounded-xl relative overflow-hidden group transition-all duration-700 shadow-2xl">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 mb-6">Fiscal_Revenue</p>
                        <div className="flex items-baseline gap-x-3">
                            <h3 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                                ₹{(dashboardStats?.total_collected || stats.totalRevenue).toLocaleString()}
                            </h3>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-1">Verified Audit</span>
                            <div className="flex items-center gap-x-2 text-emerald-600 font-black text-xs">
                                <TrendingUp className="h-4 w-4" />
                                {dashboardStats?.recovery_percentage ? `${dashboardStats.recovery_percentage}%` : "+12%"}
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                         <BarChart3 className="h-32 w-32 text-emerald-600" />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group transition-all duration-700 hover:border-red-500/40 shadow-sm">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-6">Deficit_Vector</p>
                        <h3 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                            ₹{(dashboardStats?.total_pending || stats.outstanding).toLocaleString()}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400/30 mt-6">Unallocated Receivables</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group transition-all duration-700 hover:border-blue-500/40 shadow-sm">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-6">Institutional_Flow</p>
                        <h3 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                            ₹{stats.staffPayroll.toLocaleString()}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400/30 mt-6">Staff Resource Allocation</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group transition-all duration-700 shadow-sm">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-6">Temporal_Cadence</p>
                        <h3 className="text-5xl font-black tracking-tighter text-slate-900 leading-none underline decoration-amber-500/20 underline-offset-8">
                            {new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase()}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400/30 mt-6">Active Fiscal Cycle</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                    <button onClick={() => setActiveTab("fees")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-x-2", activeTab === "fees" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                        <IndianRupee className="h-3.5 w-3.5" />
                        Fee Overview
                    </button>
                    <button onClick={() => setActiveTab("payments")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-x-2", activeTab === "payments" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                        <CreditCard className="h-3.5 w-3.5" />
                        Transaction History
                    </button>
                    {!isStudent && (
                        <button onClick={() => setActiveTab("payroll")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-x-2", activeTab === "payroll" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                            <Briefcase className="h-3.5 w-3.5" />
                            Staff Payroll
                        </button>
                    )}
                    {!isStudent && (
                        <>
                            <button onClick={() => setActiveTab("family_dues")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-x-2", activeTab === "family_dues" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                                <Users className="h-3.5 w-3.5" />
                                Family Dues
                            </button>
                            <button onClick={() => setActiveTab("class_breakdown")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-x-2", activeTab === "class_breakdown" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                                <BarChart3 className="h-3.5 w-3.5" />
                                Class Breakdown
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tab Content: Fees */}
            {activeTab === "fees" && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Fee Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Target Class</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {fees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <IndianRupee className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No fee structures found</p>
                                    </td>
                                </tr>
                            )}
                            {fees.map((fee) => (
                                <tr key={fee.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-5 font-bold text-slate-900 uppercase tracking-tight text-xs group-hover:text-emerald-600 transition-colors">{fee.name}</td>
                                    <td className="px-8 py-5">
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20")}>{fee.fee_type}</span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 text-sm tracking-tighter group-hover:translate-x-1 transition-transform">₹{fee.amount.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400/60">{fee.due_date}</td>
                                    <td className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400/40">{fee.class?.name || "General"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab Content: Payments */}
            {activeTab === "payments" && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Method</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Receipt ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <CreditCard className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No payments recorded</p>
                                    </td>
                                </tr>
                            )}
                            {payments.map((p) => (
                                <tr key={p.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase tracking-tight text-xs group-hover:text-emerald-600 transition-colors">{p.student?.profile?.full_name}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400/40 mt-1">{p.student?.admission_number}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 text-sm tracking-tighter">₹{p.amount_paid.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-600">{p.payment_method}</td>
                                    <td className="px-8 py-5">
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", p.status === "completed" ? "bg-emerald-500 text-white shadow-sm" : "bg-red-500 text-white")}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400/20">{p.receipt_number || "PENDING"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab Content: Payroll */}
            {activeTab === "payroll" && !isStudent && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Faculty Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Base Salary</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Incentives</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Deductions</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Month/Year</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {staffPayrolls.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Briefcase className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No payroll records found</p>
                                    </td>
                                </tr>
                            )}
                            {staffPayrolls.map((p) => (
                                <tr key={p.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase tracking-tight text-xs group-hover:text-emerald-600 transition-colors">
                                                {p.staff?.first_name} {p.staff?.last_name}
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400/40 mt-1">{p.staff?.employee_id || "STAFF-ID"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 text-sm tracking-tighter transition-transform group-hover:translate-x-1">₹{p.base_salary.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-emerald-500 font-bold text-xs tracking-tighter">+₹{(p.bonuses || 0).toLocaleString()}</td>
                                    <td className="px-8 py-5 text-red-500 font-bold text-xs tracking-tighter">-₹{(p.deductions || 0).toLocaleString()}</td>
                                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400/60">{p.month}/{p.year}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", p.status === "paid" ? "bg-emerald-500 text-white shadow-sm" : "bg-yellow-500 text-white")}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab Content: Family Dues */}
            {activeTab === "family_dues" && !isStudent && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Parent/Guardian</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Phone</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Students</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Total Pending</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {(dashboardStats?.top_pending_families || []).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Users className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending families</p>
                                    </td>
                                </tr>
                            )}
                            {(dashboardStats?.top_pending_families || []).map((fam: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-5 font-bold text-slate-900 uppercase tracking-tight text-xs group-hover:text-emerald-600 transition-colors">{fam.parent_name}</td>
                                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400/60">{fam.phone}</td>
                                    <td className="px-8 py-5">
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", "bg-slate-100 text-slate-600")}>{fam.student_count} STUDENTS</span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-red-500 tracking-tighter">₹{fam.total_pending.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab Content: Class Breakdown */}
            {activeTab === "class_breakdown" && !isStudent && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Class Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Assigned</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Collected</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Pending</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {(dashboardStats?.class_wise_data || []).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <BarChart3 className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No class data available</p>
                                    </td>
                                </tr>
                            )}
                            {(dashboardStats?.class_wise_data || []).map((cls: any, idx: number) => (
                                <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-5 font-bold text-slate-900 uppercase tracking-tight text-xs group-hover:text-emerald-600 transition-colors">{cls.class_name}</td>
                                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-tighter text-slate-500">₹{cls.assigned.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-tighter text-emerald-600">₹{cls.collected.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right font-black text-red-500 tracking-tighter">₹{cls.pending.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
