"use client";

import { useMemo, useState } from "react";
import { Bus, MapPin, Plus, Navigation, ShieldCheck, Wifi, Edit2, Trash2, ArrowRight, UserMinus, Phone, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createRoute, updateRoute, deleteRoute, unassignStudentTransport } from "@/app/actions/transport";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { 
    Search, Filter, Hash, CheckCircle2, Clock, 
    Zap, Activity, LayoutGrid, ListFilter 
} from "lucide-react";
import { StopManagement } from "./StopManagement";
import { StudentAssignmentDialog } from "./StudentAssignmentDialog";

interface TransportDashboardProps {
    routes: any[];
    stops: any[];
    assignments: any[];
    userRole?: string | null;
}

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export function TransportDashboard({ routes, stops, assignments, userRole }: TransportDashboardProps) {
    const isAdmin = userRole === "admin";
    const router = useRouter();
    const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
    const [isEditRouteOpen, setIsEditRouteOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [editingRoute, setEditingRoute] = useState<any>(null);

    // --- Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // --- Analytics Logic ---
    const fleetOccupancyData = useMemo(() => {
        return routes.map(r => {
            const assigned = assignments.filter(a => a.route_id === r.id).length;
            const cap = r.capacity || 40;
            return {
                name: r.name,
                occupancy: Math.round((assigned / cap) * 100),
                raw: `${assigned}/${cap}`
            };
        }).sort((a, b) => b.occupancy - a.occupancy).slice(0, 5);
    }, [routes, assignments]);

    const routeStatusData = useMemo(() => {
        const statusMap: Record<string, number> = {};
        routes.forEach(r => {
            const s = r.status || "active";
            statusMap[s] = (statusMap[s] || 0) + 1;
        });
        return Object.entries(statusMap).map(([name, value], idx) => ({
            name: name.toUpperCase(),
            value,
            color: COLORS[idx % COLORS.length]
        }));
    }, [routes]);

    const [routeForm, setRouteForm] = useState({
        name: "",
        route_number: "",
        driver_name: "",
        driver_phone: "",
        plate_number: "",
        capacity: "40",
        status: "active"
    });

    const handleCreateRoute = async () => {
        if (!routeForm.name) return toast.error("Route name is required");
        setLoading(true);
        const result = await createRoute({ ...routeForm, capacity: parseInt(routeForm.capacity) || 40 });
        setLoading(false);
        if (result.success) {
            setIsAddRouteOpen(false);
            setRouteForm({ name: "", route_number: "", driver_name: "", driver_phone: "", plate_number: "", capacity: "40", status: "active" });
            router.refresh();
            toast.success("Route created successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleUpdateRoute = async () => {
        if (!editingRoute) return;
        setLoading(true);
        const result = await updateRoute(editingRoute.id, {
            ...routeForm,
            capacity: parseInt(routeForm.capacity) || 40
        });
        setLoading(false);
        if (result.success) {
            setIsEditRouteOpen(false);
            setEditingRoute(null);
            router.refresh();
            toast.success("Route updated successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleDeleteRoute = async (id: string) => {
        if (!confirm("Are you sure you want to delete this route? This will also affect assignments and stops.")) return;
        setLoading(true);
        const result = await deleteRoute(id);
        setLoading(false);
        if (result.success) {
            if (selectedRoute?.id === id) setSelectedRoute(null);
            router.refresh();
            toast.success("Route deleted successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleUnassign = async (studentId: string) => {
        if (!confirm("Remove this student from transport?")) return;
        setLoading(true);
        const result = await unassignStudentTransport(studentId);
        setLoading(false);
        if (result.success) {
            router.refresh();
            toast.success("Student unassigned successfully");
        } else {
            toast.error(result.error);
        }
    };

    const openEditRoute = (route: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingRoute(route);
        setRouteForm({
            name: route.name,
            route_number: route.route_number || "",
            driver_name: route.driver_name || "",
            driver_phone: route.driver_phone || "",
            plate_number: route.plate_number || "",
            capacity: route.capacity?.toString() || "40",
            status: route.status || "active"
        });
        setIsEditRouteOpen(true);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header: Skewed Command Center */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-x-4">
                    <div className="h-12 w-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                        <Bus className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground leading-none">
                            Transport Management
                        </h2>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-2 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 
                            Route Control & Fleet Logistics
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-x-3">
                        <StudentAssignmentDialog routes={routes} stops={stops} />
                        
                        <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-6 rounded-md bg-primary text-primary-foreground font-semibold text-xs tracking-wide shadow-sm hover:opacity-90 transition-all group">
                                    <Plus className="h-4 w-4 mr-2" /> Add Route
                                </Button>
                            </DialogTrigger>
                              <DialogContent className="max-w-2xl p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                                <div className="bg-card p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <DialogTitle className="font-bold text-2xl tracking-tight text-foreground">
                                                Add New Route
                                            </DialogTitle>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Configure a new transport service path</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsAddRouteOpen(false)} className="text-muted-foreground hover:text-foreground">
                                            <Plus className="h-5 w-5 rotate-45" />
                                        </Button>
                                    </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Route Name</Label>
                                                    <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="e.g. North Route" className="h-11 rounded-md border-border bg-muted/20 focus:border-primary transition-all placeholder:text-muted-foreground/30" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Route Number</Label>
                                                    <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} placeholder="e.g. R-101" className="h-11 rounded-md border-border bg-muted/20 focus:border-primary transition-all placeholder:text-muted-foreground/30" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Driver Name</Label>
                                                    <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} placeholder="Driver's Full Name" className="h-11 rounded-md border-border bg-muted/20 focus:border-primary transition-all placeholder:text-muted-foreground/30" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Driver Phone</Label>
                                                    <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} placeholder="+1234567890" className="h-11 rounded-md border-border bg-muted/20 focus:border-primary transition-all placeholder:text-muted-foreground/30" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Bus Plate Number</Label>
                                                    <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} placeholder="Plate / VIN" className="h-11 rounded-md border-border bg-muted/20 focus:border-primary transition-all placeholder:text-muted-foreground/30" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Seating Capacity</Label>
                                                    <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} className="h-11 rounded-md border-border bg-muted/20 focus:border-primary transition-all tabular-nums" />
                                                </div>
                                            </div>

                                            <Button onClick={handleCreateRoute} disabled={loading} className="w-full h-12 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-wider transition-all text-xs mt-4">
                                                {loading ? "Creating..." : "Create Route"}
                                            </Button>
                                        </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* --- Analytics Layer: Fleet Intelligence --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-2">
                <div className="md:col-span-8 bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold italic tracking-tight uppercase leading-none text-foreground group-hover:text-primary transition-colors">
                                    Fleet <span className="text-primary italic">Occupancy</span> Matrix
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-foreground/30 mt-3 italic">
                                    Real-time utilization percentile per route node
                                </p>
                            </div>
                            <Activity className="h-5 w-5 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fleetOccupancyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888860", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888840", fontSize: 10 }} unit="%" />
                                    <Tooltip 
                                        cursor={{ fill: "#ffffff05" }} 
                                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-xl font-bold tracking-tight uppercase leading-none text-foreground italic group-hover:text-primary transition-all">
                            Service <span className="text-primary tracking-normal not-italic px-1">/</span> Status
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-foreground/30 mt-3 italic text-center">Fleet operational health vector</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={routeStatusData}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {routeStatusData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- Control Layer: Logistics Matrix --- */}
            <div className="bg-muted p-3 rounded-xl border border-border flex flex-col md:flex-row items-center gap-4 reveal-3 shadow-md">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="SEARCH FLEET REGISTRY, PLATES, OR DRIVERS..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-14 pl-14 bg-background border-border rounded-lg font-mono font-black text-[10px] uppercase tracking-[0.2em] focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-[220px] h-14 bg-background border-border rounded-lg font-mono font-black text-[10px] uppercase tracking-[0.2em] shadow-inner hover:border-primary transition-all focus:ring-primary">
                            <div className="flex items-center gap-4">
                                <ListFilter className="h-4 w-4 text-primary opacity-40" />
                                <SelectValue placeholder="ROUTE STATUS" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-primary/10 rounded-lg">
                            <SelectItem value="all" className="font-black uppercase text-[10px] tracking-widest p-4">SYSTEM_ALL_STATUS</SelectItem>
                            <SelectItem value="active" className="font-black uppercase text-[10px] tracking-widest p-4">ACTIVE_NODES</SelectItem>
                            <SelectItem value="inactive" className="font-black uppercase text-[10px] tracking-widest p-4">OFFLINE_NODES</SelectItem>
                            <SelectItem value="maintenance" className="font-black uppercase text-[10px] tracking-widest p-4">MAINTENANCE_NODES</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 reveal-4">
                <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <Bus className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Routes</p>
                        <Navigation className="h-4 w-4 text-primary opacity-40 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none italic">{routes.length}</h3>
                </div>

                <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <Users className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fleet Capacity</p>
                        <Zap className="h-4 w-4 text-blue-500 opacity-40" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none italic">{routes.reduce((acc, r) => acc + (r.capacity || 0), 0)}</h3>
                </div>

                <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <MapPin className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Service Stops</p>
                        <MapPin className="h-4 w-4 text-amber-500 opacity-40" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none italic">{stops.length}</h3>
                </div>

                <div className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative">
                     <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <ShieldCheck className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Boarding Students</p>
                        <ShieldCheck className="h-4 w-4 text-red-500 opacity-40" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none italic">{assignments.length}</h3>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-12 items-start">
                {/* Fleet Registry: The Telemetric List */}
                <div className="lg:col-span-4 h-full space-y-6">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                            Fleet Overview
                        </h3>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-2">
                            <Wifi className="h-3 w-3 text-primary" /> Active Routes Registry
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm relative min-h-[600px]">
                        <div className="p-2 space-y-1.5 overflow-y-auto max-h-[700px] scrollbar-thin">
                            {routes.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider italic border border-dashed border-border mx-4 rounded-lg">
                                    [No active routes]
                                </div>
                            ) : (
                                routes.filter(r => {
                                    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                          r.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                          r.driver_name?.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
                                    return matchesSearch && matchesStatus;
                                }).map((route, idx) => (
                                    <div
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={cn(
                                            "group relative p-6 transition-all duration-500 cursor-pointer border rounded-md mb-2 reveal-item",
                                            selectedRoute?.id === route.id
                                                ? "bg-primary border-primary shadow-xl shadow-primary/20 translate-x-3 skew-x-[-2deg]"
                                                : "bg-background/40 border-border hover:bg-muted/50 hover:border-primary/30"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300 shadow-inner",
                                                    selectedRoute?.id === route.id
                                                        ? "bg-white/20 text-white"
                                                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                                )}>
                                                    <Bus className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className={cn(
                                                        "text-sm font-black uppercase tracking-tight transition-colors leading-none mb-1.5 italic",
                                                        selectedRoute?.id === route.id ? "text-white" : "text-foreground group-hover:text-primary"
                                                    )}>
                                                        {route.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[9px] font-mono font-black uppercase tracking-[0.2em]",
                                                            selectedRoute?.id === route.id ? "text-white/60" : "text-muted-foreground"
                                                        )}>{route.route_number || "NO_NUMBER"}</span>
                                                        <div className={cn(
                                                            "h-1 w-1 rounded-full",
                                                            route.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                                                        )} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className={cn("text-[10px] font-mono font-black", selectedRoute?.id === route.id ? "text-white/20" : "text-foreground/5")}>#{idx + 1}</div>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "mt-5 flex items-center justify-between text-[9px] font-mono font-black uppercase tracking-[0.2em] border-t pt-4",
                                            selectedRoute?.id === route.id ? "border-white/10 text-white/80" : "border-border/50 text-muted-foreground/60"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className={cn("h-3 w-3", selectedRoute?.id === route.id ? "text-white" : "text-primary")} />
                                                <span>{route.plate_number || "Pending"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className={cn("h-3 w-3", selectedRoute?.id === route.id ? "text-white" : "text-primary")} />
                                                <span>{assignments.filter(a => a.route_id === route.id).length}/{route.capacity || 40}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Logistics Command View */}
                <div className="lg:col-span-8 flex flex-col h-full gap-6">
                    {selectedRoute ? (
                        <div className="space-y-6">
                            {/* Route Control Panel */}
                            <div className="bg-card border border-border rounded-lg p-8 shadow-sm relative overflow-hidden group">
                                <div className="grid md:grid-cols-2 gap-12">
                                    <StopManagement
                                        routeId={selectedRoute.id}
                                        routeName={selectedRoute.name}
                                        stops={stops.filter(s => s.route_id === selectedRoute.id)}
                                    />

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <Navigation className="h-3 w-3" /> Route Information
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Vehicle and capacity overview</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 bg-muted/30 border border-border rounded-lg group/m relative overflow-hidden">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-primary mb-2 opacity-60 tracking-wider">Vehicle Plate</p>
                                                    <p className="text-xl font-bold text-foreground tracking-tight uppercase leading-none">{selectedRoute.plate_number || "Pending"}</p>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-muted/30 border border-border rounded-lg group/m relative overflow-hidden">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-primary mb-2 opacity-60 tracking-wider">Occupancy</p>
                                                    <div className="space-y-3">
                                                        <p className="text-xl font-bold text-foreground tracking-tight uppercase leading-none">
                                                            {assignments.filter(a => a.route_id === selectedRoute.id).length}<span className="text-muted-foreground/30 mx-1">/</span>{selectedRoute.capacity || 40}
                                                        </p>
                                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-1000"
                                                                style={{ width: `${Math.min(100, (assignments.filter(a => a.route_id === selectedRoute.id).length / (selectedRoute.capacity || 40)) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                         <div className="space-y-6">
                                            <div className="relative group/contact p-6 bg-primary/5 border border-primary/10 rounded-lg transition-all duration-300">
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-sm">
                                                            <User className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Assigned Driver</p>
                                                            <h4 className="text-lg font-bold text-foreground uppercase tracking-tight">{selectedRoute.driver_name || "Unassigned"}</h4>
                                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{selectedRoute.driver_phone || "No contact info"}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="icon" variant="outline" className="h-10 w-10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground">
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={(e) => openEditRoute(selectedRoute, e)}
                                                    variant="outline"
                                                    className="flex-1 h-12 rounded-md font-bold uppercase tracking-wider text-[10px] hover:bg-muted transition-all"
                                                >
                                                    Edit Route
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteRoute(selectedRoute.id)}
                                                    variant="destructive"
                                                    className="h-12 px-6 rounded-md font-bold uppercase tracking-wider text-[10px] transition-all"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Manifest: Student List */}
                            <Card className="border-border bg-card rounded-lg shadow-sm relative overflow-hidden group">
                                <CardHeader className="bg-muted/30 border-b border-border p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                Passenger Manifest
                                            </CardTitle>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-1">Students assigned to this route</p>
                                        </div>
                                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {assignments.filter(a => a.route_id === selectedRoute.id).length === 0 ? (
                                            <div className="col-span-full text-center py-16 text-muted-foreground/40 font-semibold text-[10px] uppercase tracking-wider italic border border-dashed border-border rounded-lg">
                                                [No students assigned]
                                            </div>
                                        ) : (
                                            assignments.filter(a => a.route_id === selectedRoute.id).map((a) => (
                                                <div key={a.id} className="group/student relative p-4 bg-muted/20 border border-border rounded-lg hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center font-bold text-xs">
                                                            {a.student?.profile?.full_name?.[0] || "?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-foreground text-[11px] uppercase tracking-tight truncate group-hover/student:text-primary transition-colors">
                                                                {a.student?.profile?.full_name}
                                                            </p>
                                                            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide truncate mt-0.5">
                                                                {a.stop?.name || "No stop assigned"}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleUnassign(a.student_id)}
                                                            className="h-8 w-8 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover/student:opacity-100"
                                                        >
                                                            <UserMinus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 bg-card/50 rounded-lg border border-dashed border-border p-12 min-h-[500px]">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 bg-muted border border-border rounded-2xl flex items-center justify-center mb-8">
                                    <Bus className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Select a Route</h3>
                                <p className="text-[11px] font-semibold max-w-[320px] uppercase tracking-wider leading-relaxed text-muted-foreground/60">
                                    Please choose a transport route from the registry to manage fleet details and assignments.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Protocol Dialog */}
            <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
                <DialogContent className="max-w-lg p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-primary/5 p-8 border-b border-border">
                        <DialogHeader>
                            <DialogTitle className="font-bold text-2xl tracking-tight text-foreground text-center">Edit Route</DialogTitle>
                            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mt-1 text-center flex items-center justify-center gap-2">
                                <Wifi className="h-3 w-3" /> Update route configuration
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-5 bg-card">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Route Name</Label>
                                <Input 
                                    value={routeForm.name} 
                                    onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Route Number</Label>
                                <Input 
                                    value={routeForm.route_number} 
                                    onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Driver Name</Label>
                                <Input 
                                    value={routeForm.driver_name} 
                                    onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Driver Phone</Label>
                                <Input 
                                    value={routeForm.driver_phone} 
                                    onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Plate Number</Label>
                                <Input 
                                    value={routeForm.plate_number} 
                                    onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Capacity</Label>
                                <Input 
                                    type="number" 
                                    value={routeForm.capacity} 
                                    onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Route Status</Label>
                            <Select value={routeForm.status} onValueChange={(v) => setRouteForm({ ...routeForm, status: v })}>
                                <SelectTrigger className="rounded-md h-10 border-border bg-muted/20 font-bold uppercase tracking-wider text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active" className="font-bold text-primary">Active</SelectItem>
                                    <SelectItem value="inactive" className="font-bold text-destructive">Inactive</SelectItem>
                                    <SelectItem value="maintenance" className="font-bold text-amber-500">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button 
                            onClick={handleUpdateRoute} 
                            disabled={loading} 
                            className="w-full rounded-md h-12 bg-primary text-primary-foreground font-bold uppercase tracking-wider transition-all text-xs mt-4"
                        >
                            {loading ? "Updating..." : "Update Route"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

