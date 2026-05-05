"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Building, IndianRupee, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useFinanceStore } from "@/lib/store/finance-store";

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
            <Building className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Fee Structure</h1>
            <p className="text-sm text-slate-500">Session: {activeSession}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 rounded-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Head to Class
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Assign Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 border-l-4 border-l-emerald-500 pl-3">
              Assign Fee Head to Class
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Select Medium</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                >
                  {mediums.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Select Class</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                >
                  <option value="">Select class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Section (Optional)</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
                  value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                >
                  <option value="">All Sections</option>
                  {sections.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Select Fee Head</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
                  value={formData.fee_head}
                  onChange={(e) => setFormData({ ...formData, fee_head: e.target.value })}
                >
                  <option value="">Select fee head</option>
                  {feeHeads.map(h => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Fee Amount (₹)</Label>
                <Input
                  type="number"
                  className="mt-1 rounded-md"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Due Date</Label>
                <Input
                  type="date"
                  className="mt-1 rounded-md"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-md"
              >
                {isLoading ? "Saving..." : "Assign & Set Amount"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Accordion List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="p-4 border-b border-slate-100 border-l-4 border-l-emerald-500">
              <h3 className="text-sm font-semibold text-slate-900">Current Structure</h3>
              <p className="text-xs text-slate-500">Click a class to expand</p>
            </div>
            
            <div className="divide-y divide-slate-100">
              {groupedByClass.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No fee structures assigned yet
                </div>
              ) : (
                groupedByClass.map((group) => {
                  const isExpanded = expandedClass === group.className;
                  
                  return (
                    <div key={group.className}>
                      <button
                        onClick={() => setExpandedClass(isExpanded ? null : group.className)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900">Class {group.className}</p>
                            <p className="text-xs text-slate-500">{group.structures.length} fee heads</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {group.medium.map(m => (
                            <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                          ))}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-50 p-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-slate-500 uppercase">
                                <th className="text-left py-2">Medium</th>
                                <th className="text-left py-2">Fee Head</th>
                                <th className="text-left py-2">Section</th>
                                <th className="text-right py-2">Amount</th>
                                <th className="text-right py-2">Due Date</th>
                                <th className="text-center py-2">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {group.structures.map((structure) => (
                                <tr key={structure.id}>
                                  <td className="py-2 text-slate-600">{structure.medium}</td>
                                  <td className="py-2 font-medium text-slate-900">{structure.fee_type}</td>
                                  <td className="py-2 text-slate-500">{structure.section_id || "All"}</td>
                                  <td className="py-2 text-right font-semibold text-slate-900">₹{structure.amount?.toLocaleString()}</td>
                                  <td className="py-2 text-right text-slate-500">{structure.due_date || "N/A"}</td>
                                  <td className="py-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <Edit2 className="h-3 w-3 text-slate-500" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDelete(structure.id)} className="h-7 w-7 p-0">
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Fee Head to Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form as above - simplified for modal */}
            <div>
              <Label className="text-sm font-medium">Medium</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
              >
                {mediums.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Class</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                >
                  <option value="">Select</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Section</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                >
                  <option value="">All</option>
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Fee Head</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.fee_head}
                onChange={(e) => setFormData({ ...formData, fee_head: e.target.value })}
              >
                <option value="">Select</option>
                {feeHeads.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Amount (₹)</Label>
              <Input
                type="number"
                className="mt-1 rounded-md"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-emerald-600">
              {isLoading ? "Saving..." : "Assign & Set Amount"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}