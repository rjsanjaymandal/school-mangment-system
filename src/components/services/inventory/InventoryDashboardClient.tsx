"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Package,
  AlertCircle,
  ShoppingCart,
  Search,
  Layers,
  IndianRupee,
  Truck,
  Plus,
  Activity,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Trash2,
  Minus,
  Edit3,
  X,
  Save,
  RotateCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid
} from "recharts";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";
import { createInventoryItem, updateInventoryItem, updateStock, deleteInventoryItem } from "@/app/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InventoryDashboardClientProps {
  initialInventory: any[];
  userRole?: string | null;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const STATUS_OPTS = ["Critical", "Low", "Optimal"];

type ItemForm = {
  name: string;
  category: string;
  quantity_in_stock: number;
  unit_price: number;
  sku: string;
  min_stock_level: number;
};

const emptyForm: ItemForm = { name: "", category: "", quantity_in_stock: 0, unit_price: 0, sku: "", min_stock_level: 5 };

export default function InventoryDashboardClient({ initialInventory, userRole }: InventoryDashboardClientProps) {
  const isAdmin = userRole === "admin";
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemForm>(emptyForm);

  const inventory = useMemo(() => initialInventory.map((item: any) => ({
    ...item,
    status: item.quantity_in_stock < (item.min_stock_level || 10) ? "Critical" : item.quantity_in_stock < 50 ? "Low" : "Optimal"
  })), [initialInventory]);

  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalValue = inventory.reduce((acc: number, curr: any) => acc + (curr.quantity_in_stock || 0) * (curr.unit_price || 0), 0);
  const lowStockCount = inventory.filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 10)).length;
  const categoryCount = new Set(inventory.map((i: any) => i.category)).size;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const consumptionVelocity = useMemo(() => {
    const byCategory = inventory.reduce<Record<string, { name: string; Consumption: number; Restock: number }>>((acc, item: any) => {
      const categoryName = item.category || "General";
      if (!acc[categoryName]) acc[categoryName] = { name: categoryName, Consumption: 0, Restock: 0 };
      const minimumStock = item.min_stock_level || 0;
      acc[categoryName].Consumption += Math.max(minimumStock - Number(item.quantity_in_stock || 0), 0);
      acc[categoryName].Restock += Number(item.quantity_in_stock || 0);
      return acc;
    }, {});
    return Object.values(byCategory).sort((a, b) => (b.Consumption + b.Restock) - (a.Consumption + a.Restock)).slice(0, 6);
  }, [inventory]);

  const assetDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach((item: any) => {
      const cat = item.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "",
      quantity_in_stock: item.quantity_in_stock || 0,
      unit_price: item.unit_price || 0,
      sku: item.sku || "",
      min_stock_level: item.min_stock_level || 5,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error("Item name is required"); return; }
    setProcessing("form");
    try {
      if (editingItem) {
        const res = await updateInventoryItem(editingItem.id, formData);
        if (res.success) { toast.success("Item updated"); setDialogOpen(false); router.refresh(); }
        else toast.error(res.error || "Update failed");
      } else {
        const res = await createInventoryItem(formData);
        if (res.success) { toast.success("Item created"); setDialogOpen(false); router.refresh(); }
        else toast.error(res.error || "Create failed");
      }
    } finally { setProcessing(null); }
  };

  const handleStockChange = async (id: string, delta: number) => {
    setProcessing(id);
    const item = inventory.find((i: any) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.quantity_in_stock || 0) + delta);
    const res = await updateStock(id, newQty);
    setProcessing(null);
    if (res.success) { toast.success(`Stock ${delta > 0 ? "increased" : "decreased"} to ${newQty}`); router.refresh(); }
    else toast.error(res.error || "Stock update failed");
  };

  const handleDelete = async (id: string) => {
    setProcessing(id);
    const res = await deleteInventoryItem(id);
    setProcessing(null);
    setDeleteConfirm(null);
    if (res.success) { toast.success("Item deleted"); router.refresh(); }
    else toast.error(res.error || "Delete failed");
  };

  const handleReorder = useCallback(async (item: any) => {
    setProcessing(item.id);
    const restockQty = Math.max((item.min_stock_level || 10) * 2 - (item.quantity_in_stock || 0), 10);
    const res = await updateStock(item.id, (item.quantity_in_stock || 0) + restockQty);
    setProcessing(null);
    if (res.success) { toast.success(`Reordered ${restockQty} units of ${item.name}`); router.refresh(); }
    else toast.error(res.error || "Reorder failed");
  }, [router]);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Inventory"
        subtitle="Manage school assets, stock levels, and procurement"
        icon={Package}
        color="indigo"
        actions={
          isAdmin && (
            <div className="flex items-center gap-3">
              <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all" onClick={() => router.refresh()}>
                <RotateCw className="h-4 w-4 inline mr-2" /> Refresh
              </button>
              <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all" onClick={openAddDialog}>
                <Plus className="h-4 w-4 inline mr-2" /> Add Item
              </button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Assets" value={inventory.length} icon={Package} color="blue" description="Registered items" />
        <DashboardStatCard title="Low Stock" value={lowStockCount} icon={AlertCircle} color="rose" description="Needs reorder" />
        <DashboardStatCard title="Asset Value" value={formatCurrency(totalValue)} icon={IndianRupee} color="emerald" description="Total inventory value" />
        <DashboardStatCard title="Categories" value={categoryCount} icon={Layers} color="purple" description="Item categories" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Consumption Velocity</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock consumption vs restock by category</p>
            </div>
            <Activity className="h-5 w-5 text-slate-300" />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontWeight: "bold" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                <Tooltip 
                  cursor={{ fill: "var(--muted)" }} 
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "10px" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{value}</span>} />
                <Bar dataKey="Consumption" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="Restock" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Distribution</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Items per category</p>
            </div>
            <Activity className="h-5 w-5 text-slate-300" />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={assetDistribution} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value">
                  {assetDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "10px" }}
                  labelStyle={{ color: "var(--foreground)" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{value}</span>} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Inventory Table + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search inventory..." className="pl-11 rounded-xl border-slate-200 dark:border-slate-800" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="flex items-center gap-2">
              {statusFilter && (
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 inline-flex items-center gap-1">
                  {statusFilter}
                  <button onClick={() => { setStatusFilter(null); setCurrentPage(1); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all" onClick={() => setShowFilters(!showFilters)}>
                <BarChart3 className="h-4 w-4 inline mr-2" /> Filter
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status:</span>
              {STATUS_OPTS.map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s === statusFilter ? null : s); setCurrentPage(1); }}
                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all", statusFilter === s ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30" : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300")}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Item</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Stock Level</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                  {isAdmin && <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-4 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                      {searchTerm || statusFilter ? "No matching items" : "No items found. Click + Add Item to get started."}
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm", item.status === "Critical" ? "bg-rose-500 text-white" : item.status === "Low" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")}>
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{item.category || "General"}{item.sku ? ` \u2022 ${item.sku}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          {isAdmin && (
                            <button onClick={() => handleStockChange(item.id, -1)} disabled={processing === item.id || item.quantity_in_stock <= 0}
                              className="h-7 w-7 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30">
                              <Minus className="h-3 w-3" />
                            </button>
                          )}
                          <div className="w-28 space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">{item.quantity_in_stock}</span>
                              <span className={cn("font-black", item.quantity_in_stock < (item.min_stock_level || 10) ? "text-rose-600" : "text-emerald-600")}>
                                {Math.round(Math.min((item.quantity_in_stock / Math.max(item.min_stock_level || 50, 50)) * 100, 100))}%
                              </span>
                            </div>
                            <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={cn("h-full transition-all duration-1000 rounded-full", item.quantity_in_stock < (item.min_stock_level || 10) ? "bg-rose-500" : "bg-emerald-500")}
                                style={{ width: `${Math.min((item.quantity_in_stock / Math.max(item.min_stock_level || 50, 50)) * 100, 100)}%` }} />
                            </div>
                          </div>
                          {isAdmin && (
                            <button onClick={() => handleStockChange(item.id, 1)} disabled={processing === item.id}
                              className="h-7 w-7 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30">
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", item.status === "Critical" ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30" : item.status === "Low" ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30")}>
                          {item.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditDialog(item)} className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center gap-1.5">
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button onClick={() => setDeleteConfirm(item.id)} className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 hover:bg-rose-550/10 dark:hover:bg-rose-950/20 transition-all flex items-center gap-1.5">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <UnifiedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredInventory.length} itemsPerPage={itemsPerPage} onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }} itemName="assets" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Order Drafts</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Auto-suggested reorders</p>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-4 space-y-4">
              {inventory.filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 10)).length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center">
                  <ShieldCheck className="h-12 w-12 text-emerald-500/20 mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">All stocked up! No reorders needed.</p>
                </div>
              ) : (
                inventory.filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 10)).slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">{item.name}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{item.category || "General"}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">{item.quantity_in_stock} left</span>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleReorder(item)} disabled={processing === item.id}
                        className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg transition-all">
                        <Truck className="h-3.5 w-3.5 inline mr-2" /> {processing === item.id ? "..." : "Reorder"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShoppingCart className="h-24 w-24 text-white" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-4">Quick Stats</h3>
            <div className="space-y-3 relative z-10">
              <div>
                <p className="text-3xl font-black text-white">{inventory.length}</p>
                <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Total Assets</p>
              </div>
              <div className="border-t border-emerald-500/30 pt-3">
                <p className="text-3xl font-black text-white">{formatCurrency(totalValue)}</p>
                <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Total Value</p>
              </div>
              <div className="border-t border-emerald-500/30 pt-3">
                <p className="text-3xl font-black text-amber-300">{lowStockCount}</p>
                <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Low Stock Items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                {editingItem ? <Edit3 className="h-5 w-5 text-white" /> : <Package className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h3 className="text-white text-lg font-black tracking-tight">{editingItem ? "Edit Item" : "Add New Item"}</h3>
                <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  {editingItem ? "Update inventory item details" : "Register a new asset in the inventory"}
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Whiteboard Markers" className="rounded-xl border-slate-200 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Category</label>
                  <div className="relative">
                    <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Stationery" className="rounded-xl border-slate-200 dark:border-slate-800" list="category-suggestions" />
                    <datalist id="category-suggestions">
                      {[...new Set(inventory.map((i: any) => i.category).filter(Boolean))].map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">SKU</label>
                  <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. ST-MB01" className="rounded-xl border-slate-200 dark:border-slate-800" />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Stock & Pricing</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Qty In Stock</label>
                    <Input type="number" min="0" value={formData.quantity_in_stock} onChange={(e) => setFormData({ ...formData, quantity_in_stock: parseInt(e.target.value) || 0 })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Unit Price (₹)</label>
                    <Input type="number" min="0" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Min Stock Level</label>
                    <Input type="number" min="0" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                  </div>
                </div>
              </div>
              {formData.name && formData.unit_price > 0 && formData.quantity_in_stock > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Estimated Value</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(formData.quantity_in_stock * formData.unit_price)}</span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setDialogOpen(false)} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={processing === "form"} className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                  <Save className="h-4 w-4 inline mr-2" /> {processing === "form" ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-rose-800 px-6 py-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-black tracking-tight">Delete Item</h3>
                <p className="text-rose-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to delete this item? All stock data will be permanently removed.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Cancel</button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={processing === deleteConfirm}
                  className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
                  <Trash2 className="h-4 w-4 inline mr-2" /> {processing === deleteConfirm ? "Deleting..." : "Delete Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}