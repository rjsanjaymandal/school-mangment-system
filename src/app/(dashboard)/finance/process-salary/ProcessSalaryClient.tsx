"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, Download, Send, ChevronDown, ChevronUp,
  IndianRupee, Calendar, Users, CheckCircle, AlertCircle
} from "lucide-react";
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
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="h-10 px-3 rounded-md border"
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
            className="h-10 px-3 rounded-md border"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => processSalary.mutate()}
            disabled={processing || payrollLoading}
            className="bg-emerald-600"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Generate Salary"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Staff</p>
            <p className="text-2xl font-bold text-slate-900">{staff?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Processed</p>
            <p className="text-2xl font-bold text-emerald-600">{processedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Deductions</p>
            <p className="text-2xl font-bold text-amber-600">₹{totalDeductions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Net Payable</p>
            <p className="text-2xl font-bold text-purple-600">₹{totalNet.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            Staff Salary Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payrollLoading || staffLoading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : payrollData?.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p>No payroll data generated for this month.</p>
              <p className="text-sm mt-1">Click "Generate Salary" to process.</p>
            </div>
          ) : (
            <div className="divide-y">
              {staff?.map((member: any) => {
                const payroll = payrollData?.find(p => p.staff_id === member.id);
                const isExpanded = expandedStaff.includes(member.id);
                const staffName = member.profile?.full_name || "Unknown";
                
                return (
                  <div key={member.id}>
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                      onClick={() => payroll && toggleExpand(member.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                          {staffName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{staffName}</p>
                          <p className="text-xs text-slate-500">{member.designation?.name || "Staff"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            ₹{(() => {
                              if (!payroll) return (member.base_salary || 0);
                              const deductions = (payroll.absence_deduction || 0) + (payroll.leave_deduction || 0) + (payroll.late_deduction || 0) + (payroll.other_deductions || 0);
                              const additions = (payroll.bonus || 0) + (payroll.allowances || 0);
                              return (payroll.base_salary || 0) + additions - deductions;
                            })().toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Net Pay</p>
                        </div>
                        
                        {payroll ? (
                          <Badge className={
                            payroll.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                            payroll.status === "paid" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }>
                            {payroll.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Processed</Badge>
                        )}
                        
                        {payroll && (
                          isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && payroll && (
                      <div className="px-4 pb-4 bg-slate-50/50">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Base Salary</p>
                            <p className="font-medium">₹{payroll.base_salary?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Working Days</p>
                            <p className="font-medium">{payroll.working_days || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Present/Absent</p>
                            <p className="font-medium">
                              {payroll.days_present || 0} / {payroll.days_absent || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Deductions</p>
                            <p className="font-medium text-red-600">
                              -₹{((payroll.absence_deduction || 0) + (payroll.leave_deduction || 0) + (payroll.late_deduction || 0) + (payroll.other_deductions || 0)).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Bonus</p>
                            <p className="font-medium text-emerald-600">
                              +₹{(payroll.bonus || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-2 flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={payroll.status === "approved"}
                              onClick={() => approvePayroll.mutate(member.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Slip
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}