"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Calendar, Filter, Download, 
  ArrowUpRight, ArrowDownRight, Wallet, Building
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

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

  // Cash vs Bank
  const cashTotal = transactions
    ?.filter(t => t.mode === "cash")
    ?.reduce((sum, t) => sum + (t.type === "income" || t.type === "fee_collection" ? t.amount : -t.amount), 0) || 0;

  const bankTotal = transactions
    ?.filter(t => t.mode !== "cash")
    ?.reduce((sum, t) => sum + (t.type === "income" || t.type === "fee_collection" ? t.amount : -t.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36"
              />
              <span className="text-slate-400">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36"
              />
            </div>
            
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="h-10 px-3 rounded-md border"
            >
              <option value="all">All Types</option>
              <option value="fee_collection">Fee Collection</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="salary">Salary</option>
            </select>

            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="h-10 px-3 rounded-md border"
            >
              <option value="all">All Modes</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>

            <Button variant="outline" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Income</p>
                <p className="text-xl font-bold text-emerald-600">₹{totalIncome.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Expense</p>
                <p className="text-xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
              </div>
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Net Balance</p>
                <p className={`text-xl font-bold ${netBalance >= 0 ? "text-purple-600" : "text-red-600"}`}>
                  ₹{netBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Cash in Hand</p>
                <p className="text-xl font-bold text-blue-600">₹{cashTotal.toLocaleString()}</p>
              </div>
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Bank Balance</p>
                <p className="text-xl font-bold text-amber-600">₹{bankTotal.toLocaleString()}</p>
              </div>
              <Building className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-500" />
            Day Book - Transactions Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Particulars</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mode</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Income</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Expense</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No transactions found for selected date range
                    </td>
                  </tr>
                ) : (
                  transactions?.map((txn, index) => {
                    const isIncome = txn.type === "income" || txn.type === "fee_collection";
                    const runningBalance = transactions
                      .slice(index)
                      .reduce((sum, t) => sum + ((t.type === "income" || t.type === "fee_collection") ? t.amount : -t.amount), 0);

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{txn.date}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-xs">{txn.voucher_no || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900">{txn.description || txn.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            isIncome ? "bg-emerald-100 text-emerald-700" :
                            "bg-red-100 text-red-700"
                          }>
                            {txn.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">{txn.mode}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                          {isIncome ? `₹${txn.amount.toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          {!isIncome ? `₹${txn.amount.toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          ₹{runningBalance.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}