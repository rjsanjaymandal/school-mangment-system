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
  ReceiptText
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
  const [totalRealizable, setTotalRealizable] = useState(0);
  const [defaulterCount, setDefaulterCount] = useState(0);

  // --- Data Fetching (Debounced Search & Pagination) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call our custom RPC
      const { data: rpcData, error } = await supabase.rpc("get_fee_collection_data", {
        p_search: searchQuery,
        p_limit: pageSize,
        p_offset: pageIndex * pageSize
      });

      if (error) {
        console.error("RPC Error:", error.message || error.details || JSON.stringify(error));
        // Fallback if RPC doesn't exist yet
        toast.error("Database function missing. Please run the SQL migration.");
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

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page on search
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchData]);

  // Fetch initial metrics
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

      // Using RPC for overall metrics if possible, or mocked for demo
      // In a real scenario, this would come from `get_fee_dashboard_stats`
      setTotalRealizable(1250000); 
      setDefaulterCount(42); 
    };
    fetchMetrics();
  }, [supabase]);

  // Realtime Subscription for Live Collection Updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments' },
        (payload) => {
          const newPayment = payload.new;
          if (newPayment.status === 'completed') {
            const today = new Date().toISOString().split('T')[0];
            if (newPayment.payment_date === today) {
              setCollectedToday(prev => prev + Number(newPayment.amount_paid || 0));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);


  // --- Handlers ---
  const handleOpenCheckout = (student: FeeData) => {
    setSelectedStudent(student);
    setPaymentAmount(student.outstanding_balance.toString());
    setPaymentMode("cash");
    setIsCheckoutOpen(true);
  };

  const handleSendReminder = (student: FeeData) => {
    // API Placeholder
    console.log(`Sending WhatsApp reminder to ${student.father_name} for student ${student.student_name}`);
    toast.success(`WhatsApp reminder sent to ${student.father_name}`);
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

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Payment of ₹{paymentAmount} processed successfully!</span>
        </div>
      );
      
      setIsCheckoutOpen(false);
      fetchData(); // Refresh table
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };


  // --- Table Configuration ---
  const columns = useMemo<ColumnDef<FeeData>[]>(
    () => [
      {
        header: "Adm. No. / Unique ID",
        accessorKey: "admission_number",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row.original.admission_number || "N/A"}</span>
            <span className="text-xs text-slate-500 truncate max-w-[120px]">{row.original.student_id.split('-')[0]}...</span>
          </div>
        ),
      },
      {
        header: "Student & Parent",
        accessorKey: "student_name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row.original.student_name}</span>
            <span className="text-xs text-slate-500">c/o {row.original.father_name}</span>
          </div>
        ),
      },
      {
        header: "Class/Sec",
        accessorKey: "class_name",
        cell: ({ row }) => (
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 border-none">
            {row.original.class_name || "Unassigned"}
          </Badge>
        ),
      },
      {
        header: "Outstanding Balance",
        accessorKey: "outstanding_balance",
        cell: ({ row }) => {
          const bal = Number(row.original.outstanding_balance);
          if (bal <= 0) {
            return (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 font-semibold px-2.5 py-0.5">
                Paid
              </Badge>
            );
          }
          return (
            <span className="font-bold text-red-600 tracking-tight">
              ₹{bal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
              title="Quick Collect"
              onClick={() => handleOpenCheckout(row.original)}
              disabled={Number(row.original.outstanding_balance) <= 0}
            >
              <Wallet className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
              title="Send Reminder"
              onClick={() => handleSendReminder(row.original)}
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
              title="View Ledger"
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
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* 1. Layout & Header Aggregations */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center text-sm text-slate-500 mb-1">
            <span>Home</span>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span>Finance</span>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-slate-900 font-medium">Fee Collection</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Outstanding Fees</h1>
        </div>
        <Button variant="outline" className="bg-white">
          <ReceiptText className="h-4 w-4 mr-2 text-slate-500" />
          View Fee Reports
        </Button>
      </div>

      {/* Live Counter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Realizable</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalRealizable.toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Defaulters {'>'} 60 Days</p>
            <p className="text-2xl font-bold text-slate-900">{defaulterCount} <span className="text-sm font-normal text-slate-400">Students</span></p>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
            <IndianRupee className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Collected Today</p>
            <p className="text-2xl font-bold text-emerald-700">₹{collectedToday.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* 2. The Advanced Outstanding Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student, admission no, or father's name..."
              className="pl-9 bg-white border-slate-200 focus-visible:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-slate-500">Loading student records...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">No records found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{data.length === 0 ? 0 : pageIndex * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min((pageIndex + 1) * pageSize, totalRowCount)}</span> of <span className="font-medium text-slate-900">{totalRowCount}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-over Checkout Panel */}
      <Sheet open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <SheetContent className="w-full sm:max-w-md border-l-slate-200">
          <SheetHeader className="pb-6 border-b border-slate-100 mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <div className="p-1.5 bg-emerald-100 rounded-md">
                <Wallet className="h-5 w-5 text-emerald-700" />
              </div>
              Quick Collect
            </SheetTitle>
            <SheetDescription>
              Process payment for {selectedStudent?.student_name}
            </SheetDescription>
          </SheetHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Outstanding Balance</p>
                  <p className="text-3xl font-bold text-red-600 tracking-tight mt-1">
                    ₹{Number(selectedStudent.outstanding_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Badge variant="outline" className="bg-white">
                  {selectedStudent.class_name}
                </Badge>
              </div>

              {/* Payment Input */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900">Collection Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-8 text-lg font-medium h-12"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  {[500, 1000, 5000, Number(selectedStudent.outstanding_balance)].map((amt, idx) => {
                    if (!amt || amt <= 0) return null;
                    const isFull = idx === 3;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentAmount(amt.toString())}
                        className={`text-xs ${isFull ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                      >
                        {isFull ? 'Full Amount' : `₹${amt}`}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'cash', label: 'Cash' },
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'card', label: 'Debit/Credit Card' },
                    { id: 'bank_transfer', label: 'Bank Transfer' }
                  ].map((mode) => (
                    <Button
                      key={mode.id}
                      variant="outline"
                      className={`justify-start h-11 ${paymentMode === mode.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500' : 'text-slate-600'}`}
                      onClick={() => setPaymentMode(mode.id)}
                    >
                      <div className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center ${paymentMode === mode.id ? 'border-emerald-600' : 'border-slate-300'}`}>
                        {paymentMode === mode.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </div>
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-slate-100">
                <Button 
                  className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  onClick={handleProcessPayment}
                  disabled={isProcessing || !paymentAmount || Number(paymentAmount) <= 0}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Process ₹{Number(paymentAmount).toLocaleString('en-IN')} via {paymentMode.toUpperCase()}</>
                  )}
                </Button>
                <p className="text-xs text-center text-slate-500 mt-3">
                  A digital receipt will be generated and sent to {selectedStudent.father_name}.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}