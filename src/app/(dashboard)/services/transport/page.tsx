"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bus, MapPin, Users, Phone, Route } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  status: string;
}

interface RouteInfo {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
  stops: string[];
  fare: number;
}

export default function TransportPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"vehicles" | "routes">("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [assignedCount, setAssignedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: "",
    vehicle_type: "Bus",
    capacity: "40",
    driver_name: "",
    driver_phone: "",
    status: "active"
  });

  const [routeForm, setRouteForm] = useState({
    route_name: "",
    start_point: "",
    end_point: "",
    fare: "1500"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, routesRes, assignedRes] = await Promise.all([
        supabase.from("transport_vehicles").select("*").order("vehicle_number"),
        supabase.from("transport_routes").select("*").order("route_name"),
        supabase.from("student_transport").select("*", { count: "exact", head: true })
      ]);

      if (isMounted.current) {
        setVehicles(vehiclesRes.data || []);
        setRoutes(routesRes.data || []);
        setAssignedCount(assignedRes.count || 0);
      }
    } catch (err: any) {
      toast.error("Failed to load transport data", { description: err.message });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => { isMounted.current = false; };
  }, [supabase]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicle_number || !vehicleForm.driver_name) {
      toast.error("Please fill in vehicle number and driver name");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("transport_vehicles").insert({
        vehicle_number: vehicleForm.vehicle_number,
        vehicle_type: vehicleForm.vehicle_type,
        capacity: parseInt(vehicleForm.capacity) || 30,
        driver_name: vehicleForm.driver_name,
        driver_phone: vehicleForm.driver_phone,
        status: vehicleForm.status
      });

      if (error) throw error;
      toast.success("Vehicle registered successfully");
      setIsAddVehicleOpen(false);
      setVehicleForm({ vehicle_number: "", vehicle_type: "Bus", capacity: "40", driver_name: "", driver_phone: "", status: "active" });
      loadData();
    } catch (err: any) {
      toast.error("Failed to add vehicle", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.route_name || !routeForm.start_point || !routeForm.end_point) {
      toast.error("Please fill in route name and route points");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("transport_routes").insert({
        route_name: routeForm.route_name,
        start_point: routeForm.start_point,
        end_point: routeForm.end_point,
        fare: parseFloat(routeForm.fare) || 0
      });

      if (error) throw error;
      toast.success("Route added successfully");
      setIsAddRouteOpen(false);
      setRouteForm({ route_name: "", start_point: "", end_point: "", fare: "1500" });
      loadData();
    } catch (err: any) {
      toast.error("Failed to add route", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === "active").length,
    totalRoutes: routes.length,
    assignedStudents: assignedCount
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Transport Management"
        subtitle="Vehicle and route management"
        icon={Bus}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={cn(
                "h-10 rounded-xl px-5 font-black text-[10px] uppercase tracking-widest transition-all",
                activeTab === "vehicles"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Bus className="h-4 w-4 inline mr-2" />
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={cn(
                "h-10 rounded-xl px-5 font-black text-[10px] uppercase tracking-widest transition-all",
                activeTab === "routes"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Route className="h-4 w-4 inline mr-2" />
              Routes
            </button>
            {activeTab === "vehicles" ? (
              <button
                onClick={() => setIsAddVehicleOpen(true)}
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-5 shadow-lg transition-all"
              >
                + Add Vehicle
              </button>
            ) : (
              <button
                onClick={() => setIsAddRouteOpen(true)}
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-5 shadow-lg transition-all"
              >
                + Add Route
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Vehicles" value={stats.totalVehicles} icon={Bus} color="blue" description="Registered vehicles" />
        <DashboardStatCard title="Active" value={stats.activeVehicles} icon={Bus} color="emerald" description="Currently active" />
        <DashboardStatCard title="Routes" value={stats.totalRoutes} icon={Route} color="blue" description="Total routes" />
        <DashboardStatCard title="Assigned" value={stats.assignedStudents} icon={Users} color="amber" description="Students assigned" />
      </div>

      {activeTab === "vehicles" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Fleet Management</h3>
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
            >
              + Register New Vehicle
            </button>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 h-32 animate-pulse" />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="py-16 text-center">
                <Bus className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">No vehicles registered</p>
                <button
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
                >
                  Register First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/40 rounded-xl">
                          <Bus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{vehicle.vehicle_number}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{vehicle.vehicle_type}</p>
                        </div>
                      </div>
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", vehicle.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800")}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <Users className="h-4 w-4" />
                        Capacity: {vehicle.capacity} Seats
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <Phone className="h-4 w-4" />
                        {vehicle.driver_name} ({vehicle.driver_phone || "N/A"})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "routes" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Route Management</h3>
            <button
              onClick={() => setIsAddRouteOpen(true)}
              className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
            >
              + Create New Route
            </button>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 h-24 animate-pulse" />
                ))}
              </div>
            ) : routes.length === 0 ? (
              <div className="py-16 text-center">
                <Route className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">No routes defined</p>
                <button
                  onClick={() => setIsAddRouteOpen(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md"
                >
                  Create First Route
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map(route => (
                  <div key={route.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{route.route_name}</h3>
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₹{route.fare}/month
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        {route.start_point}
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        {route.end_point}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Register Vehicle</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Add vehicle to the institutional transport fleet</p>
            </div>
            <form onSubmit={handleCreateVehicle} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Vehicle Plate / Registration Number</label>
                <Input
                  required
                  placeholder="e.g. MH-12-AB-1234"
                  value={vehicleForm.vehicle_number}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Vehicle Type</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold bg-white dark:bg-slate-900"
                    value={vehicleForm.vehicle_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}
                  >
                    <option value="Bus">Bus</option>
                    <option value="Mini Bus">Mini Bus</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Seating Capacity</label>
                  <Input
                    type="number"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Driver Name</label>
                <Input
                  required
                  placeholder="Full name of driver"
                  value={vehicleForm.driver_name}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Driver Phone</label>
                <Input
                  placeholder="Emergency contact number"
                  value={vehicleForm.driver_phone}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driver_phone: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {isAddRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Create Route</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Setup route pickup, drop, and monthly fare</p>
            </div>
            <form onSubmit={handleCreateRoute} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Route Identifier / Name</label>
                <Input
                  required
                  placeholder="e.g. Route A - North Campus"
                  value={routeForm.route_name}
                  onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Start / Origin Point</label>
                <Input
                  required
                  placeholder="e.g. Central Station"
                  value={routeForm.start_point}
                  onChange={(e) => setRouteForm({ ...routeForm, start_point: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Destination / End Point</label>
                <Input
                  required
                  placeholder="e.g. Main School Gate"
                  value={routeForm.end_point}
                  onChange={(e) => setRouteForm({ ...routeForm, end_point: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Monthly Fare (₹)</label>
                <Input
                  type="number"
                  value={routeForm.fare}
                  onChange={(e) => setRouteForm({ ...routeForm, fare: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRouteOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}