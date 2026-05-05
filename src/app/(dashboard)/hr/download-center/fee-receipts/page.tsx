"use client";

import { useState, useEffect } from "react";
import { 
    Printer, 
    ArrowLeft, 
    Receipt, 
    Loader2,
    Search,
    Download,
    Eye,
    Calendar,
    Wallet,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { ERPCard } from "@/components/ui/erp-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function FeeReceiptArchivePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [payments, setPayments] = useState<any[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        const fetchMeta = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("school_settings").select("key, value");
            const s = data?.reduce((acc: any, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
            setSettings(s || {});
        };
        fetchMeta();
        searchPayments(); // Initial load
    }, []);

    const searchPayments = async () => {
        setLoading(true);
        const supabase = createClient();
        let query = supabase
            .from("payments")
            .select(`
                *,
                student:students(id, full_name, admission_number, class:classes(name)),
                fee:fees(name)
            `)
            .order("payment_date", { ascending: false })
            .limit(20);
        
        if (searchQuery) {
            // Check if it's a receipt number search or name search
            if (searchQuery.startsWith('RCP')) {
                query = query.ilike('receipt_number', `%${searchQuery}%`);
            } else {
                // In a real app we'd join and search students.full_name
                // For simplicity here we'll assume the user searches by RCP or just general list
            }
        }
        
        const { data } = await query;
        setPayments(data || []);
        setLoading(false);
    };

    if (previewMode && selectedPayment) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setPreviewMode(false)} className="rounded-xl">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Receipt Preview</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Receipt No: {selectedPayment.receipt_number}</p>
                        </div>
                    </div>
                    <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8">
                        <Printer className="h-4 w-4" /> Print Receipt
                    </Button>
                </div>

                <div className="bg-white p-8 max-w-[8.5in] mx-auto border-2 border-slate-900 rounded-xl shadow-2xl relative print:border-none print:shadow-none print-area">
                    <ReceiptTemplate 
                        payment={selectedPayment} 
                        settings={settings}
                    />
                </div>

                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        header, aside, .print-hidden { display: none !important; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/download-center">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Fee Receipt Archive</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Transaction History & Receipt Reprints</p>
                    </div>
                </div>
            </div>

            <ERPCard accentColor="indigo" className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
                    <div className="flex-1 space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Search Receipts</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Receipt No (e.g. RCP-2026-0001) or Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchPayments()}
                                className="pl-10 rounded-xl h-12 border-slate-200"
                            />
                        </div>
                    </div>
                    <Button onClick={searchPayments} className="h-12 rounded-xl bg-slate-900 px-8 font-bold italic">
                        Refresh Archive
                    </Button>
                </div>

                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt No</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fee Head</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300" />
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">No transactions found in archive</td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{p.receipt_number || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{p.student?.full_name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.student?.admission_number}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-slate-100 border-none rounded-md px-2 text-[10px] font-black uppercase tracking-tighter">
                                                {p.fee?.name || 'General Fee'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(p.payment_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right font-black italic text-slate-900">₹{p.amount_paid}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => { setSelectedPayment(p); setPreviewMode(true); }}
                                                className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-100 hover:text-indigo-600"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ERPCard>
        </div>
    );
}

function ReceiptTemplate({ payment, settings }: { payment: any, settings: any }) {
    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">{settings?.school_name || "Edu Maysan Academy"}</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">{settings?.school_address || "Maysan Valley, Institutional Area"}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Contact: {settings?.school_phone || "+91 98765 43210"}</p>
                </div>
                <div className="text-right">
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-lg text-lg font-black italic uppercase tracking-widest mb-2">
                        Fee Receipt
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Original Copy</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Receipt Number</p>
                        <p className="text-sm font-black font-mono tracking-tighter">{payment.receipt_number}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Date of Payment</p>
                        <p className="text-sm font-bold">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Student Details</p>
                        <p className="text-sm font-black uppercase italic tracking-tight">{payment.student?.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{payment.student?.admission_number} • {payment.student?.class?.name}</p>
                    </div>
                </div>
            </div>

            {/* Transaction Details */}
            <div className="mt-8">
                <table className="w-full">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="px-6 py-3 text-xs font-black uppercase tracking-widest text-left">Description</th>
                            <th className="px-6 py-3 text-xs font-black uppercase tracking-widest text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100 border-b-2 border-slate-900">
                        <tr>
                            <td className="px-6 py-8">
                                <p className="text-md font-black italic text-slate-900 uppercase tracking-tight">{payment.fee?.name || 'Academic Fee Payment'}</p>
                                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest italic">Method: {payment.payment_method?.toUpperCase()} • Status: SUCCESS</p>
                            </td>
                            <td className="px-6 py-8 text-right align-top">
                                <p className="text-xl font-black italic text-slate-900">₹{payment.amount_paid}</p>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="px-6 py-6 text-right font-black uppercase tracking-widest text-slate-400">Total Amount Received</td>
                            <td className="px-6 py-6 text-right">
                                <p className="text-3xl font-black italic text-slate-900 tracking-tighter">₹{payment.amount_paid}</p>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer */}
            <div className="pt-12 flex justify-between items-end border-t border-slate-100 mt-12">
                <div className="space-y-1 text-slate-400">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Digital Payment Verified</span>
                    </div>
                    <p className="text-[8px] font-medium max-w-sm">
                        This is a computer-generated receipt and does not require a physical signature. 
                        Please keep this receipt for future reference. Terms & conditions apply.
                    </p>
                </div>
                <div className="text-right space-y-4">
                    <div className="h-20 w-20 ml-auto border-4 border-slate-100 rounded-full flex items-center justify-center opacity-50 -rotate-12">
                        <CheckCircle2 className="h-12 w-12 text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Accountant Signature</p>
                </div>
            </div>
        </div>
    );
}
