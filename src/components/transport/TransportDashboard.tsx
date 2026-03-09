"use client";

import { useState } from "react";
import { Bus, MapPin, Plus, Navigation, ShieldCheck, Wifi } from "lucide-react";
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
import { createRoute } from "@/app/actions/transport";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TransportDashboardProps {
    routes: any[];
    stops: any[];
    assignments: any[];
}

export function TransportDashboard({ routes, stops, assignments }: TransportDashboardProps) {
    const router = useRouter();
    const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [routeForm, setRouteForm] = useState({ name: "", route_number: "", driver_name: "", driver_phone: "", plate_number: "", capacity: "40" });

    const handleCreateRoute = async () => {
        setLoading(true);
        const result = await createRoute({ ...routeForm, capacity: parseInt(routeForm.capacity) || 40 });
        setLoading(false);
        if (result.success) {
            setIsAddRouteOpen(false);
            setRouteForm({ name: "", route_number: "", driver_name: "", driver_phone: "", plate_number: "", capacity: "40" });
            router.refresh();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Logistics & Security</h2>
                    <p className="text-slate-500 font-medium">Transport route management and fleet tracking</p>
                </div>
                <div className="flex gap-x-3">
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 border-green-200 text-green-600 bg-green-50 gap-x-2 font-bold uppercase text-[10px]">
                        <Wifi className="h-3 w-3" /> {routes.length} Routes
                    </Badge>
                    <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
                                <Plus className="h-4 w-4" /> Add Route
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Add Bus Route</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Route Name</Label>
                                        <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="North Route" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Route Number</Label>
                                        <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} placeholder="R10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Driver Name</Label>
                                        <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} placeholder="Driver name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Driver Phone</Label>
                                        <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} placeholder="+91..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Plate Number</Label>
                                        <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} placeholder="B-229-SM" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Capacity</Label>
                                        <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleCreateRoute} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                    {loading ? "Creating..." : "Create Route"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Fleet Status */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none glass futuristic-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Fleet Management</CardTitle>
                            <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold">{routes.length} ROUTES</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {routes.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 font-medium text-sm">No routes configured yet.</div>
                            ) : (
                                routes.map((route) => (
                                    <div key={route.id} className="p-4 rounded-2xl bg-white/50 border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-x-3">
                                                <div className={cn("p-2 rounded-xl text-white shadow-lg", route.status === "maintenance" ? "bg-yellow-500" : route.status === "inactive" ? "bg-red-500 neon-purple" : "bg-slate-900 neon-blue")}>
                                                    <Bus className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{route.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{route.plate_number || route.route_number || "—"}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn("text-[10px] font-bold", route.status === "active" ? "border-green-200 text-green-500 bg-green-50" : "border-red-200 text-red-500 bg-red-50")}>
                                                {(route.status || "active").toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                                            <div className="flex items-center gap-x-1">
                                                <Navigation className="h-3 w-3" />
                                                {route.driver_name || "No driver"}
                                            </div>
                                            <div className="flex items-center gap-x-1">
                                                <MapPin className="h-3 w-3" />
                                                Cap: {route.capacity || 40}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Assignments */}
                <div className="lg:col-span-2">
                    <Card className="border-none glass futuristic-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Student Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignments.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 font-medium">No students assigned to routes yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {assignments.map((a) => (
                                        <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-slate-100">
                                            <div className="flex items-center gap-x-4">
                                                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold neon-blue">
                                                    {a.student?.profile?.first_name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{a.student?.profile?.first_name} {a.student?.profile?.last_name}</p>
                                                    <p className="text-[10px] text-slate-400">{a.route?.name || "—"} • {a.stop?.name || "—"}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="font-bold text-[10px] bg-blue-50 text-blue-600 border-blue-100">
                                                {a.route?.route_number || "—"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
