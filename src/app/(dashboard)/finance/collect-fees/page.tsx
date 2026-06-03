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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  PaginationState
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";
import { ERPCard } from "@/components/ui/erp-card";

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

  const [data, setData] = useState<FeeData[]>([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FeeData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const [collectedToday, setCollectedToday] = useState(0);
  const [totalRealizable, setTotalRealizable] = useState(1250000);
  const [defaulterCount, setDefaulterCount] = useState(42);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: rpcData, error } = await supabase.rpc("get_fee_collection_data", {
        p_search: searchQuery,
        p_limit: pageSize,
        p_offset: pageIndex * pageSize
      });

      if (error) throw error;

      setData(rpcData || []);
      setTotalRowCount(rpcData?.[0]?.total_count || 0);
    } catch (err: any) {
      toast.error("Data Load Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, searchQuery, pageIndex, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCheckout = (student: FeeData) => {
    setSelectedStudent(student);
    setPaymentAmount(student.outstanding_balance.toString());
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedStudent || !paymentAmount) return;
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
        description: `₹${paymentAmount} collected via ${paymentMode.toUpperCase()}`,
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

  const columns = useMemo<ColumnDef<FeeData>[]>(
    () => [
      {
        header: "Admission #",
        accessorKey: "admission_number",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{row.original.admission_number || "N/A"}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ID: {row.original.student_id.split('-')[0]}</span>
          </div>
        ),
      },
      {
        header: "Student Name",
        accessorKey: "student_name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{row.original.student_name}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Father: {row.original.father_name}</span>
          </div>
        ),
      },
      {
        header: "Class",
        accessorKey: "class_name",
        cell: ({ row }) => (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
            {row.original.class_name || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Due Amount",
        accessorKey: "outstanding_balance",
        cell: ({ row }) => {
          const bal = Number(row.original.outstanding_balance);
          if (bal <= 0) {
            return (
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl tracking-tighter border bg-emerald-50 text-emerald-600 border-emerald-100">
                Paid
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
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              className="h-9 w-9 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
              onClick={() => handleOpenCheckout(row.original)}
              disabled={Number(row.original.outstanding_balance) <= 0}
            >
              <Wallet className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </button>
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
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Collect Fees"
        subtitle="Manage student fee payments and collection"
        icon={IndianRupee}
        color="emerald"
        actions={
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Session</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Collected Today"
          value={`₹${collectedToday.toLocaleString()}`}
          icon={Activity}
          color="emerald"
          description="Total cash/online today"
        />
        <DashboardStatCard
          title="Expected Total"
          value={`₹${totalRealizable.toLocaleString()}`}
          icon={IndianRupee}
          color="blue"
          description="Institutional target"
        />
        <DashboardStatCard
          title="Pending Payments"
          value={defaulterCount}
          icon={Users}
          color="amber"
          description="Students with dues"
        />
        <DashboardStatCard
          title="Overdue Fees"
          value="₹45.2k"
          icon={AlertCircle}
          color="rose"
          description="Beyond due date"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2 duration-500">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name, admission # or parent name..."
            className="pl-11 h-12 rounded-xl bg-slate-50/50 border-slate-100 text-xs font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="h-12 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all flex-1 md:flex-none flex items-center justify-center">
            <Printer className="h-4 w-4 mr-2" /> Bulk Receipt
          </button>
          <button className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex-1 md:flex-none">
            Process All
          </button>
        </div>
      </div>

      <ERPCard
        title="Student List"
        description="List of all students and their current fee status"
        color="emerald"
        icon={<ReceiptText className="h-5 w-5" />}
        className="border border-slate-200 shadow-xl rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-black">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">Loading student records...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <AlertCircle className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching students found</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <UnifiedPagination
          currentPage={pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          totalItems={totalRowCount}
          itemsPerPage={pageSize}
          onItemsPerPageChange={(size) => table.setPageSize(size)}
          itemName="students"
        />
      </ERPCard>

      {/* Payment Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 bg-white border-b border-slate-100">
              <div className="h-14 w-14 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <IndianRupee className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Process Payment</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Collecting fees for institutional credit
              </p>
            </div>

            <div className="p-6 space-y-6">
              {selectedStudent && (
                <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</span>
                    <span className="text-sm font-black text-slate-900">{selectedStudent.student_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission #</span>
                    <span className="text-xs font-black font-mono text-slate-600">{selectedStudent.admission_number}</span>
                  </div>
                  <div className="h-[1px] bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Due Amount</span>
                    <span className="text-lg font-black text-rose-600 tracking-tighter">₹{selectedStudent.outstanding_balance.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Payment Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="h-14 pl-12 rounded-xl border-slate-200 text-lg font-black text-slate-900 shadow-sm focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['cash', 'online', 'cheque', 'transfer'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={cn(
                          "h-12 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                          paymentMode === mode
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Secure Transaction</p>
                </div>
                <p className="text-[10px] font-bold text-emerald-600/70 leading-relaxed uppercase">
                  Once processed, this amount will be credited to the institutional account and a digital receipt will be generated.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 space-y-2">
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing || !paymentAmount}
                className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest px-6 shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" /> Complete Payment
                  </>
                )}
              </button>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all hover:bg-slate-50"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
