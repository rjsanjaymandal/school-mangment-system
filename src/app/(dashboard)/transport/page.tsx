"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bus, MapPin, Users, Clock, Navigation, Plus, Route, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ERPCard } from "@/components/ui/erp-card";
import { toast } from "sonner";

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

interface StudentTransport {
  student_id: string;
  route_id: string;
  stop_name: string;
  pickup_time: string;
  drop_time: string;
  student?: { full_name: string; admission_number: string; class: { name: string } };
}

export default function TransportPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"vehicles" | "routes" | "students">("vehicles");
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
    activeStudents: 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transport Management</h1>
          <p className="text-muted-foreground">Vehicle and route management</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === "vehicles" ? "default" : "outline"} onClick={() => setActiveTab("vehicles")}>
            <Bus className="h-4 w-4 mr-2" />
            Vehicles
          </Button>
          <Button variant={activeTab === "routes" ? "default" : "outline"} onClick={() => setActiveTab("routes")}>
            <Route className="h-4 w-4 mr-2" />
            Routes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bus className="h-4 w-4" />
            Total Vehicles
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalVehicles}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <Bus className="h-4 w-4" />
            Active
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.activeVehicles}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Route className="h-4 w-4" />
            Routes
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.totalRoutes}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Users className="h-4 w-4" />
            Assigned
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.activeStudents}</p>
        </div>
      </div>

      {/* Content */}
      {activeTab === "vehicles" && (
        <ERPCard accentColor="blue">
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <CardTitle>Fleet Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : vehicles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bus className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No vehicles registered</p>
                <p className="text-sm">Transport module is ready - add vehicles via database</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="border rounded-lg p-4 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{vehicle.vehicle_number}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.vehicle_type}</p>
                        </div>
                      </div>
                      <Badge className={vehicle.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100"}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Capacity: {vehicle.capacity}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {vehicle.driver_name} ({vehicle.driver_phone || "N/A"})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ERPCard>
      )}

      {activeTab === "routes" && (
        <ERPCard accentColor="emerald">
          <CardHeader className="border-b">
            <CardTitle>Route Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : routes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No routes defined</p>
                <p className="text-sm">Add routes via database to start</p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {routes.map(route => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{route.route_name}</h3>
                      <Badge>₹{route.fare}/month</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
          </CardContent>
        </ERPCard>
      )}
    </div>
  );
}