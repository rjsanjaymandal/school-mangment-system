"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Wallet, 
  Bell, 
  Eye, 
  IndianRupee, 
  Users, 
  TrendingUp, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ReceiptText,
  Printer,
  ShieldCheck,
  CreditCard,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  PaginationState
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

// Shared UI Framework
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";
import { ERPCard } from "@/components/ui/erp-card";

// --- Types ---
interface FeeData {
  student_id: string;
  admission_number: string;
  student_name: string;
  father_name: string;
  class_name: string;
  total_due: number;
  total_paid: number;
  outstanding_balance: number;
  total_count: number;
}

export default function AdvancedFeeCollectionPage() {
  const supabase = createClient();

  // --- State ---
  const [data, setData] = useState<FeeData[]>([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Slide-over Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FeeData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // Micro-metrics State
  const [collectedToday, setCollectedToday] = useState(0);
  const [totalRealizable, setTotalRealizable] = useState(1250000); // Mocked for design
  const [defaulterCount, setDefaulterCount] = useState(42); // Mocked for design

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: rpcData, error } = await supabase.rpc("get_fee_collection_data", {
        p_search: searchQuery,
        p_limit: pageSize,
        p_offset: pageIndex * pageSize
      });

      if (error) {
        console.error("RPC Error:", error.message);
        setData([]);
        setTotalRowCount(0);
      } else if (rpcData) {
        setData(rpcData);
        setTotalRowCount(rpcData.length > 0 ? Number(rpcData[0].total_count) : 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, searchQuery, pageIndex, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchData]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: pays } = await supabase
        .from("payments")
        .select("amount_paid")
        .eq("status", "completed")
        .eq("payment_date", today);
        
      const todayTotal = pays?.reduce((acc, p) => acc + (p.amount_paid || 0), 0) || 0;
      setCollectedToday(todayTotal);
    };
    fetchMetrics();
  }, [supabase]);

  // --- Handlers ---
  const handleOpenCheckout = (student: FeeData) => {
    setSelectedStudent(student);
    setPaymentAmount(student.outstanding_balance.toString());
    setPaymentMode("cash");
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedStudent || !paymentAmount || isNaN(Number(paymentAmount))) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("payments")
        .insert({
          student_id: selectedStudent.student_id,
          amount_paid: parseFloat(paymentAmount),
          payment_mode: paymentMode,
          payment_date: new Date().toISOString().split('T')[0],
          status: "completed",
        });

      if (error) throw error;

      toast.success("Payment Successful", {
        description: `₹${paymentAmount} captured via ${paymentMode.toUpperCase()}`,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      });
      
      setIsCheckoutOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Process Failed", { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };


  // --- Table Configuration ---
  const columns = useMemo<ColumnDef<FeeData>[]>(
    () => [
      {
        header: "Maturity Identity",
        accessorKey: "admission_number",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{row.original.admission_number || "N/A"}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">UID: {row.original.student_id.split('-')[0]}</span>
          </div>
        ),
      },
      {
        header: "Member Entity",
        accessorKey: "student_name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{row.original.student_name}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">c/o {row.original.father_name}</span>
          </div>
        ),
      },
      {
        header: "Academic Group",
        accessorKey: "class_name",
        cell: ({ row }) => (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
            {row.original.class_name || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Outstanding Value",
        accessorKey: "outstanding_balance",
        cell: ({ row }) => {
          const bal = Number(row.original.outstanding_balance);
          if (bal <= 0) {
            return (
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border bg-emerald-50 text-emerald-600 border-emerald-100">
                Settled
              </span>
            );
          }
          return (
            <span className="font-black text-rose-600 tracking-tighter text-sm">
              ₹{bal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Operations",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
              onClick={() => handleOpenCheckout(row.original)}
              disabled={Number(row.original.outstanding_balance) <= 0}
            >
              <Wallet className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              onClick={() => { window.location.href = `/finance/slips?studentId=${row.original.student_id}`; }}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-blue-500/20 text-blue-600 bg-blue-500/5 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRowCount / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Fee Collection"
        subtitle="Manage outstanding balances and institutional credits"
        icon={Wallet}
        color="emerald"
        actions={
          <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 gap-2">
            <ReceiptText className="h-4 w-4" />
            Revenue Reports
          </Button>
        }
      />

      {/* Unified Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard 
          title="Total Realizable" 
          value={`₹${totalRealizable.toLocaleString('en-IN')}`} 
          icon={TrendingUp} 
          color="blue" 
          description="Institutional Projection"
        />
        <DashboardStatCard 
          title="Defaulter Density" 
          value={defaulterCount} 
          icon={AlertCircle} 
          color="rose" 
          description="High Risk Accounts"
        />
        <DashboardStatCard 
          title="Daily Liquidity" 
          value={`₹${collectedToday.toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          color="emerald" 
          description="Verified Collections"
        />
      </div>

      {/* Unified Table View */}
      <ERPCard
        title="Collection Ledger"
        description="Verify and settle outstanding institutional dues"
        icon={<CreditCard className="h-5 w-5" />}
        color="emerald"
        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by identity, UID, or guardian..."
              className="pl-11 h-11 rounded-xl bg-white border-slate-200 focus:ring-emerald-500 text-xs font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Synchronizing Records...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-24 text-center">
                    <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
                        <Users className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Entities Discovered</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-all group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Unified Pagination Framework */}
        <UnifiedPagination 
          currentPage={pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          totalItems={totalRowCount}
          itemsPerPage={pageSize}
          itemName="records"
          className="mt-0 rounded-none border-0 border-t"
        />
      </ERPCard>

      {/* Slide-over Checkout Panel - Refined */}
      <Sheet open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <SheetContent className="w-full sm:max-w-md border-none shadow-2xl backdrop-blur-xl">
          <SheetHeader className="pb-8 border-b border-slate-100 mb-8">
            <SheetTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              Authorization
            </SheetTitle>
            <SheetDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              Settle financial obligations for {selectedStudent?.student_name}
            </SheetDescription>
          </SheetHeader>

          {selectedStudent && (
            <div className="space-y-8">
              {/* Institutional Balance Snapshot */}
              <div className="glass futuristic-card border-none shadow-xl rounded-2xl p-6 flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liability Amount</p>
                  <p className="text-4xl font-black text-rose-600 tracking-tighter">
                    ₹{Number(selectedStudent.outstanding_balance).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 group-hover:rotate-12 transition-transform">
                   <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
              </div>

              {/* Payment Entry Framework */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credit Value (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</span>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-10 text-2xl font-black h-14 rounded-2xl border-slate-200 focus:ring-emerald-500 tracking-tighter"
                    autoFocus
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[500, 1000, 5000, Number(selectedStudent.outstanding_balance)].map((amt, idx) => {
                    if (!amt || amt <= 0) return null;
                    const isFull = idx === 3;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => setPaymentAmount(amt.toString())}
                        className={cn(
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            isFull ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        {isFull ? 'Authorize Settlement' : `₹${amt}`}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transfer Protocol</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'cash', label: 'Cash Protocol' },
                    { id: 'upi', label: 'Digital QR' },
                    { id: 'card', label: 'Physical Card' },
                    { id: 'bank_transfer', label: 'Clearing House' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border text-left transition-all group hover:scale-[1.02]",
                        paymentMode === mode.id 
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' 
                            : 'border-slate-100 bg-slate-50/50 hover:bg-white'
                      )}
                      onClick={() => setPaymentMode(mode.id)}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        paymentMode === mode.id ? 'border-emerald-600 bg-emerald-600' : 'border-slate-200 bg-white'
                      )}>
                        {paymentMode === mode.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50" />}
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        paymentMode === mode.id ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-700'
                      )}>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Action */}
              <div className="pt-6 border-t border-slate-100">
                <Button 
                  className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-200 rounded-2xl transition-all active:scale-95 group"
                  onClick={handleProcessPayment}
                  disabled={isProcessing || !paymentAmount || Number(paymentAmount) <= 0}
                >
                  {isProcessing ? (
                    <Activity className="h-5 w-5 animate-spin mr-3" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  )}
                  {isProcessing ? "Processing..." : `Execute ₹${Number(paymentAmount).toLocaleString('en-IN')} Credit`}
                </Button>
                <p className="text-[9px] font-black text-center text-slate-400 uppercase tracking-widest mt-4 leading-relaxed">
                  Cryptographically signed digital verification will be dispatched to the registered entity.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}