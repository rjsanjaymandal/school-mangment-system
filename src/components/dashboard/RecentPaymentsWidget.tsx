"use client";

import { useState, useEffect } from "react";
import { CreditCard, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Payment {
  id: string;
  amount_paid: number;
  payment_date: string;
  student: { full_name?: string } | null;
}

export function RecentPaymentsWidget() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPayments() {
      try {
        const { data } = await supabase
          .from("payments")
          .select("id, amount_paid, payment_date, student:profiles(full_name)")
          .eq("status", "completed")
          .order("payment_date", { ascending: false })
          .limit(5);

        setPayments((data || []).map(p => ({
          id: p.id,
          amount_paid: p.amount_paid,
          payment_date: p.payment_date,
          student: Array.isArray(p.student) ? p.student[0] : p.student
        })));
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No recent payments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{payment.student?.full_name || "Student"}</p>
              <p className="text-xs text-muted-foreground">{payment.payment_date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-600">+₹{payment.amount_paid.toLocaleString()}</p>
          </div>
        </div>
      ))}
      <Link
        href="/fees"
        className="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        View All <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}