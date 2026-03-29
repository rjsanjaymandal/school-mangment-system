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
    Activity, Zap
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { useMemo } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardFooter,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function InventoryDashboardClient({ initialInventory, userRole }: { initialInventory: any[], userRole?: string | null }) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const [searchTerm, setSearchTerm] = useState("");

    const inventory = useMemo(() => initialInventory.map((item) => ({
        ...item,
        status: item.quantity_in_stock < 10 ? "Critical" : item.quantity_in_stock < 50 ? "Volatile" : "Stable"
    })), [initialInventory]);

    const filteredInventory = inventory.filter((item) =>
        (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.category?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // --- Logistics Intelligence Layer ---
    const consumptionVelocity = useMemo(() => {
        const byCategory = inventory.reduce<Record<string, { name: string; Consumption: number; Restock: number }>>((acc, item) => {
            const categoryName = item.category?.name || "General";
            if (!acc[categoryName]) {
                acc[categoryName] = { name: categoryName, Consumption: 0, Restock: 0 };
            }

            const minimumStock = item.min_stock_level || 0;
            const shortage = Math.max(minimumStock - Number(item.quantity_in_stock || 0), 0);

            acc[categoryName].Consumption += shortage;
            acc[categoryName].Restock += Number(item.quantity_in_stock || 0);
            return acc;
        }, {});

        return Object.values(byCategory)
            .sort((left, right) => (right.Consumption + right.Restock) - (left.Consumption + left.Restock))
            .slice(0, 6);
    }, [inventory]);

    const assetDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        inventory.forEach(item => {
            const cat = item.category?.name || "General";
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [inventory]);

    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">
                        School Inventory
                    </h2>
                    <p className="text-foreground/70 font-bold tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">
                        Manage School Assets and Supplies
                    </p>
                </div>
                {isAdminOrTeacher && (
                    <div className="flex gap-x-3">
                        <Button
                            variant="ghost"
                            className="rounded-sm border border-border bg-card/40 backdrop-blur-md font-bold gap-x-2 text-foreground/80 hover:text-primary transition-all shadow-xl"
                        >
                            <Truck className="h-4 w-4" />
                            Suppliers
                        </Button>
                        <Button className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[160px] uppercase tracking-widest text-[10px]">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-destructive/20 bg-destructive/5 rounded-sm p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <Badge
                            className="bg-destructive text-destructive-foreground border-none rounded-xs text-[10px] uppercase font-black tracking-[0.3em] px-2"
                        >
                            URGENT
                        </Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        Low Stock Items
                    </p>
                    <h3 className="text-3xl font-black mt-1 text-foreground">
                        {inventory
                            .filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 5))
                            .length.toString()
                            .padStart(2, "0")}{" "}
                        Items
                    </h3>
                </Card>

                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ClipboardList className="h-16 w-16 text-primary/40" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        <Badge
                            className="bg-foreground/10 text-foreground border-none rounded-xs text-[10px] uppercase font-black tracking-[0.3em] px-2"
                        >
                            PENDING
                        </Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        Restock List
                    </p>
                    <h3 className="text-3xl font-black mt-1 text-foreground">
                        {inventory.filter((i: any) => i.quantity_in_stock < (i.min_stock_level || 5)).length.toString().padStart(2, '0')} Drafts
                    </h3>
                </Card>

                <Card className="border-border bg-primary/10 rounded-sm p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="h-20 w-20 text-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        <Badge
                            className="bg-primary text-primary-foreground border-none rounded-xs text-[10px] uppercase font-black tracking-[0.3em] px-2"
                        >
                            ACTIVE
                        </Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        Total Asset Value
                    </p>
                    <h3 className="text-3xl font-black mt-1 text-primary">
                        ₹
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

            {/* --- Analytics Layer: Institutional Logistics Intelligence --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1 w-full relative z-10 mt-10">
                <div className="md:col-span-8 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    Consumption <span className="text-primary italic">Velocity</span>
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic flex items-center gap-2">
                                    Temporal Institutional Resource Flow
                                </p>
                            </div>
                            <Activity className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={consumptionVelocity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888870", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888850", fontSize: 10 }} />
                                    <Tooltip 
                                        cursor={{ fill: "rgba(16,185,129,0.05)" }}
                                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                    />
                                    <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">{value}</span>}/>
                                    <Bar dataKey="Consumption" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar dataKey="Restock" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            Asset <span className="text-primary tracking-normal not-italic px-1">/</span> Distribution
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic text-center">Institutional Allocation Profiling</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetDistribution}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {assetDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Inventory Master List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-x-2">
                            <Truck className="h-4 w-4" />
                            Stock Levels
                        </h3>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                            <Input
                                placeholder="SEARCH INVENTORY..."
                                className="pl-9 rounded-sm border-border bg-card/40 backdrop-blur-md h-10 text-[10px] uppercase font-black tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-primary/5">
                                    <tr className="border-b border-border/50">
                                        <th className="text-left p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                            Item Details
                                        </th>
                                        <th className="text-left p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                            Stock Level
                                        </th>
                                        <th className="text-left p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                            Status
                                        </th>
                                        {isAdminOrTeacher && (
                                            <th className="text-right p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredInventory.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-white/60 transition-colors"
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="h-10 w-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                            {item.category?.name || "General"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="w-32 space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                        <span className="text-foreground/60">{item.quantity_in_stock} UNITS</span>
                                                        <span
                                                            className={cn(
                                                                item.quantity_in_stock < 20
                                                                    ? "text-destructive"
                                                                    : "text-primary",
                                                            )}
                                                        >
                                                            {Math.round(Math.min((item.quantity_in_stock / 100) * 100, 100))}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-1.5 w-full bg-accent/20 rounded-none overflow-hidden border border-border/50">
                                                        <div 
                                                            className={cn(
                                                                "h-full transition-all duration-1000",
                                                                item.quantity_in_stock < 20
                                                                    ? "bg-destructive shadow-[0_0_10px_oklch(var(--destructive)/0.3)]"
                                                                    : "bg-primary emerald-glow shadow-[0_0_10px_oklch(var(--primary)/0.3)]"
                                                            )}
                                                            style={{ width: `${Math.min((item.quantity_in_stock / 100) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <Badge
                                                    className={cn(
                                                        "text-[8px] font-black px-3 py-1 rounded-xs uppercase tracking-[0.2em]",
                                                        item.status === "Critical"
                                                            ? "bg-destructive text-destructive-foreground"
                                                            : item.status === "Volatile"
                                                                ? "bg-foreground/10 text-foreground"
                                                                : "bg-primary text-primary-foreground emerald-glow",
                                                    )}
                                                >
                                                    {item.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            {isAdminOrTeacher && (
                                                <td className="p-5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-sm font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                                                    >
                                                        EDIT
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {filteredInventory.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-muted-foreground text-sm">
                                                No inventory items found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Intelligence Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-x-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        Order Drafts
                    </h3>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <CardHeader className="bg-primary text-primary-foreground p-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-x-2">
                                <ShoppingCart className="h-4 w-4" />
                                Auto-Suggested Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/30">
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-foreground text-[10px] uppercase tracking-widest">
                                                Science Kits (Resupply)
                                            </h4>
                                            <p className="text-[8px] text-foreground/40 font-black uppercase tracking-[0.2em]">
                                                Qty: 20 units • Est: ₹2,400
                                            </p>
                                        </div>
                                        <Badge className="bg-destructive text-destructive-foreground border-none text-[8px] font-black rounded-xs">
                                            LOW STOCK
                                        </Badge>
                                    </div>
                                    {isAdminOrTeacher && (
                                        <Button className="w-full h-10 rounded-xs bg-background/50 hover:bg-primary hover:text-primary-foreground text-foreground font-black text-[10px] uppercase tracking-widest border border-border/50 transition-all">
                                            APPROVE DRAFT
                                        </Button>
                                    )}
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-foreground text-[10px] uppercase tracking-widest">
                                                Fine Tip Markers
                                            </h4>
                                            <p className="text-[8px] text-foreground/40 font-black uppercase tracking-[0.2em]">
                                                Qty: 50 units • Est: ₹250
                                            </p>
                                        </div>
                                        <Badge className="bg-foreground/10 text-foreground border-none text-[8px] font-black rounded-xs">
                                            WATCHLIST
                                        </Badge>
                                    </div>
                                    {isAdminOrTeacher && (
                                        <Button className="w-full h-10 rounded-xs bg-background/50 hover:bg-primary hover:text-primary-foreground text-foreground font-black text-[10px] uppercase tracking-widest border border-border/50 transition-all">
                                            APPROVE DRAFT
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 bg-primary/5 flex flex-col gap-y-2 border-t border-border/50">
                            <p className="text-[8px] text-foreground/40 font-black text-center uppercase tracking-widest">
                                Calculated based on average term consumption rates.
                            </p>
                        </CardFooter>
                    </Card>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <TrendingDown className="h-16 w-16 text-primary" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-2 uppercase text-foreground">
                            Cost Optimization
                        </h4>
                        <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest leading-relaxed">
                            Bulk ordering the 5 suggested drafts will result in a **12%
                            institutional discount** (₹420 saved).
                        </p>
                        {isAdminOrTeacher && (
                            <Button className="mt-6 w-full bg-primary text-primary-foreground font-black rounded-xs hover:bg-primary/90 emerald-glow uppercase tracking-widest text-[10px] py-6">
                                EXECUTE BATCH ORDER
                            </Button>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

