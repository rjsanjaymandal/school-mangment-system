"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  CreditCard,
  IndianRupee,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

interface FeeListProps {
  initialData: any[];
}

export function FeeList({ initialData }: FeeListProps) {
  const [data, setData] = useState<any[]>(initialData);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-blue-600 border border-blue-700 rounded-xl overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Expected Revenue</p>
              <IndianRupee className="h-5 w-5 text-blue-200" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">₹125,000</h2>
            <p className="text-[10px] font-bold text-blue-200 mt-2">Annual total expected</p>
          </div>
        </div>
        <div className="bg-green-600 border border-green-700 rounded-xl overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-100">Collected</p>
              <ArrowUpRight className="h-5 w-5 text-green-200" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">₹98,450</h2>
            <p className="text-[10px] font-bold text-green-200 mt-2">78.7% collection rate</p>
          </div>
        </div>
        <div className="bg-red-600 border border-red-700 rounded-xl overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-100">Outstanding</p>
              <CreditCard className="h-5 w-5 text-red-200" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">₹26,550</h2>
            <p className="text-[10px] font-bold text-red-200 mt-2">Follow up required</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Fee Structures</h3>
          <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-x-2">
            <Plus className="h-4 w-4" />
            Create Fee Type
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left py-4 px-4">Fee Name</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left py-4 px-4">Amount</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left py-4 px-4">Due Date</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left py-4 px-4">Description</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No fee structures defined.</p>
                  </td>
                </tr>
              ) : (
                data.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{fee.name}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">₹{fee.amount}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-x-2 text-slate-500 dark:text-slate-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(fee.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-sm max-w-xs truncate">{fee.description || "N/A"}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}