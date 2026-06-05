"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Calendar, Filter, Download, 
  ArrowUpRight, ArrowDownRight, Wallet, Building,
  Search, BarChart3, Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";
import { cn } from "@/lib/utils";

export function DayBook() {
  const supabase = createClient();
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [transactionType, setTransactionType] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

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

  const totalPages = Math.ceil((transactions?.length || 0) / itemsPerPage);
  const paginatedTransactions = transactions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardStatCard title="Income Flow" value={`₹${totalIncome.toLocaleString()}`} icon={ArrowUpRight} color="emerald" />
        <DashboardStatCard title="Expense Flow" value={`₹${totalExpense.toLocaleString()}`} icon={ArrowDownRight} color="rose" />
        <DashboardStatCard title="Net Liquidity" value={`₹${netBalance.toLocaleString()}`} icon={Activity} color="purple" />
        <DashboardStatCard title="Cash Reserve" value={`₹${cashTotal.toLocaleString()}`} icon={Wallet} color="blue" />
        <DashboardStatCard title="Bank Reserve" value={`₹${bankTotal.toLocaleString()}`} icon={Building} color="amber" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-1 flex-col lg:flex-row gap-4 w-full">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="border-0 bg-transparent w-32 h-9 text-[10px] font-black uppercase tracking-tighter text-slate-900 dark:text-white" />
              <span className="text-slate-300 font-black">→</span>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="border-0 bg-transparent w-32 h-9 text-[10px] font-black uppercase tracking-tighter text-slate-900 dark:text-white" />
            </div>
            
            <div className="flex gap-3">
              <select value={transactionType} onChange={(e) => { setTransactionType(e.target.value); setCurrentPage(1); }} className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 outline-none">
                <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Channels</option>
                <option value="fee_collection" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Revenue Stream</option>
                <option value="income" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Direct Income</option>
                <option value="expense" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Operational Expense</option>
                <option value="salary" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Payroll</option>
              </select>

              <select value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value); setCurrentPage(1); }} className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 outline-none">
                <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Protocols</option>
                <option value="cash" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Cash Protocol</option>
                <option value="bank" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Digital Clearing</option>
              </select>
            </div>
          </div>

          <button className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-x-2">
            <Download className="h-4 w-4" /> Export Logs
          </button>
        </div>
      </div>

      <ERPCard
        title="Transaction Ledger"
        description="Chronological verification of institutional flows"
        icon={<BookOpen className="h-5 w-5" />}
        color="purple"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6">Maturity</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6">Voucher</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6">Particulars</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6">Domain</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6 text-center">Protocol</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6 text-right">Income</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-6 text-right">Expense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center animate-pulse">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Archive...</p>
                  </td>
                </tr>
              ) : paginatedTransactions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Records Discovered</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions?.map((txn) => {
                  const isIncome = txn.type === "income" || txn.type === "fee_collection";
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
                      <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold">{txn.date}</td>
                      <td className="px-6 py-5">
                        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/50">
                          {txn.voucher_no || "SYS-GEN"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{txn.description || txn.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-lg",
                          isIncome 
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" 
                            : "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400"
                        )}>{txn.category}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 capitalize">
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
        <UnifiedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={transactions?.length || 0}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
            }}
            itemName="transactions"
        />
      </ERPCard>
    </div>
  );
}