"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Search, Users, IndianRupee, ChevronDown, ChevronRight,
  Wallet, Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface Family {
  id: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  children: {
    id: string;
    name: string;
    class: string;
    admission_number: string;
    total_due: number;
    total_paid: number;
  }[];
  total_family_due: number;
  total_family_paid: number;
}

export function FamilyLedger() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFamilies, setExpandedFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: families, isLoading } = useQuery({
    queryKey: ["families", searchQuery],
    queryFn: async () => {
      const { data: students } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          father_name,
          mother_name,
          parent_phone,
          parent_email,
          class:classes(name),
          payments:payments(amount_paid, status, payment_date)
        `)
        .order("father_name");

      const familyMap = new Map<string, Family>();
      
      students?.forEach((student: any) => {
        const parentKey = student.parent_phone || student.father_name || "unknown";
        
        if (!familyMap.has(parentKey)) {
          familyMap.set(parentKey, {
            id: parentKey,
            parent_name: student.father_name || student.mother_name || "Unknown",
            parent_phone: student.parent_phone || "",
            parent_email: student.parent_email || "",
            children: [],
            total_family_due: 0,
            total_family_paid: 0,
          });
        }

        const family = familyMap.get(parentKey)!;
        const totalPaid = student.payments
          ?.filter((p: any) => p.status === "completed")
          ?.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0) || 0;
        
        const estimatedDue = 15000;

        family.children.push({
          id: student.id,
          name: student.profile?.full_name || student.father_name,
          class: student.class?.name || "N/A",
          admission_number: student.admission_number,
          total_due: estimatedDue,
          total_paid: totalPaid,
        });

        family.total_family_due += estimatedDue;
        family.total_family_paid += totalPaid;
      });

      const filtered = Array.from(familyMap.values()).filter(f => 
        f.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.parent_phone.includes(searchQuery) ||
        f.children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      return filtered;
    },
  });

  const toggleExpand = (familyId: string) => {
    setExpandedFamilies(prev => 
      prev.includes(familyId) 
        ? prev.filter(id => id !== familyId)
        : [...prev, familyId]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by parent name, phone, or child name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-slate-200"
            />
          </div>
          <button className="h-11 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all flex items-center gap-x-2">
            <Search className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="space-y-3">
              <div className="h-6 w-48 bg-slate-100 rounded-xl mx-auto animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded-xl mx-auto animate-pulse" />
            </div>
          </div>
        ) : families?.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No families found</p>
          </div>
        ) : (
          families?.map((family) => {
            const isExpanded = expandedFamilies.includes(family.id);
            const balance = family.total_family_due - family.total_family_paid;
            const isOverdue = balance > 0;

            return (
              <div key={family.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => toggleExpand(family.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isExpanded ? "bg-emerald-50" : "bg-slate-100"
                    }`}>
                      <Users className={`h-5 w-5 ${isExpanded ? "text-emerald-600" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{family.parent_name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{family.parent_phone}</span>
                        <span>•</span>
                        <span>{family.children.length} child(ren)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{family.total_family_paid.toLocaleString()} paid</p>
                      <p className="text-xs text-slate-500">of ₹{family.total_family_due.toLocaleString()}</p>
                    </div>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      isOverdue ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {isOverdue ? `₹${balance.toLocaleString()} due` : "Settled"}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-5">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left py-3">Child Name</th>
                            <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left py-3">Class</th>
                            <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right py-3">Fee Due</th>
                            <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right py-3">Paid</th>
                            <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right py-3">Balance</th>
                            <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {family.children.map((child) => {
                            const childBalance = child.total_due - child.total_paid;
                            return (
                              <tr key={child.id} className="hover:bg-white/50 transition-colors">
                                <td className="py-3">
                                  <span className="font-bold text-slate-900">{child.name}</span>
                                  <span className="text-xs text-slate-500 ml-2">({child.admission_number})</span>
                                </td>
                                <td className="py-3 text-slate-600">{child.class}</td>
                                <td className="py-3 text-right font-bold">₹{child.total_due.toLocaleString()}</td>
                                <td className="py-3 text-right font-bold">₹{child.total_paid.toLocaleString()}</td>
                                <td className="py-3 text-right font-bold">
                                  <span className={childBalance > 0 ? "text-red-600" : "text-emerald-600"}>
                                    ₹{childBalance.toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-3 text-center">
                                  <button 
                                    className="h-8 rounded-xl border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all"
                                    onClick={() => {
                                      setSelectedFamily(family);
                                      setShowPaymentModal(true);
                                    }}
                                  >
                                    Collect
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-bold">Family Total:</span>
                          <span className="ml-2">₹{balance.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="h-9 rounded-xl border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all">
                            Generate Invoice
                          </button>
                          <button className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest px-4 shadow-lg transition-all flex items-center gap-x-2">
                            <Wallet className="h-3.5 w-3.5" /> Collect All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}