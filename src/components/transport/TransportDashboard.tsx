"use client";

import { useState } from "react";
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
import { StopManagement } from "./StopManagement";
import { StudentAssignmentDialog } from "./StudentAssignmentDialog";

interface TransportDashboardProps {
    routes: any[];
    stops: any[];
    assignments: any[];
    userRole?: string | null;
}

export function TransportDashboard({ routes, stops, assignments, userRole }: TransportDashboardProps) {
    const isAdmin = userRole === "admin";
    const router = useRouter();
    const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
    const [isEditRouteOpen, setIsEditRouteOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [editingRoute, setEditingRoute] = useState<any>(null);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
                <div className="flex items-center gap-x-8">
                    <div className="h-20 w-20 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(16,185,129,0.15)] skew-x-[-12deg] group hover:bg-primary hover:text-primary-foreground transition-all duration-700">
                        <Bus className="h-10 w-10 skew-x-[12deg] transition-all duration-700" />
                    </div>
                    <div>
                        <div className="relative">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                School <span className="text-primary italic">Transport</span>
                            </h2>
                            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-primary/40 skew-x-[-24deg]" />
                        </div>
                        <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
                            School Bus Management & Route Control
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-x-4 skew-x-[-12deg]">
                        <StudentAssignmentDialog routes={routes} stops={stops} />
                        
                        <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-16 px-10 rounded-none bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] emerald-glow shadow-2xl hover:scale-105 transition-all group">
                                    <span className="not-skew-x flex items-center gap-3">
                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> ADD_ROUTE
                                    </span>
                                </Button>
                            </DialogTrigger>
                             <DialogContent className="p-0 border-none bg-transparent skew-x-[-12deg] max-w-2xl overflow-visible">
                                <div className="relative glass-panel border-primary/20 p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                                    
                                    <div className="not-skew-x relative z-10">
                                        <div className="not-skew-x flex justify-between items-start mb-10">
                                            <div>
                                                <DialogTitle className="font-black italic text-4xl uppercase tracking-tighter text-foreground leading-none">
                                                    Add New <span className="text-primary italic">Route</span>
                                                </DialogTitle>
                                                <div className="h-1 w-20 bg-primary/40 mt-4 skew-x-[-24deg]" />
                                                <p className="text-[10px] font-mono font-black text-primary/60 uppercase tracking-[0.4em] mt-6 italic">Add a new transport route to the system</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setIsAddRouteOpen(false)} className="text-primary/40 hover:text-primary hover:bg-primary/10 -mt-4 -mr-4 rounded-none">
                                                <Plus className="h-6 w-6 rotate-45" />
                                            </Button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">Route Name</Label>
                                                    <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="E.G. ROUTE-A" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">Route Number</Label>
                                                    <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} placeholder="E.G. 001" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">Driver Name</Label>
                                                    <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} placeholder="DRIVER NAME" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">Driver Phone</Label>
                                                    <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} placeholder="+X-XXX-XX" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">Bus Plate Number</Label>
                                                    <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} placeholder="BUS NUMBER" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">Seating Capacity</Label>
                                                    <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black tabular-nums transition-all" />
                                                </div>
                                            </div>

                                            <Button onClick={handleCreateRoute} disabled={loading} className="w-full h-18 rounded-none bg-primary text-primary-foreground font-black italic uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs border border-primary/20 gap-3 mt-4 text-center">
                                                {loading ? "SAVING..." : "CREATE ROUTE"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Route Label */}
                                    <div className="absolute -left-12 -bottom-10 opacity-[0.03] font-mono text-[100px] font-black italic text-primary pointer-events-none uppercase">TRANSIT</div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Transport Stats Grid */}
            <div className="grid gap-8 md:grid-cols-4 reveal-2 relative z-10">
                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-primary/10 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-primary/10 group-hover:border-primary/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-primary/60 mb-2 italic">Active Routes</p>
                                <h3 className="text-4xl font-black text-foreground italic leading-none">{routes.length}</h3>
                            </div>
                            <Navigation className="h-8 w-8 text-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-primary group-hover:opacity-10 transition-all duration-700">ROUTE</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-blue-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-blue-500/10 group-hover:border-blue-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Total Seats</p>
                                <h3 className="text-4xl font-black text-blue-500 italic leading-none">{routes.reduce((acc, r) => acc + (r.capacity || 0), 0)}</h3>
                            </div>
                            <UserMinus className="h-8 w-8 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-blue-500/40 group-hover:opacity-10 transition-all duration-700">LOAD</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-amber-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-amber-500/10 group-hover:border-amber-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Stops</p>
                                <h3 className="text-4xl font-black text-amber-500 italic leading-none">{stops.length}</h3>
                            </div>
                            <MapPin className="h-8 w-8 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-amber-500/40 group-hover:opacity-10 transition-all duration-700">NODES</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-red-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-red-500/10 group-hover:border-red-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Assigned Students</p>
                                <h3 className="text-4xl font-black text-red-500 italic leading-none">{assignments.length}</h3>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-red-500/40 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-red-500/40 group-hover:opacity-10 transition-all duration-700">PERMIT</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-12 items-start">
                {/* Fleet Registry: The Telemetric List */}
                <div className="lg:col-span-4 h-full space-y-8 animate-in slide-in-from-left-10 duration-700">
                    <div className="relative group">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary emerald-glow skew-x-[-12deg]" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground px-4">
                            Fleet <span className="text-primary tracking-widest">REGISTRY</span>
                        </h3>
                        <p className="text-[9px] font-mono text-foreground/40 uppercase tracking-[0.4em] px-4 mt-1 flex items-center gap-2">
                            <Wifi className="h-3 w-3 animate-pulse text-primary" /> Active Telemetry Scan
                        </p>
                    </div>

                    <div className="glass-panel border-primary/10 overflow-hidden shadow-2xl relative min-h-[600px]">
                        <div className="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
                        <div className="p-2 space-y-2 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-primary/20">
                            {routes.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground font-mono text-[10px] uppercase tracking-widest italic border border-dashed border-primary/10 mx-4">
                                    [NO ROUTES FOUND]
                                </div>
                            ) : (
                                routes.map((route, idx) => (
                                    <div
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={cn(
                                            "group relative p-6 transition-all duration-500 cursor-pointer overflow-hidden skew-x-[-12deg] mb-2 border",
                                            selectedRoute?.id === route.id
                                                ? "bg-primary/20 border-primary shadow-[inset_0_0_30px_rgba(16,185,129,0.1)]"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-primary/30"
                                        )}
                                    >
                                        <div className="not-skew-x relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 flex items-center justify-center transition-all duration-500",
                                                        selectedRoute?.id === route.id
                                                            ? "bg-primary text-primary-foreground emerald-glow shadow-primary/50"
                                                            : "bg-white/5 text-primary/40 group-hover:bg-primary/20 group-hover:text-primary"
                                                    )}>
                                                        <Bus className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                                            {route.name}
                                                        </h4>
                                                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">{route.route_number || "CH_SCANNING"}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className="text-[12px] font-black italic text-foreground opacity-20 group-hover:opacity-100 transition-opacity">0{idx + 1}</div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between text-[8px] font-mono font-black uppercase tracking-[0.2em] border-t border-white/5 pt-4 opacity-60">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="h-3 w-3 text-primary/50" />
                                                    <span>{route.plate_number || "PENDING"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3 w-3 text-primary/50" />
                                                    <span>{route.capacity || 40} SEATS</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Glow */}
                                        <div className={cn(
                                            "absolute top-0 right-0 w-1 h-full transition-all duration-500",
                                            selectedRoute?.id === route.id ? "bg-primary animate-pulse shadow-[0_0_15px_rgba(16,185,129,1)]" : "bg-transparent"
                                        )} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Logistics Command View */}
                <div className="lg:col-span-8 flex flex-col h-full gap-8">
                    {selectedRoute ? (
                        <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
                            {/* Route Control Panel */}
                            <div className="glass-panel border-primary/20 p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors duration-700 group-hover:bg-primary/10" />
                                
                                <div className="grid md:grid-cols-2 gap-16">
                                    <StopManagement
                                        routeId={selectedRoute.id}
                                        routeName={selectedRoute.name}
                                        stops={stops.filter(s => s.route_id === selectedRoute.id)}
                                    />

                                    <div className="space-y-10">
                                        <div className="relative">
                                            <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic mb-2 flex items-center gap-2">
                                                <Navigation className="h-3 w-3 animate-pulse" /> ROUTE DETAILS
                                            </h3>
                                            <p className="text-[9px] text-foreground/30 font-mono font-black uppercase tracking-[0.2em] italic">Route and stop information</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="p-8 bg-white/[0.03] border-l-2 border-primary/20 hover:border-primary transition-all duration-500 skew-x-[-8deg] group/m relative overflow-hidden">
                                                <div className="not-skew-x">
                                                    <p className="text-[9px] font-mono font-black uppercase text-primary mb-3 opacity-60 italic tracking-widest">VEHICLE PLATE</p>
                                                    <p className="text-2xl font-black text-foreground italic tracking-tighter uppercase leading-none">{selectedRoute.plate_number || "PENDING"}</p>
                                                </div>
                                                <div className="absolute -right-2 -bottom-2 opacity-[0.03] font-mono text-3xl font-black italic">VEHICLE</div>
                                            </div>
                                            <div className="p-8 bg-white/[0.03] border-l-2 border-primary/20 hover:border-primary transition-all duration-500 skew-x-[-8deg] group/m relative overflow-hidden">
                                                <div className="not-skew-x">
                                                    <p className="text-[9px] font-mono font-black uppercase text-primary mb-3 opacity-60 italic tracking-widest">USAGE</p>
                                                    <div className="space-y-4">
                                                        <p className="text-2xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                                                            {assignments.filter(a => a.route_id === selectedRoute.id).length}<span className="text-primary/30 mx-1">/</span>{selectedRoute.capacity || 40}
                                                        </p>
                                                        <div className="h-1 w-full bg-white/5 overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary emerald-glow shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000"
                                                                style={{ width: `${(assignments.filter(a => a.route_id === selectedRoute.id).length / (selectedRoute.capacity || 40)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute -right-2 -bottom-2 opacity-[0.03] font-mono text-3xl font-black italic">CPCTY</div>
                                            </div>
                                        </div>

                                         <div className="space-y-10 flex flex-col justify-between h-full">
                                            <div className="relative group/contact p-10 bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/30 transition-all duration-700 overflow-hidden skew-x-[-4deg]">
                                                <div className="absolute top-0 right-0 w-48 h-full bg-primary/5 -skew-x-[20deg] translate-x-20 group-hover/contact:translate-x-0 transition-transform duration-700" />
                                                <div className="relative z-10 flex items-center justify-between skew-x-[4deg]">
                                                    <div className="flex items-center gap-8">
                                                        <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center emerald-glow shadow-primary/50 skew-x-[-12deg]">
                                                            <User className="h-8 w-8 skew-x-[12deg]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-mono font-black text-primary uppercase tracking-[0.4em] mb-1 italic">ASSIGNED DRIVER</p>
                                                            <h4 className="text-xl font-black text-foreground uppercase italic tracking-tighter">{selectedRoute.driver_name || "UNASSIGNED"}</h4>
                                                            <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mt-1">{selectedRoute.driver_phone || "NO PHONE PROVIDED"}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="icon" className="rounded-none bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <Button
                                                    onClick={(e) => openEditRoute(selectedRoute, e)}
                                                    className="flex-1 h-16 rounded-none bg-white/5 border border-white/10 text-foreground font-black uppercase tracking-[0.2em] italic text-[10px] hover:bg-white/10 hover:border-primary/40 transition-all"
                                                >
                                                    EDIT ROUTE
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteRoute(selectedRoute.id)}
                                                    variant="destructive"
                                                    className="h-16 px-8 rounded-none bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] italic text-[10px] hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    DELETE ROUTE
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Manifest: Student List */}
                            <Card className="border-primary/10 bg-black/20 backdrop-blur-2xl rounded-none shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />
                                <CardHeader className="bg-primary/5 border-b border-white/5 p-6 space-y-1">
                                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic flex items-center gap-2">
                                        <Wifi className="h-3 w-3 animate-pulse" /> Student List
                                    </CardTitle>
                                    <p className="text-[9px] font-mono text-foreground/40 uppercase tracking-[0.2em] italic">Assigned student list for this route</p>
                                </CardHeader>
                                <CardContent className="p-10">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {assignments.filter(a => a.route_id === selectedRoute.id).length === 0 ? (
                                            <div className="col-span-full text-center py-24 text-muted-foreground/30 font-mono text-[10px] uppercase tracking-widest italic border border-dashed border-primary/10">
                                                [NO STUDENTS ASSIGNED]
                                            </div>
                                        ) : (
                                            assignments.filter(a => a.route_id === selectedRoute.id).map((a) => (
                                                <div key={a.id} className="group/student relative p-5 bg-white/[0.03] border border-white/[0.05] hover:border-primary/30 hover:bg-primary/[0.05] transition-all duration-500 overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-2 h-0 group-hover/student:h-full bg-primary/20 transition-all duration-500" />
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-11 w-11 bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-black text-sm italic emerald-glow-sm transition-transform duration-500 group-hover/student:scale-110">
                                                            {a.student?.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-foreground text-[11px] uppercase tracking-tighter truncate italic group-hover/student:text-primary transition-colors">
                                                                {a.student?.profile?.first_name} {a.student?.profile?.last_name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="h-0.5 w-0.5 rounded-full bg-primary/50" />
                                                                <p className="text-[9px] text-foreground/40 font-mono font-bold uppercase tracking-widest truncate italic">
                                                                    {a.stop?.name || "STOP NOT ASSIGNED"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleUnassign(a.student_id)}
                                                            className="h-8 w-8 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/student:opacity-100 -mr-2"
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
                        <div className="flex-1 flex flex-col items-center justify-center text-foreground/30 bg-[#050505]/40 backdrop-blur-3xl rounded-none border border-dashed border-primary/20 p-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] min-h-[500px] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-scanline opacity-[0.03]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full group-hover:bg-primary/10 transition-colors duration-1000" />
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="h-32 w-32 bg-primary/5 border border-primary/10 flex items-center justify-center mb-10 skew-x-[-12deg] group-hover:border-primary/30 transition-all duration-700 shadow-2xl">
                                    <Bus className="h-14 w-14 text-primary/20 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-700 skew-x-[12deg]" />
                                </div>
                                <h3 className="text-4xl font-black text-foreground mb-4 italic uppercase tracking-tighter opacity-80">Route <span className="text-primary/40 group-hover:text-primary transition-colors duration-700">Selection Required</span></h3>
                                <div className="h-px w-24 bg-primary/20 mb-6" />
                                <p className="text-[11px] font-mono font-bold max-w-[400px] uppercase tracking-[0.3em] leading-loose text-foreground/40 italic">
                                    [SYSTEM_WAITING] Please select a transport route from the registry to view its details and management console.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Protocol Dialog */}
            <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
                <DialogContent className="p-0 border-none bg-[#050505]/95 backdrop-blur-3xl max-w-lg overflow-hidden ring-1 ring-primary/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <div className="bg-primary/10 border-b border-primary/20 p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="font-black text-3xl italic uppercase tracking-tighter text-primary italic text-center">Edit Route</DialogTitle>
                            <p className="text-primary/70 text-[10px] font-mono font-bold uppercase tracking-[0.3em] mt-2 italic text-center italic flex items-center justify-center gap-2">
                                <Wifi className="h-3 w-3 animate-pulse" /> Updating route information
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="p-10 space-y-6 bg-black/40">
                        <div className="grid grid-cols-2 gap-6 pb-2">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Route Name</Label>
                                <Input 
                                    value={routeForm.name} 
                                    onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Route Number</Label>
                                <Input 
                                    value={routeForm.route_number} 
                                    onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Driver Name</Label>
                                <Input 
                                    value={routeForm.driver_name} 
                                    onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Driver Phone</Label>
                                <Input 
                                    value={routeForm.driver_phone} 
                                    onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Plate Number</Label>
                                <Input 
                                    value={routeForm.plate_number} 
                                    onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Capacity</Label>
                                <Input 
                                    type="number" 
                                    value={routeForm.capacity} 
                                    onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1">Route Status</Label>
                            <Select value={routeForm.status} onValueChange={(v) => setRouteForm({ ...routeForm, status: v })}>
                                <SelectTrigger className="rounded-none h-12 border-primary/20 bg-primary/5 font-black italic uppercase tracking-tighter text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 text-foreground border-primary/20 rounded-none backdrop-blur-xl">
                                    <SelectItem value="active" className="font-black italic uppercase text-primary tracking-tighter cursor-pointer">Active</SelectItem>
                                    <SelectItem value="inactive" className="font-black italic uppercase text-red-500 tracking-tighter cursor-pointer">Inactive</SelectItem>
                                    <SelectItem value="maintenance" className="font-black italic uppercase text-amber-500 tracking-tighter cursor-pointer">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button 
                            onClick={handleUpdateRoute} 
                            disabled={loading} 
                            className="w-full rounded-none h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] italic shadow-xl emerald-glow text-xs mt-4 relative overflow-hidden group"
                        >
                            <span className="relative z-10">{loading ? "SAVING..." : "UPDATE ROUTE"}</span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

