"use client";

import { useState } from "react";
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

const mockInventory = [
  {
    id: "1",
    name: "Institutional Laptops",
    category: "Hardware",
    stock: 12,
    minStock: 10,
    status: "Optimal",
    price: 850,
  },
  {
    id: "2",
    name: "Premium Science Kits",
    category: "Lab Equipment",
    stock: 4,
    minStock: 15,
    status: "Critical",
    price: 120,
  },
  {
    id: "3",
    name: "Neural Interface Pens",
    category: "Stationary",
    stock: 45,
    minStock: 20,
    status: "Optimal",
    price: 15,
  },
  {
    id: "4",
    name: "Smart Whiteboard Markers",
    category: "Stationary",
    stock: 8,
    minStock: 25,
    status: "Low",
    price: 5,
  },
];

export default function ProcurementHub() {
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
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Plus className="h-4 w-4" />
            New Asset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none glass futuristic-card p-6 border-red-100 bg-red-50/10">
          <div className="flex justify-between items-start mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <Badge className="bg-red-500 text-white border-none text-[10px] font-black">
              IMMEDIATE
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Critical Shortages
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">02 Items</h3>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <div className="flex justify-between items-start mb-4">
            <ClipboardList className="h-8 w-8 text-blue-500" />
            <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-black">
              PENDING
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Draft Orders
          </p>
          <h3 className="text-3xl font-black mt-1 text-slate-900">05 Drafts</h3>
        </Card>

        <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
          <div className="flex justify-between items-start mb-4">
            <ShoppingCart className="h-8 w-8 text-blue-400" />
            <Badge className="bg-blue-500 text-white border-none text-[10px] font-black">
              ACTIVE
            </Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Asset Value
          </p>
          <h3 className="text-3xl font-black mt-1">$412,500</h3>
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
                  {mockInventory.map((item) => (
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
                              {item.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="w-32 space-y-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>
                              {item.stock} / {item.minStock * 3}
                            </span>
                            <span
                              className={cn(
                                item.stock < item.minStock
                                  ? "text-red-500"
                                  : "text-green-500",
                              )}
                            >
                              {Math.round(
                                (item.stock / (item.minStock * 3)) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={(item.stock / (item.minStock * 3)) * 100}
                            className="h-1"
                            indicatorClassName={
                              item.stock < item.minStock
                                ? "bg-red-500"
                                : "bg-slate-900"
                            }
                          />
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-black px-3 py-1",
                            item.status === "Critical"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : item.status === "Low"
                                ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                                : "bg-green-50 text-green-600 border-green-100",
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
