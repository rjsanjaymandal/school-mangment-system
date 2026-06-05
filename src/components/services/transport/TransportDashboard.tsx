"use client";

import { useMemo, useState } from "react";
import { Bus, MapPin, Plus, Navigation, ShieldCheck, Wifi, Trash2, ArrowRight, UserMinus, Phone, User, Users, Activity, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createRoute, updateRoute, deleteRoute, unassignStudentTransport } from "@/app/actions/transport";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import {
    BarChart, Bar,
    PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip, Legend,
    XAxis, YAxis, CartesianGrid
} from "recharts";
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

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

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
        if (!confirm("Are you sure you want to delete this route?")) return;
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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Bus className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Transport</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage Bus Routes</p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-2">
                        <StudentAssignmentDialog routes={routes} stops={stops} />
                        <button
                            onClick={() => setIsAddRouteOpen(true)}
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all"
                        >
                            <Plus className="h-4 w-4 inline mr-2" /> Add Route
                        </button>
                    </div>
                )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Bus Usage</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Current bus occupancy for each route</p>
                        </div>
                        <Activity className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fleetOccupancyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: "bold" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} unit="%" />
                                <Tooltip 
                                    cursor={{ fill: "var(--muted)" }} 
                                    contentStyle={{ backgroundColor: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "10px" }}
                                    labelStyle={{ color: "var(--foreground)" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Bar dataKey="occupancy" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="mb-4 text-center">
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Service Status</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Current fleet operational health</p>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={routeStatusData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                                    {routeStatusData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "var(--card)", borderRadius: "12px", border: "1px solid var(--border)" }}
                                    labelStyle={{ color: "var(--foreground)" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Active Routes" value={routes.length} icon={Navigation} color="emerald" description="Total routes" />
                <DashboardStatCard title="Fleet Capacity" value={routes.reduce((acc, r) => acc + (r.capacity || 0), 0)} icon={Bus} color="blue" description="Total seats" />
                <DashboardStatCard title="Service Stops" value={stops.length} icon={MapPin} color="amber" description="Registered stops" />
                <DashboardStatCard title="Boarding Students" value={assignments.length} icon={Users} color="rose" description="Assigned riders" />
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search routes, plates, or drivers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 rounded-xl border-slate-200 dark:border-slate-800"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-[180px] h-10 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                    >
                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
                        <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Active</option>
                        <option value="inactive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Offline</option>
                        <option value="maintenance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Maintenance</option>
                    </select>
                </div>
            </div>

            {/* Routes + Detail */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Routes List */}
                <div className="lg:col-span-4 h-full space-y-4">
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">All Routes</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[700px] overflow-y-auto">
                        <div className="p-2 space-y-2">
                            {routes.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 font-black text-[10px] uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 mx-4 rounded-xl">
                                    No active routes
                                </div>
                            ) : (
                                routes.filter(r => {
                                    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        r.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        r.driver_name?.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
                                    return matchesSearch && matchesStatus;
                                }).map((route) => (
                                    <div
                                        key={route.id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer transition-all",
                                            selectedRoute?.id === route.id
                                                ? "bg-emerald-600 border-emerald-600 text-white"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                                    selectedRoute?.id === route.id ? "bg-white/20" : "bg-emerald-100"
                                                )}>
                                                    <Bus className={cn("h-5 w-5", selectedRoute?.id === route.id ? "text-white" : "text-emerald-600")} />
                                                </div>
                                                <div>
                                                    <h4 className={cn(
                                                        "font-bold text-sm tracking-tight",
                                                        selectedRoute?.id === route.id ? "text-white" : "text-slate-900"
                                                    )}>
                                                        {route.name}
                                                    </h4>
                                                    <div className={cn(
                                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-wider mt-0.5",
                                                        selectedRoute?.id === route.id ? "text-white/70" : "text-slate-400"
                                                    )}>
                                                        {route.route_number || "NO_NUMBER"}
                                                        <div className={cn("h-1 w-1 rounded-full", route.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400')} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "mt-3 pt-3 border-t flex items-center justify-between text-[9px] font-black uppercase tracking-wider",
                                            selectedRoute?.id === route.id ? "border-white/20 text-white/70" : "border-slate-100 text-slate-400"
                                        )}>
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3" />
                                                {route.plate_number || "Pending"}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3 w-3" />
                                                {assignments.filter(a => a.route_id === route.id).length}/{route.capacity || 40}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-8">
                    {selectedRoute ? (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <StopManagement
                                        routeId={selectedRoute.id}
                                        routeName={selectedRoute.name}
                                        stops={stops.filter(s => s.route_id === selectedRoute.id)}
                                    />

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Route Information</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vehicle and capacity overview</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Vehicle Plate</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{selectedRoute.plate_number || "Pending"}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Occupancy</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white">
                                                    {assignments.filter(a => a.route_id === selectedRoute.id).length}<span className="text-slate-300">/{selectedRoute.capacity || 40}</span>
                                                </p>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 transition-all rounded-full"
                                                        style={{ width: `${Math.min(100, (assignments.filter(a => a.route_id === selectedRoute.id).length / (selectedRoute.capacity || 40)) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Assigned Driver</p>
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedRoute.driver_name || "Unassigned"}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{selectedRoute.driver_phone || "No contact info"}</p>
                                                    </div>
                                                </div>
                                                <button className="h-10 w-10 rounded-xl border border-emerald-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-100">
                                                    <Phone className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={(e) => openEditRoute(selectedRoute, e)}
                                                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                            >
                                                Edit Route
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoute(selectedRoute.id)}
                                                className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Students on Route */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Students on Route</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Students assigned to this route</p>
                                    </div>
                                    <div className="h-8 w-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <Users className="h-4 w-4 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {assignments.filter(a => a.route_id === selectedRoute.id).length === 0 ? (
                                            <div className="col-span-full text-center py-16 text-slate-400 font-black text-[10px] uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                                No students assigned
                                            </div>
                                        ) : (
                                            assignments.filter(a => a.route_id === selectedRoute.id).map((a) => (
                                                <div key={a.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-300 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                                            {a.student?.profile?.full_name?.[0] || "?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{a.student?.profile?.full_name}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{a.stop?.name || "No stop assigned"}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnassign(a.student_id)}
                                                            className="h-8 w-8 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                                        >
                                                            <UserMinus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 min-h-[400px]">
                            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                                <Bus className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Select a Route</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choose a transport route from the list</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Route Modal */}
            {isAddRouteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Add New Route</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Configure a new transport service path</p>
                            </div>
                            <button onClick={() => setIsAddRouteOpen(false)} className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center">
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Route Name</label>
                                    <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="e.g. North Route" className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Route Number</label>
                                    <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} placeholder="e.g. R-101" className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Driver Name</label>
                                    <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} placeholder="Driver's Full Name" className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Driver Phone</label>
                                    <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} placeholder="+1234567890" className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Bus Plate Number</label>
                                    <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} placeholder="Plate / VIN" className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Seating Capacity</label>
                                    <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <button onClick={handleCreateRoute} disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {loading ? "Creating..." : "Create Route"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Route Modal */}
            {isEditRouteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Edit Route</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Update route configuration</p>
                            </div>
                            <button onClick={() => setIsEditRouteOpen(false)} className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center">
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Route Name</label>
                                    <Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Route Number</label>
                                    <Input value={routeForm.route_number} onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Driver Name</label>
                                    <Input value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Driver Phone</label>
                                    <Input value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Plate Number</label>
                                    <Input value={routeForm.plate_number} onChange={(e) => setRouteForm({ ...routeForm, plate_number: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Capacity</label>
                                    <Input type="number" value={routeForm.capacity} onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Route Status</label>
                                <select
                                    value={routeForm.status}
                                    onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                >
                                    <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Active</option>
                                    <option value="inactive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Inactive</option>
                                    <option value="maintenance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Maintenance</option>
                                </select>
                            </div>
                            <button onClick={handleUpdateRoute} disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {loading ? "Updating..." : "Update Route"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}