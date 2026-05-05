"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Users, IndianRupee, ChevronDown, ChevronRight,
  Wallet, CreditCard, Building, Plus, Filter
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFamilies, setExpandedFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch families with children
  const { data: families, isLoading } = useQuery({
    queryKey: ["families", searchQuery],
    queryFn: async () => {
      // Get students with parent info grouped by parent
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

      // Group by parent
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
        
        // Estimate fee due (placeholder - would come from fee_structure)
        const estimatedDue = 15000; // This should come from actual fee structure

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

      // Filter by search
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
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by parent name, phone, or child name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="rounded-md">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Family List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading families...</div>
        ) : families?.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No families found</div>
        ) : (
          families?.map((family) => {
            const isExpanded = expandedFamilies.includes(family.id);
            const balance = family.total_family_due - family.total_family_paid;
            const isOverdue = balance > 0;

            return (
              <Card key={family.id} className="shadow-sm">
                <CardContent className="p-0">
                  {/* Family Header */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(family.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isExpanded ? "bg-emerald-100" : "bg-slate-100"
                      }`}>
                        <Users className={`h-5 w-5 ${isExpanded ? "text-emerald-600" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{family.parent_name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{family.parent_phone}</span>
                          <span>•</span>
                          <span>{family.children.length} child(ren)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          ₹{family.total_family_paid.toLocaleString()} paid
                        </p>
                        <p className="text-xs text-slate-500">
                          of ₹{family.total_family_due.toLocaleString()}
                        </p>
                      </div>
                      <Badge className={isOverdue ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                        {isOverdue ? `₹${balance.toLocaleString()} due` : "Settled"}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Children */}
                  {isExpanded && (
                    <div className="border-t bg-slate-50/50">
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead className="text-xs text-slate-500 uppercase">
                            <tr>
                              <th className="text-left py-2">Child Name</th>
                              <th className="text-left py-2">Class</th>
                              <th className="text-right py-2">Fee Due</th>
                              <th className="text-right py-2">Paid</th>
                              <th className="text-right py-2">Balance</th>
                              <th className="text-center py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {family.children.map((child) => {
                              const childBalance = child.total_due - child.total_paid;
                              return (
                                <tr key={child.id} className="hover:bg-white">
                                  <td className="py-2">
                                    <span className="font-medium text-slate-900">{child.name}</span>
                                    <span className="text-xs text-slate-500 ml-2">({child.admission_number})</span>
                                  </td>
                                  <td className="py-2 text-slate-600">{child.class}</td>
                                  <td className="py-2 text-right">₹{child.total_due.toLocaleString()}</td>
                                  <td className="py-2 text-right">₹{child.total_paid.toLocaleString()}</td>
                                  <td className="py-2 text-right font-medium">
                                    <span className={childBalance > 0 ? "text-red-600" : "text-emerald-600"}>
                                      ₹{childBalance.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="py-2 text-center">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => {
                                        setSelectedFamily(family);
                                        setShowPaymentModal(true);
                                      }}
                                    >
                                      Collect
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Bulk Actions */}
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Family Total:</span>
                            <span className="ml-2">₹{balance.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-md">
                              Generate Invoice
                            </Button>
                            <Button size="sm" className="rounded-md bg-emerald-600">
                              <Wallet className="h-4 w-4 mr-2" />
                              Collect All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}