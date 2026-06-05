"use client";

import { useState } from "react";
import { CreditCard, IndianRupee, Wallet, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function PaymentForm() {
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Payment recorded successfully", {
        description: "Transaction ID: TXN_8829310",
      });
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-700">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-x-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Record New Payment
        </h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                Select Student
              </label>
              <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Search student...</option>
                <option value="s1" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">John Doe (Grade 10-A)</option>
                <option value="s2" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Jane Smith (Grade 10-A)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                Fee Category
              </label>
              <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select fee item</option>
                <option value="f1" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Annual Tuition (₹2,500)</option>
                <option value="f2" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Laboratory Fee (₹300)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                Amount to Pay
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="0.00"
                  className="pl-9 rounded-xl border-slate-200 dark:border-slate-800"
                  type="number"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                Payment Method
              </label>
              <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                <option value="cash" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cash</option>
                <option value="online" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Online Transfer</option>
                <option value="bank" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bank Deposit</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>
              Outstanding Balance:{" "}
              <span className="text-red-500 font-bold">₹2,800</span>
            </p>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex items-center gap-x-2"
          >
            {loading ? "Processing..." : "Confirm Payment"}
            {!loading && <CheckCircle2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}