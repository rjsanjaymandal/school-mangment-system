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
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Logistics & Fleet</h2>
                    <p className="text-slate-500 font-medium">Manage school transport, routes, and student assignments</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 border-green-200 text-green-600 bg-green-50 gap-x-2 font-bold uppercase text-[10px]">
                        <Wifi className="h-3 w-3 animate-pulse" /> {routes.length} Active Routes
                    </Badge>

                    <StudentAssignmentDialog routes={routes} stops={stops} />

                    <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
                                <Plus className="h-4 w-4" /> Add Route
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none sm:max-w-lg">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Create New Route</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Route Name</Label>
                                        <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="East Wing Express" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Route Number</Label>
                                        <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} placeholder="E-01" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Driver Name</Label>
                                        <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Driver Phone</Label>
                                        <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} placeholder="+91..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Vehicle Plate</Label>
                                        <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} placeholder="MH-12-AB-1234" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Total Capacity</Label>
                                        <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleCreateRoute} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
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
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-x-2">
                                <Bus className="h-5 w-5 text-indigo-500" />
                                Fleet Monitor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-3">
                            {routes.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 font-medium text-sm">No routes configured.</div>
                            ) : (
                                routes.map((route) => (
                                    <div
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all cursor-pointer group relative",
                                            selectedRoute?.id === route.id
                                                ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]"
                                                : "bg-white/50 border-slate-100 hover:border-slate-300 hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-x-3">
                                                <div className={cn(
                                                    "p-2 rounded-xl shadow-lg",
                                                    selectedRoute?.id === route.id
                                                        ? "bg-white/10"
                                                        : "bg-slate-900 text-white neon-blue"
                                                )}>
                                                    <Bus className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold truncate max-w-[120px]">{route.name}</p>
                                                    <p className={cn(
                                                        "text-[10px] font-mono",
                                                        selectedRoute?.id === route.id ? "text-slate-300" : "text-slate-400"
                                                    )}>{route.route_number || "NO CODE"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => openEditRoute(route, e)}
                                                    className={cn("h-7 w-7", selectedRoute?.id === route.id ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-slate-900")}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}
                                                    className={cn("h-7 w-7", selectedRoute?.id === route.id ? "text-slate-300 hover:text-red-400" : "text-slate-400 hover:text-red-500")}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[9px] font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-x-1 opacity-70">
                                                <Navigation className="h-3 w-3" />
                                                {route.driver_name?.split(" ")[0] || "No Pilot"}
                                            </div>
                                            <div className="flex items-center gap-x-1 opacity-70">
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
                            <Card className="border-none glass futuristic-card">
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <StopManagement
                                            routeId={selectedRoute.id}
                                            routeName={selectedRoute.name}
                                            stops={stops.filter(s => s.route_id === selectedRoute.id)}
                                        />

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">Route Overview</h3>
                                                <p className="text-xs text-slate-500 font-medium">Technical specifications and capacity</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Vehicle</p>
                                                    <p className="text-sm font-bold text-slate-900">{selectedRoute.plate_number || "Unknown"}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Occupancy</p>
                                                    <div className="flex items-end justify-between">
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {assignments.filter(a => a.route_id === selectedRoute.id).length} / {selectedRoute.capacity || 40}
                                                        </p>
                                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500"
                                                                style={{ width: `${Math.min(100, (assignments.filter(a => a.route_id === selectedRoute.id).length / (selectedRoute.capacity || 40)) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-indigo-900">{selectedRoute.driver_name || "Emergency Contact"}</p>
                                                        <p className="text-[10px] text-indigo-600">{selectedRoute.driver_phone || "Not available"}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-indigo-600 font-bold text-[10px] uppercase">Call Now</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none glass futuristic-card">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Assigned Students</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {assignments.filter(a => a.route_id === selectedRoute.id).length === 0 ? (
                                            <div className="col-span-full text-center py-12 text-slate-400 font-medium text-sm">No students assigned to this route.</div>
                                        ) : (
                                            assignments.filter(a => a.route_id === selectedRoute.id).map((a) => (
                                                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100 group">
                                                    <div className="flex items-center gap-x-3 overflow-hidden">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                                            {a.student?.profile?.first_name?.[0] || "?"}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-bold text-slate-900 text-xs truncate">{a.student?.profile?.first_name} {a.student?.profile?.last_name}</p>
                                                            <p className="text-[9px] text-slate-400 truncate">{a.stop?.name || "No Stop Selected"}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleUnassign(a.student_id)}
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
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
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 p-12">
                            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <ArrowRight className="h-10 w-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Select a Route</h3>
                            <p className="text-sm font-medium text-center max-w-[300px]">Select a route from the fleet monitor to manage its stops and view assigned students</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Route Dialog */}
            <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
                <DialogContent className="glass border-none sm:max-w-lg">
                    <DialogHeader><DialogTitle className="font-black text-2xl">Edit Route Configuration</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Route Name</Label>
                                <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Route Number</Label>
                                <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Driver Name</Label>
                                <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Driver Phone</Label>
                                <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Vehicle Plate</Label>
                                <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Total Capacity</Label>
                                <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-400">Route Status</Label>
                            <Select value={routeForm.status} onValueChange={(v) => setRouteForm({ ...routeForm, status: v })}>
                                <SelectTrigger className="rounded-xl bg-white/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass border-none">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleUpdateRoute} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                            {loading ? "Saving..." : "Update Fleet Configuration"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
