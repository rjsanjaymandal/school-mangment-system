"use client";

import { useState } from "react";
import { Bus, MapPin, Plus, Navigation, ShieldCheck, Wifi, Edit2, Trash2, ArrowRight, UserMinus, Phone } from "lucide-react";
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
}

export function TransportDashboard({ routes, stops, assignments }: TransportDashboardProps) {
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Fleet Logistics</h2>
                    <p className="text-foreground/70 font-bold tracking-tight">Autonomous routing and student transit monitoring</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="rounded-sm px-4 py-1.5 border-primary/20 text-primary bg-primary/10 gap-x-2 font-black uppercase text-[10px] emerald-glow-sm">
                        <Wifi className="h-3 w-3 animate-pulse" /> {routes.length} Active Routes
                    </Badge>

                    <StudentAssignmentDialog routes={routes} stops={stops} />

                    <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow uppercase tracking-widest text-[10px] min-w-[140px]">
                                <Plus className="h-4 w-4" /> Add Route
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-lg overflow-hidden ring-1 ring-primary/20">
                            <div className="bg-primary p-8 text-primary-foreground">
                                <DialogHeader>
                                    <DialogTitle className="font-black text-2xl uppercase tracking-tighter">Initialize Logistics Channel</DialogTitle>
                                    <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Fleet Expansion & Routing</p>
                                </DialogHeader>
                            </div>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Route Name</Label>
                                        <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="East Wing Express" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Route Number</Label>
                                        <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} placeholder="E-01" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Driver Name</Label>
                                        <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Driver Phone</Label>
                                        <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} placeholder="+91..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Vehicle Plate</Label>
                                        <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} placeholder="MH-12-AB-1234" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Total Capacity</Label>
                                        <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleCreateRoute} disabled={loading} className="w-full rounded-sm py-6 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl emerald-glow text-xs">
                                    {loading ? "Creating..." : "Generate Route"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Fleet List */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border mb-4 bg-primary/5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-x-2">
                                <Bus className="h-4 w-4" />
                                Fleet Monitor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-primary/20">
                            {routes.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground font-medium text-sm">No routes configured.</div>
                            ) : (
                                routes.map((route) => (
                                    <div
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={cn(
                                            "p-5 rounded-sm border transition-all cursor-pointer group relative overflow-hidden",
                                            selectedRoute?.id === route.id
                                                ? "bg-primary text-primary-foreground border-primary shadow-2xl scale-[1.02] emerald-glow"
                                                : "bg-background/20 backdrop-blur-md border-border hover:border-primary/50 hover:bg-primary/5"
                                        )}
                                    >
                                        {selectedRoute?.id === route.id && (
                                            <div className="absolute top-0 right-0 p-1 bg-white/20 rounded-bl-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-x-3">
                                                <div className={cn(
                                                    "p-2.5 rounded-sm shadow-inner transition-colors",
                                                    selectedRoute?.id === route.id
                                                        ? "bg-white/20"
                                                        : "bg-primary text-primary-foreground emerald-glow-sm"
                                                )}>
                                                    <Bus className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold truncate max-w-[120px]">{route.name}</p>
                                                    <p className={cn(
                                                        "text-[10px] font-mono",
                                                        selectedRoute?.id === route.id ? "text-primary-foreground/70" : "text-muted-foreground"
                                                    )}>{route.route_number || "CHL-00"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => openEditRoute(route, e)}
                                                    className={cn("h-7 w-7", selectedRoute?.id === route.id ? "text-primary-foreground/70 hover:text-white" : "text-muted-foreground hover:text-foreground")}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}
                                                    className={cn("h-7 w-7", selectedRoute?.id === route.id ? "text-primary-foreground/70 hover:text-red-400" : "text-muted-foreground hover:text-red-500")}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex items-center justify-between pt-3 border-t text-[9px] font-black uppercase tracking-widest",
                                            selectedRoute?.id === route.id ? "border-white/20 opacity-90" : "border-border opacity-50"
                                        )}>
                                            <div className="flex items-center gap-x-1">
                                                <Navigation className="h-3 w-3" />
                                                {route.driver_name?.split(" ")[0] || "No Pilot"}
                                            </div>
                                            <div className="flex items-center gap-x-1">
                                                <ShieldCheck className="h-3 w-3" />
                                                {route.plate_number?.slice(-4) || "LIVE"}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Route Details / Stops */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedRoute ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm shadow-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <StopManagement
                                            routeId={selectedRoute.id}
                                            routeName={selectedRoute.name}
                                            stops={stops.filter(s => s.route_id === selectedRoute.id)}
                                        />

                                        <div className="space-y-6 bg-background/20 p-6 rounded-sm border border-border">
                                            <div>
                                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Route Overview</h3>
                                                <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Technical specifications and capacity</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-sm bg-primary/5 border border-border">
                                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Asset ID</p>
                                                    <p className="text-sm font-black text-foreground">{selectedRoute.plate_number || "TBD-999"}</p>
                                                </div>
                                                <div className="p-4 rounded-sm bg-primary/5 border border-border">
                                                    <p className="text-[10px] font-black uppercase text-primary mb-1">Channel Load</p>
                                                    <div className="flex items-end justify-between">
                                                        <p className="text-sm font-black text-foreground">
                                                            {assignments.filter(a => a.route_id === selectedRoute.id).length} / {selectedRoute.capacity || 40}
                                                        </p>
                                                        <div className="w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary emerald-glow shadow-primary/50"
                                                                style={{ width: `${Math.min(100, (assignments.filter(a => a.route_id === selectedRoute.id).length / (selectedRoute.capacity || 40)) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-sm bg-primary text-primary-foreground border border-primary/20 flex items-center justify-between shadow-xl emerald-glow">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="h-10 w-10 rounded-sm bg-white/20 flex items-center justify-center">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/90">{selectedRoute.driver_name || "Emergency Contact"}</p>
                                                        <p className="text-sm font-black tracking-tight">{selectedRoute.driver_phone || "Not available"}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 font-black text-[9px] uppercase border border-white/20 rounded-xs">Call Now</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm shadow-2xl overflow-hidden">
                                <CardHeader className="bg-primary/5 border-b border-border p-4">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Assigned Students</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {assignments.filter(a => a.route_id === selectedRoute.id).length === 0 ? (
                                            <div className="col-span-full text-center py-12 text-muted-foreground font-medium text-sm">No students assigned to this route.</div>
                                        ) : (
                                            assignments.filter(a => a.route_id === selectedRoute.id).map((a) => (
                                                <div key={a.id} className="flex items-center justify-between p-4 rounded-sm bg-background/20 border border-border group hover:border-primary/50 transition-all">
                                                    <div className="flex items-center gap-x-4 overflow-hidden">
                                                        <div className="h-9 w-9 rounded-sm bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shrink-0 emerald-glow-sm">
                                                            {a.student?.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-black text-foreground text-[10px] uppercase tracking-tight truncate">{a.student?.profile?.first_name} {a.student?.profile?.last_name}</p>
                                                            <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest truncate">{a.stop?.name || "No Stop Selected"}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleUnassign(a.student_id)}
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                                    >
                                                        <UserMinus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-foreground/30 bg-card/40 backdrop-blur-xl rounded-sm border-2 border-dashed border-border p-16 shadow-inner">
                            <div className="h-24 w-24 rounded-sm bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                                <Bus className="h-12 w-12 text-primary/20" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter">Fleet Selection Required</h3>
                            <p className="text-[10px] font-bold text-center max-w-[300px] uppercase tracking-[0.2em] leading-relaxed">Select a route from the fleet monitor to manage its stops and view assigned students</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Route Dialog */}
            <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border sm:max-w-lg rounded-sm shadow-2xl">
                    <DialogHeader><DialogTitle className="font-black text-2xl text-foreground uppercase tracking-tight text-center">Edit Route Configuration</DialogTitle></DialogHeader>
                    <div className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Route Name</Label>
                                <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Route Number</Label>
                                <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Driver Name</Label>
                                <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Driver Phone</Label>
                                <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Vehicle Plate</Label>
                                <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Total Capacity</Label>
                                <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Route Status</Label>
                            <Select value={routeForm.status} onValueChange={(v) => setRouteForm({ ...routeForm, status: v })}>
                                <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground border-border rounded-sm">
                                    <SelectItem value="active" className="font-bold">Active</SelectItem>
                                    <SelectItem value="inactive" className="font-bold text-red-500">Inactive</SelectItem>
                                    <SelectItem value="maintenance" className="font-bold text-amber-500">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleUpdateRoute} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl emerald-glow text-xs">
                            {loading ? "Saving..." : "Update Fleet Configuration"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

