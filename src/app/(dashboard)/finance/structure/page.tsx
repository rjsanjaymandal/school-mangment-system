"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Building, IndianRupee, ChevronDown, ChevronUp, FileText, LayoutGrid, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2"
          >
            <Plus className="h-4 w-4" />
            Assign Fee Head
          </Button>
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
            className="glass futuristic-card border-none shadow-xl rounded-2xl p-6"
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medium</Label>
                <select
                  className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white/50 focus:ring-emerald-500 transition-all"
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                >
                  {mediums.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Group</Label>
                <select
                  className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white/50 focus:ring-emerald-500 transition-all"
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                >
                  <option value="">Select target group</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</Label>
                <select
                  className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white/50 focus:ring-emerald-500 transition-all"
                  value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                >
                  <option value="">Global Allocation</option>
                  {sections.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Head</Label>
                <select
                  className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white/50 focus:ring-emerald-500 transition-all"
                  value={formData.fee_head}
                  onChange={(e) => setFormData({ ...formData, fee_head: e.target.value })}
                >
                  <option value="">Select category</option>
                  {feeHeads.map(h => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</Label>
                <Input
                  type="number"
                  className="h-11 rounded-xl border-slate-200 text-xs font-bold"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maturity Date</Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-tighter"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 mt-4"
              >
                {isLoading ? "Executing..." : "Authorize Allocation"}
              </Button>
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
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="divide-y divide-slate-100">
              {groupedByClass.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="p-6 bg-slate-50 rounded-full inline-block mb-4">
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
                          "w-full flex items-center justify-between p-6 transition-all hover:bg-slate-50/50",
                          isExpanded && "bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all group-hover:rotate-6",
                            isExpanded ? "bg-emerald-500 text-white border-emerald-400" : "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                            <Building className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">Group {group.className}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{group.structures.length} Distribution Heads</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {group.medium.map(m => (
                            <span key={m} className="text-[8px] font-black uppercase bg-white border border-slate-200 px-2.5 py-1 rounded-md tracking-tighter shadow-sm">{m}</span>
                          ))}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-6 bg-slate-50/30 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                          <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50/80 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                  <th className="px-6 py-4">Context</th>
                                  <th className="px-6 py-4">Identity</th>
                                  <th className="px-6 py-4 text-right">Value</th>
                                  <th className="px-6 py-4 text-right">Maturity</th>
                                  <th className="px-6 py-4 text-center">Ops</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {group.structures.map((structure) => (
                                  <tr key={structure.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                       <span className="text-[9px] font-black uppercase text-slate-500">{structure.medium}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-sm font-bold text-slate-900 tracking-tight">{structure.fee_type}</span>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{structure.section_id ? `Section ${structure.section_id}` : "Global"}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                                      ₹{structure.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-[10px] font-mono font-bold text-slate-400">
                                      {structure.due_date || "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-lg">
                                          <Edit2 className="h-3 w-3 text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(structure.id)} className="h-8 w-8 hover:bg-rose-50 rounded-lg group/del">
                                          <Trash2 className="h-3 w-3 text-slate-400 group-hover/del:text-rose-500" />
                                        </Button>
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
             <DialogHeader>
               <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Allocate Distribution</DialogTitle>
               <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                 Assign financial heads to academic groups
               </DialogDescription>
             </DialogHeader>
          </div>
          <div className="p-8 space-y-5">
            {/* Reusing the same logic but condensed */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Academic Group</Label>
                  <select className="w-full h-11 px-4 py-2 border rounded-xl text-xs font-bold" value={formData.class_id} onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}>
                    <option value="">Select</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Section</Label>
                  <select className="w-full h-11 px-4 py-2 border rounded-xl text-xs font-bold" value={formData.section_id} onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}>
                    <option value="">Global</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Category Head</Label>
                <select className="w-full h-11 px-4 py-2 border rounded-xl text-xs font-bold" value={formData.fee_head} onChange={(e) => setFormData({ ...formData, fee_head: e.target.value })}>
                  <option value="">Select category</option>
                  {feeHeads.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Value (₹)</Label>
                <Input type="number" className="h-11 rounded-xl" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 bg-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl mt-4">
                Authorize Allocation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}