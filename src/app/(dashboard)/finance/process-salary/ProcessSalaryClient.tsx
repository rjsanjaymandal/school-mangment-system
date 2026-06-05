"use client";

import { useState } from "react";
import { 
  Calculator, Download, Send, ChevronDown, ChevronUp,
  IndianRupee, Calendar, Users, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface StaffSalary {
  id: string;
  staff_id: string;
  staff_name: string;
  designation: string;
  base_salary: number;
  working_days: number;
  days_present: number;
  days_absent: number;
  absence_deduction: number;
  leave_deduction: number;
  late_deduction: number;
  other_deductions: number;
  bonus: number;
  allowances: number;
  status: string;
}

export function ProcessSalaryClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedStaff, setExpandedStaff] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Fetch active staff
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["active-staff"],
    queryFn: async () => {
      const { data } = await supabase
        .from("staff")
        .select(`
          id,
          base_salary,
          designation:designations(name),
          profile:profiles(full_name)
        `)
        .eq("status", "active");
      return data || [];
    },
  });

  // Fetch existing payroll for selected month/year
  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ["payroll", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data } = await supabase
        .from("payroll_history")
        .select(`
          id,
          staff_id,
          base_salary,
          working_days,
          days_present,
          days_absent,
          absence_deduction,
          leave_deduction,
          late_deduction,
          other_deductions,
          bonus,
          allowances,
          status,
          staff:staff(profile:profiles(full_name), designation:designations(name))
        `)
        .eq("month", selectedMonth)
        .eq("year", selectedYear);
      return data || [];
    },
  });

  // Calculate totals from payroll data
  const totalSalary = payrollData?.reduce((sum, p) => sum + (p.base_salary || 0), 0) || 0;
  const totalDeductions = payrollData?.reduce((sum, p) => 
    sum + (p.absence_deduction || 0) + (p.leave_deduction || 0) + (p.late_deduction || 0) + (p.other_deductions || 0), 0) || 0;
  const totalNet = payrollData?.reduce((sum, p) => 
    sum + (p.base_salary || 0) + (p.bonus || 0) + (p.allowances || 0) - 
    ((p.absence_deduction || 0) + (p.leave_deduction || 0) + (p.late_deduction || 0) + (p.other_deductions || 0)), 0) || 0;
  const processedCount = payrollData?.filter(p => p.status !== "draft").length || 0;

  // Process salary mutation
  const processSalary = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      
      // Call the database function to process salary
      const { data, error } = await supabase.rpc("process_monthly_salary", {
        p_month: selectedMonth,
        p_year: selectedYear,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", selectedMonth, selectedYear] });
      setProcessing(false);
    },
    onError: () => {
      setProcessing(false);
    },
  });

  // Approve payroll mutation
  const approvePayroll = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase
        .from("payroll_history")
        .update({ 
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("staff_id", staffId)
        .eq("month", selectedMonth)
        .eq("year", selectedYear);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", selectedMonth, selectedYear] });
    },
  });

  const toggleExpand = (staffId: string) => {
    setExpandedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => processSalary.mutate()}
            disabled={processing || payrollLoading}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            {processing ? "Processing..." : "Generate Salary"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Staff</p>
            <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-2">{staff?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Processed</p>
            <p className="text-lg font-black tracking-tight text-emerald-600 mt-2">{processedCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Deductions</p>
            <p className="text-lg font-black tracking-tight text-amber-600 mt-2">₹{totalDeductions.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Net Payable</p>
            <p className="text-lg font-black tracking-tight text-purple-600 mt-2">₹{totalNet.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Staff Salary Details
          </h3>
        </div>
        <div className="p-0">
          {payrollLoading || staffLoading ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>
          ) : payrollData?.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p>No payroll data generated for this month.</p>
              <p className="text-sm mt-1">Click &quot;Generate Salary&quot; to process.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {staff?.map((member: any) => {
                const payroll = payrollData?.find(p => p.staff_id === member.id);
                const isExpanded = expandedStaff.includes(member.id);
                const staffName = member.profile?.full_name || "Unknown";
                
                return (
                  <div key={member.id}>
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      onClick={() => payroll && toggleExpand(member.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
                          {staffName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{staffName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{member.designation?.name || "Staff"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            ₹{(() => {
                              if (!payroll) return (member.base_salary || 0);
                              const deductions = (payroll.absence_deduction || 0) + (payroll.leave_deduction || 0) + (payroll.late_deduction || 0) + (payroll.other_deductions || 0);
                              const additions = (payroll.bonus || 0) + (payroll.allowances || 0);
                              return (payroll.base_salary || 0) + additions - deductions;
                            })().toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Net Pay</p>
                        </div>
                        
                        {payroll ? (
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                            payroll.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" :
                            payroll.status === "paid" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" :
                            "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                          )}>
                            {payroll.status}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">Not Processed</span>
                        )}
                        
                        {payroll && (
                          isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && payroll && (
                      <div className="px-4 pb-4 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Base Salary</p>
                            <p className="font-bold">₹{payroll.base_salary?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Working Days</p>
                            <p className="font-bold">{payroll.working_days || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Present/Absent</p>
                            <p className="font-bold">
                              {payroll.days_present || 0} / {payroll.days_absent || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Deductions</p>
                            <p className="font-bold text-red-600 dark:text-red-400">
                              -₹{((payroll.absence_deduction || 0) + (payroll.leave_deduction || 0) + (payroll.late_deduction || 0) + (payroll.other_deductions || 0)).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Bonus</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              +₹{(payroll.bonus || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-2 flex gap-2 mt-2">
                            <button 
                              disabled={payroll.status === "approved"}
                              onClick={() => approvePayroll.mutate(member.id)}
                              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </button>
                            <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                              <Download className="h-3 w-3" />
                              Slip
                            </button>
                            <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                              <Send className="h-3 w-3" />
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

