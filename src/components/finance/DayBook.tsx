"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Calendar, Filter, Download, 
  ArrowUpRight, ArrowDownRight, Wallet, Building,
  Search, BarChart3, Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

export function DayBook() {
  const supabase = createClient();
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [transactionType, setTransactionType] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", dateFrom, dateTo, transactionType, paymentMode],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          id,
          date,
          voucher_no,
          type,
          category,
          amount,
          mode,
          description,
          created_at
        `)
        .gte("date", dateFrom)
        .lte("date", dateTo)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (transactionType !== "all") {
        query = query.eq("type", transactionType);
      }
      if (paymentMode !== "all") {
        query = query.eq("mode", paymentMode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Calculate totals
  const totalIncome = transactions
    ?.filter(t => t.type === "income" || t.type === "fee_collection")
    ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalExpense = transactions
    ?.filter(t => t.type === "expense" || t.type === "salary")
    ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const netBalance = totalIncome - totalExpense;

  const cashTotal = transactions
    ?.filter(t => t.mode === "cash")
    ?.reduce((sum, t) => sum + (t.type === "income" || t.type === "fee_collection" ? t.amount : -t.amount), 0) || 0;

  const bankTotal = transactions
    ?.filter(t => t.mode !== "cash")
    ?.reduce((sum, t) => sum + (t.type === "income" || t.type === "fee_collection" ? t.amount : -t.amount), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Unified Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardStatCard title="Income Flow" value={`₹${totalIncome.toLocaleString()}`} icon={ArrowUpRight} color="emerald" />
        <DashboardStatCard title="Expense Flow" value={`₹${totalExpense.toLocaleString()}`} icon={ArrowDownRight} color="rose" />
        <DashboardStatCard title="Net Liquidity" value={`₹${netBalance.toLocaleString()}`} icon={Activity} color="purple" />
        <DashboardStatCard title="Cash Reserve" value={`₹${cashTotal.toLocaleString()}`} icon={Wallet} color="blue" />
        <DashboardStatCard title="Bank Reserve" value={`₹${bankTotal.toLocaleString()}`} icon={Building} color="amber" />
      </div>

      {/* Unified Action Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-1 flex-col lg:flex-row gap-4 w-full">
            <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1 gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-0 bg-transparent w-32 h-9 text-[10px] font-black uppercase tracking-tighter" />
              <span className="text-slate-300 font-black">→</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-0 bg-transparent w-32 h-9 text-[10px] font-black uppercase tracking-tighter" />
            </div>
            
            <div className="flex gap-3">
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold bg-white/50">
                <option value="all">All Channels</option>
                <option value="fee_collection">Revenue Stream</option>
                <option value="income">Direct Income</option>
                <option value="expense">Operational Expense</option>
                <option value="salary">Payroll</option>
              </select>

              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold bg-white/50">
                <option value="all">All Protocols</option>
                <option value="cash">Cash Protocol</option>
                <option value="bank">Digital Clearing</option>
              </select>
            </div>
          </div>

          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Download className="h-4 w-4 mr-2" /> Export Logs
          </Button>
        </div>
      </div>

      {/* Institutional Ledger */}
      <ERPCard
        title="Transaction Ledger"
        description="Chronological verification of institutional flows"
        icon={<BookOpen className="h-5 w-5" />}
        color="purple"
        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4">Maturity</th>
                <th className="px-6 py-4">Voucher</th>
                <th className="px-6 py-4">Particulars</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4 text-center">Protocol</th>
                <th className="px-6 py-4 text-right">Income</th>
                <th className="px-6 py-4 text-right">Expense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center animate-pulse">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Synchronizing Archive...</p>
                  </td>
                </tr>
              ) : transactions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Records Discovered</p>
                  </td>
                </tr>
              ) : (
                transactions?.map((txn) => {
                  const isIncome = txn.type === "income" || txn.type === "fee_collection";
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-slate-400 font-mono text-[10px] font-bold">{txn.date}</td>
                      <td className="px-6 py-5">
                        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50 tracking-tighter">
                          {txn.voucher_no || "SYS-GEN"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{txn.description || txn.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                          isIncome ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                        )}>{txn.category}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 px-2.5 py-1 rounded-md tracking-tighter shadow-sm bg-white capitalize">
                          {txn.mode}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600 text-sm">
                        {isIncome ? `₹${txn.amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-rose-600 text-sm">
                        {!isIncome ? `₹${txn.amount.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ERPCard>
    </div>
  );
}