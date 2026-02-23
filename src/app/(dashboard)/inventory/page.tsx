"use client";

import { useEffect, useState } from "react";
import { InventoryService } from "@/lib/services/inventory";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import {
  Package,
  ShoppingCart,
  AlertCircle,
  TrendingDown,
  ClipboardList,
  Plus,
  Search,
  Truck,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ProcurementHub() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await InventoryService.getStockTelemetry();
        setInventory(data);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Subscribe to realtime updates
    const subscription = InventoryService.subscribeToStockUpdates((payload) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === payload.new.id
            ? {
                ...payload.new,
                status:
                  payload.new.quantity_in_stock < 10
                    ? "Critical"
                    : payload.new.quantity_in_stock < 50
                      ? "Low"
                      : "Optimal",
              }
            : item,
        ),
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Procurement Hub
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Autonomous Inventory Monitoring & Asset Lifecycle Management
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Truck className="h-4 w-4" />
            Suppliers
          </Button>
          <Button variant="neon" className="rounded-2xl font-bold gap-x-2">
            <Plus className="h-4 w-4" />
            New Asset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card variant="glass" className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex justify-between items-start mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <Badge
              variant="futuristic"
              className="bg-red-500 text-white border-none"
            >
              IMMEDIATE
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Critical Shortages
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">
            {inventory
              .filter((i: any) => i.status === "Critical")
              .length.toString()
              .padStart(2, "0")}{" "}
            Items
          </h3>
        </Card>

        <Card variant="glass" className="p-6">
          <div className="flex justify-between items-start mb-4">
            <ClipboardList className="h-8 w-8 text-blue-500" />
            <Badge
              variant="futuristic"
              className="bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
              PENDING
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Draft Orders
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">05 Drafts</h3>
        </Card>

        <Card variant="futuristic" className="p-6">
          <div className="flex justify-between items-start mb-4">
            <ShoppingCart className="h-8 w-8 text-blue-400" />
            <Badge
              variant="futuristic"
              className="bg-blue-500 text-white border-none"
            >
              ACTIVE
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Asset Value
          </p>
          <h3 className="text-3xl font-black mt-1">
            $
            {inventory
              .reduce(
                (acc: number, curr: any) =>
                  acc + curr.quantity_in_stock * (curr.unit_price || 0),
                0,
              )
              .toLocaleString()}
          </h3>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Inventory Master List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
              Stock Telemetry
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search inventory..."
                className="pl-9 rounded-xl border-slate-100 h-10 text-xs"
              />
            </div>
          </div>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50">
                  <tr className="border-b">
                    <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Item Details
                    </th>
                    <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Stock Level
                    </th>
                    <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Status
                    </th>
                    <th className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inventory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/60 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-x-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {item.category?.name || "General"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="w-32 space-y-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{item.quantity_in_stock} / 100</span>
                            <span
                              className={cn(
                                item.quantity_in_stock < 20
                                  ? "text-red-500"
                                  : "text-green-500",
                              )}
                            >
                              {Math.round((item.quantity_in_stock / 100) * 100)}
                              %
                            </span>
                          </div>
                          <Progress
                            value={(item.quantity_in_stock / 100) * 100}
                            className="h-1"
                            indicatorClassName={
                              item.quantity_in_stock < 20
                                ? "bg-red-500"
                                : "bg-slate-900"
                            }
                          />
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge
                          variant="futuristic"
                          className={cn(
                            "text-[10px] font-black px-3 py-1",
                            item.status === "Critical"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : item.status === "Low"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20",
                          )}
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl font-black text-xs text-blue-500 hover:bg-blue-50"
                        >
                          MANAGE
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
            <ArrowRight className="h-4 w-4 text-slate-400" />
            Procurement Drafts
          </h3>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-x-2">
                <ShoppingCart className="h-3 w-3" />
                Auto-Suggested Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Science Kits (Resupply)
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Qty: 20 units • Est: $2,400
                      </p>
                    </div>
                    <Badge className="bg-red-50 text-red-600 border-none text-[8px] font-black">
                      CRITICAL
                    </Badge>
                  </div>
                  <Button className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs border-none shadow-none">
                    APPROVE DRAFT
                  </Button>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Fine Tip Markers
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Qty: 50 units • Est: $250
                      </p>
                    </div>
                    <Badge className="bg-yellow-50 text-yellow-600 border-none text-[8px] font-black">
                      LOW STOCK
                    </Badge>
                  </div>
                  <Button className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs border-none shadow-none">
                    APPROVE DRAFT
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-slate-50 flex flex-col gap-y-2">
              <p className="text-[10px] text-slate-400 font-medium text-center italic">
                Calculated based on average term consumption rates.
              </p>
            </CardFooter>
          </Card>

          <Card className="border-none glass futuristic-card bg-linear-to-br from-slate-900 to-slate-800 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <TrendingDown className="h-16 w-16" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              Cost Optimization
            </h4>
            <p className="text-xs opacity-60 font-medium leading-relaxed">
              Bulk ordering the 5 suggested drafts will result in a **12%
              institutional discount** ($420 saved).
            </p>
            <Button className="mt-6 w-full bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 shadow-xl shadow-blue-500/20 border-none">
              EXECUTE BATCH ORDER
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
