"use client";

import { useState } from "react";
import { Plus, IndianRupee, Calendar, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function FeeStructure() {
  const [isOpen, setIsOpen] = useState(false);
  const [fees, setFees] = useState([
    {
      id: "1",
      name: "Annual Tuition Fee",
      amount: 2500,
      due_date: "2024-06-30",
      description: "Standard annual tuition for Grade 10",
    },
    {
      id: "2",
      name: "Library Membership",
      amount: 150,
      due_date: "2024-01-15",
      description: "Access to digital and physical library",
    },
    {
      id: "3",
      name: "Laboratory Fee",
      amount: 300,
      due_date: "2024-02-10",
      description: "Science lab consumables and equipment maintenance",
    },
  ]);

  const handleCreate = () => {
    toast.success("Fee structure created");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Fee Categories</h3>
        <button onClick={() => setIsOpen(true)} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-x-2">
          <Plus className="h-4 w-4" />
          Define New Fee
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
            {fees.map((fee) => (
              <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{fee.name}</td>
                <td className="py-4 px-4">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">₹{fee.amount.toLocaleString()}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-x-1 text-slate-500 dark:text-slate-400 text-sm">
                    <Calendar className="h-3 w-3" />
                    {fee.due_date}
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-sm">{fee.description}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-x-1">
                    <button className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 text-red-400 hover:bg-red-50 transition-all flex items-center justify-center">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full mx-4">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Define Fee Structure</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a new fee category for students.</p>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Fee form configuration UI goes here...</p>
              <div className="flex justify-end gap-x-2">
                <button onClick={() => setIsOpen(false)} className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Cancel</button>
                <button onClick={handleCreate} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all">Save Fee</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}