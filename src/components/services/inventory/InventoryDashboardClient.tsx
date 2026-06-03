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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid
} from "recharts";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ERPCard } from "@/components/ui/erp-card";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
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
              <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50" onClick={() => router.refresh()}>
                <RotateCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2" onClick={openAddDialog}>
                <Plus className="h-4 w-4" /> Add Item
              </Button>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ERPCard title="Consumption Velocity" description="Stock consumption vs restock by category" color="indigo" icon={<Activity className="h-5 w-5" />} className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="h-[280px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionVelocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: "bold" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                  <Tooltip cursor={{ fill: "rgba(99,102,241,0.03)" }} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{value}</span>} />
                  <Bar dataKey="Consumption" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="Restock" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ERPCard>
        </div>
        <div>
          <ERPCard title="Distribution" description="Items per category" color="indigo" icon={<Activity className="h-5 w-5" />} className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="h-[280px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={assetDistribution} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value">
                    {assetDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{value}</span>} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </ERPCard>
        </div>
      </div>

      {/* Inventory Table + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ERPCard title="Stock Ledger" description="Real-time inventory asset register" color="indigo" icon={<ClipboardList className="h-5 w-5" />} className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search inventory..." className="pl-11 h-10 rounded-xl bg-white border-slate-200 text-xs font-bold shadow-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="flex items-center gap-2">
                {statusFilter && (
                  <Badge variant="outline" className="gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">
                    {statusFilter}
                    <button onClick={() => { setStatusFilter(null); setCurrentPage(1); }}><X className="h-3 w-3 ml-1" /></button>
                  </Badge>
                )}
                <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50" onClick={() => setShowFilters(!showFilters)}>
                  <BarChart3 className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-3 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status:</span>
                {STATUS_OPTS.map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s === statusFilter ? null : s); setCurrentPage(1); }}
                    className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all", statusFilter === s ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300")}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4">Status</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInventory.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className="px-6 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                        {searchTerm || statusFilter ? "No matching items" : "No items found. Click + Add Item to get started."}
                      </td>
                    </tr>
                  ) : (
                    paginatedInventory.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg transition-transform group-hover:rotate-3", item.status === "Critical" ? "bg-rose-500 text-white shadow-rose-500/20" : item.status === "Low" ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20")}>
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 tracking-tight text-sm group-hover:text-indigo-600 transition-colors">{item.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{item.category || "General"}{item.sku ? ` \u2022 ${item.sku}` : ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {isAdmin && (
                              <button onClick={() => handleStockChange(item.id, -1)} disabled={processing === item.id || item.quantity_in_stock <= 0}
                                className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30">
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
                              <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-1000 rounded-full", item.quantity_in_stock < (item.min_stock_level || 10) ? "bg-rose-500" : "bg-emerald-500")}
                                  style={{ width: `${Math.min((item.quantity_in_stock / Math.max(item.min_stock_level || 50, 50)) * 100, 100)}%` }} />
                              </div>
                            </div>
                            {isAdmin && (
                              <button onClick={() => handleStockChange(item.id, 1)} disabled={processing === item.id}
                                className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30">
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm", item.status === "Critical" ? "bg-rose-50 text-rose-600 border-rose-100" : item.status === "Low" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                            {item.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEditDialog(item)} className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-1.5">
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button onClick={() => setDeleteConfirm(item.id)} className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-1.5">
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
          </ERPCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <ERPCard title="Order Drafts" description="Auto-suggested reorders" color="amber" icon={<ShoppingCart className="h-5 w-5" />} className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <ScrollArea className="h-[320px]">
              <div className="p-4 space-y-4">
                {inventory.filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 10)).length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <ShieldCheck className="h-12 w-12 text-emerald-500/20 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">All stocked up!<br />No reorders needed.</p>
                  </div>
                ) : (
                  inventory.filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 10)).slice(0, 5).map((item: any) => (
                    <div key={item.id} className="p-5 rounded-2xl border border-slate-100 bg-white group hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 block group-hover:text-indigo-600 transition-colors">{item.name}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{item.category || "General"}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-rose-100 bg-rose-50 text-rose-600">{item.quantity_in_stock} left</Badge>
                      </div>
                      {isAdmin && (
                        <Button onClick={() => handleReorder(item)} disabled={processing === item.id}
                          className="w-full h-9 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest shadow-lg transition-all mt-3">
                          <Truck className="h-3.5 w-3.5 mr-2" /> {processing === item.id ? "..." : "Reorder"}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </ERPCard>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-24 w-24 text-white" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">Quick Stats</h3>
            <div className="space-y-3 relative z-10">
              <div>
                <p className="text-3xl font-black text-white">{inventory.length}</p>
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Total Assets</p>
              </div>
              <div className="border-t border-indigo-500/30 pt-3">
                <p className="text-3xl font-black text-white">{formatCurrency(totalValue)}</p>
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Total Value</p>
              </div>
              <div className="border-t border-indigo-500/30 pt-3">
                <p className="text-3xl font-black text-amber-300">{lowStockCount}</p>
                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Low Stock Items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              {editingItem ? <Edit3 className="h-5 w-5 text-white" /> : <Package className="h-5 w-5 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-black tracking-tight">{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              <DialogDescription className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {editingItem ? "Update inventory item details" : "Register a new asset in the inventory"}
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-indigo-500" /> Item Name <span className="text-rose-500">*</span>
              </label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Whiteboard Markers" className="rounded-xl border-slate-200 focus:border-indigo-300 h-11 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" /> Category
                </label>
                <div className="relative">
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Stationery" className="rounded-xl border-slate-200 focus:border-indigo-300 h-11 text-sm" list="category-suggestions" />
                  <datalist id="category-suggestions">
                    {[...new Set(inventory.map((i: any) => i.category).filter(Boolean))].map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-indigo-500" /> SKU
                </label>
                <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. ST-MB01" className="rounded-xl border-slate-200 focus:border-indigo-300 h-11 text-sm" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Stock &amp; Pricing</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Qty In Stock</label>
                  <Input type="number" min="0" value={formData.quantity_in_stock} onChange={(e) => setFormData({ ...formData, quantity_in_stock: parseInt(e.target.value) || 0 })} className="rounded-xl border-slate-200 focus:border-indigo-300 h-11 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Unit Price (₹)</label>
                  <Input type="number" min="0" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })} className="rounded-xl border-slate-200 focus:border-indigo-300 h-11 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Min Stock Level</label>
                  <Input type="number" min="0" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })} className="rounded-xl border-slate-200 focus:border-indigo-300 h-11 text-sm" />
                </div>
              </div>
            </div>
            {formData.name && formData.unit_price > 0 && formData.quantity_in_stock > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Estimated Value</span>
                <span className="text-sm font-black text-indigo-700">{formatCurrency(formData.quantity_in_stock * formData.unit_price)}</span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-slate-200">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={processing === "form"} className="rounded-xl h-11 px-6 bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95">
                <Save className="h-4 w-4" /> {processing === "form" ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-rose-600 to-rose-800 px-6 py-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-black tracking-tight">Delete Item</DialogTitle>
              <DialogDescription className="text-rose-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">Are you sure you want to delete this item? All stock data will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-slate-200" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={processing === deleteConfirm}
                className="rounded-xl h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95">
                <Trash2 className="h-4 w-4" /> {processing === deleteConfirm ? "Deleting..." : "Delete Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
