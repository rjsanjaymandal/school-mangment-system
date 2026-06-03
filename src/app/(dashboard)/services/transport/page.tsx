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
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === "vehicles") {
        const { data } = await supabase.from("transport_vehicles").select("*").order("vehicle_number");
        if (isMounted.current) setVehicles(data || []);
      } else if (activeTab === "routes") {
        const { data } = await supabase.from("transport_routes").select("*").order("route_name");
        if (isMounted.current) setRoutes(data || []);
      }
      if (isMounted.current) setLoading(false);
    };

    loadData();

    return () => { isMounted.current = false; };
  }, [activeTab, supabase]);

  const stats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === "active").length,
    totalRoutes: routes.length,
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
                "h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all",
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
                "h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all",
                activeTab === "routes"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Route className="h-4 w-4 inline mr-2" />
              Routes
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Vehicles" value={stats.totalVehicles} icon={Bus} color="blue" description="Registered vehicles" />
        <DashboardStatCard title="Active" value={stats.activeVehicles} icon={Bus} color="emerald" description="Currently active" />
        <DashboardStatCard title="Routes" value={stats.totalRoutes} icon={Route} color="blue" description="Total routes" />
        <DashboardStatCard title="Assigned" value={0} icon={Users} color="amber" description="Students assigned" />
      </div>

      {activeTab === "vehicles" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-black tracking-tight text-slate-900">Fleet Management</h3>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 h-32 animate-pulse" />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="py-16 text-center">
                <Bus className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <p className="text-sm text-slate-500 font-bold tracking-tight">No vehicles registered</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Transport module is ready - add vehicles via database</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <Bus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{vehicle.vehicle_number}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{vehicle.vehicle_type}</p>
                        </div>
                      </div>
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", vehicle.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200")}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <Users className="h-4 w-4" />
                        Capacity: {vehicle.capacity}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-black tracking-tight text-slate-900">Route Management</h3>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 h-24 animate-pulse" />
                ))}
              </div>
            ) : routes.length === 0 ? (
              <div className="py-16 text-center">
                <Route className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <p className="text-sm text-slate-500 font-bold tracking-tight">No routes defined</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Add routes via database to start</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map(route => (
                  <div key={route.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-900">{route.route_name}</h3>
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200">
                        ₹{route.fare}/month
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {route.start_point}
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
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
    </div>
  );
}