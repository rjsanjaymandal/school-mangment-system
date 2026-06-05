"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Building, IndianRupee, ChevronDown, ChevronUp, FileText, LayoutGrid, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useFinanceStore } from "@/lib/store/finance-store";
import { cn } from "@/lib/utils";
import { ERPCard } from "@/components/ui/erp-card";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

interface FeeStructure {
  id: string;
  fee_type: string;
  amount: number;
  class_id: string;
  section_id?: string;
  medium: string;
  academic_year: string;
  due_date: string;
}

interface Class {
  id: string;
  name: string;
}

export default function FeeStructurePage() {
  const supabase = createClient();
  const { activeSession, feeHeads } = useFinanceStore();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load data on mount
  useState(() => {
    const loadData = async () => {
      const [{ data: fees }, { data: classesData }] = await Promise.all([
        supabase.from("fees").select("*").eq("academic_year", activeSession).order("class_id"),
        supabase.from("classes").select("id, name").order("name"),
      ]);
      if (fees) setFeeStructures(fees);
      if (classesData) setClasses(classesData);
    };
    loadData();
  });

  const [formData, setFormData] = useState({
    medium: "English-CBSE",
    class_id: "",
    section_id: "",
    fee_head: "",
    amount: "",
    due_date: "",
  });

  const mediums = ["English-CBSE", "English-RBSE", "Hindi-CBSE", "Hindi-RBSE"];
  const sections = ["A", "B", "C", "D"];

  const handleSubmit = async () => {
    if (!formData.class_id || !formData.fee_head || !formData.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.fee_head,
        amount: parseFloat(formData.amount),
        class_id: formData.class_id,
        section_id: formData.section_id || null,
        medium: formData.medium,
        academic_year: activeSession,
        fee_type: formData.fee_head,
        due_date: formData.due_date,
      };

      const { error } = await supabase.from("fees").insert(payload);
      if (error) throw error;

      toast.success("Fee head assigned successfully!");
      
      // Refresh data
      const { data } = await supabase
        .from("fees")
        .select("*")
        .eq("academic_year", activeSession)
        .order("class_id");
      if (data) setFeeStructures(data);

      setIsModalOpen(false);
      setFormData({
        medium: "English-CBSE",
        class_id: "",
        section_id: "",
        fee_head: "",
        amount: "",
        due_date: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fee head assignment?")) return;

    try {
      const { error } = await supabase.from("fees").delete().eq("id", id);
      if (error) throw error;

      setFeeStructures(feeStructures.filter(f => f.id !== id));
      toast.success("Fee head removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  // Group by class
  const groupedByClass = classes.map(c => ({
    className: c.name,
    structures: feeStructures.filter(f => f.class_id === c.name),
    medium: [...new Set(feeStructures.filter(f => f.class_id === c.name).map(f => f.medium))]
  })).filter(g => g.structures.length > 0);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Fee Structure"
        subtitle={`Academic Session: ${activeSession}`}
        icon={Building}
        color="emerald"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Assign Fee Head
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Engine */}
        <div className="lg:col-span-1">
          <ERPCard
            title="Allocation Engine"
            description="Assign financial obligations to groups"
            icon={<LayoutGrid className="h-5 w-5" />}
            color="emerald"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6"
          >
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Medium</label>
                <select
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                >
                  {mediums.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Academic Group</label>
                <select
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                >
                  <option value="">Select target group</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Section</label>
                <select
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                  value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                >
                  <option value="">Global Allocation</option>
                  {sections.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Category Head</label>
                <select
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                  value={formData.fee_head}
                  onChange={(e) => setFormData({ ...formData, fee_head: e.target.value })}
                >
                  <option value="">Select category</option>
                  {feeHeads.map(h => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Amount (₹)</label>
                <Input
                  type="number"
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Maturity Date</label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 w-full mt-4"
              >
                {isLoading ? "Executing..." : "Authorize Allocation"}
              </button>
            </div>
          </ERPCard>
        </div>

        {/* Structural Overview */}
        <div className="lg:col-span-2">
          <ERPCard
            title="Structural Inventory"
            description="Verified fee distributions per academic group"
            icon={<FileText className="h-5 w-5" />}
            color="blue"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groupedByClass.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-full inline-block mb-4">
                    <Building className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No allocations discovered</p>
                </div>
              ) : (
                groupedByClass.map((group) => {
                  const isExpanded = expandedClass === group.className;
                  
                  return (
                    <div key={group.className} className="group transition-all">
                      <button
                        onClick={() => setExpandedClass(isExpanded ? null : group.className)}
                        className={cn(
                          "w-full flex items-center justify-between p-6 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/20",
                          isExpanded && "bg-slate-50 dark:bg-slate-900/50"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all group-hover:rotate-6",
                            isExpanded ? "bg-emerald-500 text-white border-emerald-400" : "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800"
                          )}>
                            <Building className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Group {group.className}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{group.structures.length} Distribution Heads</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {group.medium.map(m => (
                            <span key={m} className="text-[8px] font-black uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md tracking-tighter shadow-sm">{m}</span>
                          ))}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                          <div className="overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                <tr>
                                  <th className="py-4 px-4">Context</th>
                                  <th className="py-4 px-4">Identity</th>
                                  <th className="py-4 px-4 text-right">Value</th>
                                  <th className="py-4 px-4 text-right">Maturity</th>
                                  <th className="py-4 px-4 text-center">Ops</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {group.structures.map((structure) => (
                                  <tr key={structure.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4 px-4">
                                       <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400">{structure.medium}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                      <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{structure.fee_type}</span>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{structure.section_id ? `Section ${structure.section_id}` : "Global"}</p>
                                    </td>
                                    <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                                      ₹{structure.amount?.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[10px] font-mono font-bold text-slate-400">
                                      {structure.due_date || "—"}
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center justify-center gap-1">
                                        <button className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg flex items-center justify-center">
                                          <Edit2 className="h-3 w-3 text-slate-400" />
                                        </button>
                                        <button onClick={() => handleDelete(structure.id)} className="h-8 w-8 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center justify-center group/del">
                                          <Trash2 className="h-3 w-3 text-slate-400 group-hover/del:text-rose-500" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ERPCard>
        </div>
      </div>

      {/* Assign Modal - Refined */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Allocate Distribution</h3>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Academic Group</label>
                  <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none" value={formData.class_id} onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}>
                    <option value="">Select</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Section</label>
                  <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none" value={formData.section_id} onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}>
                    <option value="">Global</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Category Head</label>
                <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none" value={formData.fee_head} onChange={(e) => setFormData({ ...formData, fee_head: e.target.value })}>
                  <option value="">Select category</option>
                  {feeHeads.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Value (₹)</label>
                <Input type="number" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <button onClick={handleSubmit} disabled={isLoading} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 w-full mt-4">
                Authorize Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}