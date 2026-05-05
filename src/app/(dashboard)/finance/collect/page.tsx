"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, CreditCard, User, IndianRupee, X, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface Student {
  id: string;
  admission_number: string;
  class_id: string;
  profile: { full_name: string; phone?: string };
  class: { name: string };
}

interface Payment {
  id: string;
  amount_paid: number;
  payment_date: string;
  payment_mode: string;
  fee_type: string;
}

interface FamilyData {
  parent_name: string;
  parent_phone: string;
  students: Student[];
  total_due: number;
  total_paid: number;
  pending: number;
}

export default function CollectFeesPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyData | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);

  // Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 2) {
        setStudents([]);
        return;
      }
      
      const { data } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          class_id,
          profile:profiles(full_name, phone),
          class:classes(name)
        `)
        .or(`admission_number.ilike.%${searchQuery}%,profile.full_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (data) setStudents(data as any);
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Load family data when student selected
  useEffect(() => {
    const loadFamilyData = async () => {
      if (students.length === 0) return;

      // Group students by guardian/parent
      const studentMap = new Map<string, FamilyData>();
      
      students.forEach(student => {
        const phone = student.profile?.phone || "unknown";
        const parentName = "Family"; // Simplified
        
        if (!studentMap.has(phone)) {
          studentMap.set(phone, {
            parent_name: parentName,
            parent_phone: phone,
            students: [],
            total_due: 0,
            total_paid: 0,
            pending: 0,
          });
        }
        
        const family = studentMap.get(phone)!;
        family.students.push(student);
        
        // Get fee structures for this student's class
        // Get payments for this student
      });

      if (students.length > 0) {
        const firstStudent = students[0];
        
        // Get fee structures
        const { data: feeStructures } = await supabase
          .from("fees")
          .select("*")
          .eq("class_id", firstStudent.class?.name || "");

        const totalDue = feeStructures?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

        // Get payments
        const { data: pays } = await supabase
          .from("payments")
          .select("*")
          .eq("student_id", firstStudent.id)
          .order("payment_date", { ascending: false });

        const totalPaid = pays?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

        setSelectedFamily({
          parent_name: firstStudent.profile?.full_name || "Parent",
          parent_phone: firstStudent.profile?.phone || "N/A",
          students: students,
          total_due: totalDue * students.length,
          total_paid: totalPaid,
          pending: (totalDue * students.length) - totalPaid,
        });

        if (pays) setPayments(pays);
      }
    };

    loadFamilyData();
  }, [students]);

  const handlePayment = async () => {
    if (!selectedFamily || !paymentAmount) return;

    setIsLoading(true);
    try {
      for (const student of selectedFamily.students) {
        const { error } = await supabase
          .from("payments")
          .insert({
            student_id: student.id,
            amount_paid: parseFloat(paymentAmount) / selectedFamily.students.length,
            payment_mode: paymentMode,
            payment_date: new Date().toISOString().split('T')[0],
            status: "completed",
          });

        if (error) throw error;
      }

      toast.success("Payment recorded successfully!");
      setIsPaymentModalOpen(false);
      setPaymentAmount("");
      
      // Refresh payments
      if (selectedFamily.students[0]) {
        const { data } = await supabase
          .from("payments")
          .select("*")
          .eq("student_id", selectedFamily.students[0].id)
          .order("payment_date", { ascending: false });

        if (data) setPayments(data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <CreditCard className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Collect Fees</h1>
          <p className="text-sm text-slate-500">Search students and manage family ledger</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <Label className="text-sm font-medium text-slate-600">Search Student</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Enter name or admission number..."
                className="pl-10 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Search Results */}
          {students.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md shadow-sm">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-600">{students.length} results found</p>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setStudents([student])}
                    className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold">
                          {(student.profile?.full_name || "S")[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {student.profile?.full_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.admission_number} • {student.class?.name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Family Ledger */}
        <div className="lg:col-span-2">
          {selectedFamily ? (
            <div className="space-y-4">
              {/* Family Summary Card */}
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedFamily.parent_name} Family
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span className="text-sm text-slate-500">{selectedFamily.parent_phone}</span>
                        <Badge variant="outline" className="ml-2">
                          {selectedFamily.students.length} Student(s)
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-md"
                  >
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Collect Payment
                  </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <p className="text-xs font-medium text-blue-600 uppercase">Total Due</p>
                    <p className="text-xl font-bold text-blue-700 mt-1">₹{selectedFamily.total_due.toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
                    <p className="text-xs font-medium text-emerald-600 uppercase">Total Paid</p>
                    <p className="text-xl font-bold text-emerald-700 mt-1">₹{selectedFamily.total_paid.toLocaleString()}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-md p-3">
                    <p className="text-xs font-medium text-rose-600 uppercase">Balance</p>
                    <p className="text-xl font-bold text-rose-700 mt-1">₹{selectedFamily.pending.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Students in Family */}
              <div className="bg-white border border-slate-200 rounded-md shadow-sm">
                <div className="p-4 border-b border-slate-100 border-l-4 border-l-emerald-500">
                  <h3 className="text-sm font-semibold text-slate-900">Children in Family</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Admission No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Student Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedFamily.students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-600">{student.admission_number}</td>
                        <td className="px-4 py-2 font-medium text-slate-900">{student.profile?.full_name}</td>
                        <td className="px-4 py-2 text-slate-600">{student.class?.name}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">
                          ₹{selectedFamily.total_due / selectedFamily.students.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-md shadow-sm">
                  <div className="p-4 border-b border-slate-100 border-l-4 border-l-blue-500">
                    <h3 className="text-sm font-semibold text-slate-900">Payment History</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">₹{payment.amount_paid?.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{payment.payment_date} • {payment.payment_mode}</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                          Completed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
              <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">Select a Student</h3>
              <p className="text-sm text-slate-400 mt-1">Search for a student to view their family ledger</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md">
              <p className="text-sm text-slate-600">Family Balance</p>
              <p className="text-2xl font-bold text-slate-900">₹{selectedFamily?.pending.toLocaleString()}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Amount to Pay</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                className="mt-1 rounded-md"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000, selectedFamily?.pending].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(amt?.toString() || "")}
                    className="rounded-md text-xs"
                  >
                    ₹{amt?.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Payment Mode</Label>
              <div className="flex gap-2 mt-2">
                {["cash", "card", "bank_transfer", "upi"].map((mode) => (
                  <Button
                    key={mode}
                    variant={paymentMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMode(mode)}
                    className="rounded-md text-xs"
                  >
                    {mode.replace("_", " ").toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isLoading || !paymentAmount}
              className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-md"
            >
              {isLoading ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}