"use client";

import { useState } from "react";
import {
  Bus,
  MapPin,
  ShieldCheck,
  Navigation,
  Wifi,
  AlertTriangle,
  Play,
  Info,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTelemetry } from "@/lib/simulation/telemetry";

function BusMarker({
  id,
  defaultPos,
  icon: Icon,
  label,
  color = "neon-blue",
}: {
  id: string;
  defaultPos: { top: string; left: string };
  icon: any;
  label: string;
  color?: string;
}) {
  const telemetry = useTelemetry(id);

  const style = telemetry
    ? {
        top: `calc(${defaultPos.top} + ${(telemetry.latitude - 25.276985) * 10000}px)`,
        left: `calc(${defaultPos.left} + ${(telemetry.longitude - 55.296249) * 10000}px)`,
        transform: `rotate(${telemetry.heading}deg)`,
      }
    : {
        top: defaultPos.top,
        left: defaultPos.left,
      };

  return (
    <div
      className="absolute transition-all duration-1000 ease-linear group/bus"
      style={style}
    >
      <div className="relative">
        <div
          className={`h-10 w-10 bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl border border-white/20 ${color}`}
        >
          <Icon className="h-full w-full" />
        </div>
        <div className="absolute -top-12 -left-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl transition-all opacity-0 group-hover/bus:opacity-100 scale-90 group-hover/bus:scale-100 whitespace-nowrap">
          {label}:{" "}
          {telemetry?.status === "moving"
            ? `MOVING (${telemetry.speed})`
            : telemetry?.status || "LOCKED"}
        </div>
      </div>
    </div>
  );
}

const buses = [
  {
    id: 1,
    route: "North Route - R10",
    plate: "B-229-SM",
    status: "Active",
    delay: "2m",
    passengers: 28,
    speed: "42 km/h",
  },
  {
    id: 2,
    route: "East Hills - R04",
    plate: "B-108-ED",
    status: "Active",
    delay: "On Time",
    passengers: 14,
    speed: "30 km/h",
  },
  {
    id: 3,
    route: "Campus Shuttle",
    plate: "S-55-SMS",
    status: "Alert",
    delay: "8m",
    passengers: 42,
    speed: "0 km/h",
  },
];

export default function TransportSecurity() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 text-left">
            Logistics & Security
          </h2>
          <p className="text-slate-500 font-medium text-left">
            Real-time telemetry and campus safety monitoring
          </p>
        </div>
        <div className="flex gap-x-3">
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1.5 border-green-200 text-green-600 bg-green-50 gap-x-2 font-bold uppercase text-[10px]"
          >
            <Wifi className="h-3 w-3" />
            Sat-Link Active
          </Badge>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <ShieldCheck className="h-4 w-4" />
            Security Protocols
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Fleet Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none glass futuristic-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">
                Fleet Telemetry
              </CardTitle>
              <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold">
                3 ACTIVE
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-4 rounded-2xl bg-white/50 border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-x-3">
                      <div
                        className={`p-2 rounded-xl text-white shadow-lg ${bus.status === "Alert" ? "bg-red-500 neon-purple" : "bg-slate-900 neon-blue"}`}
                      >
                        <Bus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {bus.route}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {bus.plate}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${bus.status === "Alert" ? "border-red-200 text-red-500 bg-red-50" : "border-slate-100 text-slate-400"}`}
                    >
                      {bus.delay}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    <div className="flex items-center gap-x-1">
                      <Navigation className="h-3 w-3" />
                      {bus.speed}
                    </div>
                    <div className="flex items-center gap-x-1">
                      <MapPin className="h-3 w-3" />
                      GPS Locked
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none glass futuristic-card bg-slate-900 text-white overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/5 shadow-inner">
                <span className="text-sm font-medium opacity-80">
                  Front Gate Cameras
                </span>
                <Badge className="bg-green-500/20 text-green-400 border-none px-2 py-0 text-[10px] font-black">
                  STREAMING
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/5 shadow-inner">
                <span className="text-sm font-medium opacity-80">
                  Perimeter Sensors
                </span>
                <Badge className="bg-blue-500/20 text-blue-400 border-none px-2 py-0 text-[10px] font-black">
                  STABLE
                </Badge>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-white/20 text-white hover:bg-white/10 text-xs font-bold font-mono"
                >
                  ENTER LOCKDOWN MODE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Tactical Map */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none glass futuristic-card h-full flex flex-col min-h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white/30">
              <div className="flex items-center gap-x-3">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <CardTitle className="text-lg font-bold">
                  Tactical Map View
                </CardTitle>
              </div>
              <div className="flex gap-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-100"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-100"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 relative p-0 overflow-hidden bg-slate-900 group">
              {/* Mock Map Background with CSS Grids/Lines */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Mock Map Shapes */}
              <div className="absolute top-1/4 left-1/4 w-32 h-24 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center font-black text-slate-700 text-[10px] rotate-12">
                BLOCK A
              </div>
              <div className="absolute bottom-1/3 right-1/4 w-40 h-32 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-center font-black text-slate-700 text-[10px] -rotate-6">
                MAIN HALL
              </div>

              {/* Animated Path/Trail */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 100 100 Q 250 150 400 300 T 550 500"
                  stroke="rgba(59, 130, 246, 0.4)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-[dash_60s_linear_infinite]"
                />
              </svg>

              {/* GPS Markers */}
              <BusMarker
                id="R10"
                defaultPos={{ top: "100px", left: "100px" }}
                icon={Bus}
                label="R10"
              />
              <BusMarker
                id="S-XX"
                defaultPos={{ top: "400px", left: "400px" }}
                icon={AlertTriangle}
                label="S-XX"
                color="bg-red-500 neon-purple animate-pulse"
              />

              {/* Map Overlay HUD */}
              <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl space-y-3 min-w-[200px]">
                <div className="flex items-center gap-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                    Global Coverage - 92%
                  </span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
                <p className="text-[9px] text-slate-400 font-mono">
                  LAT: 25.276985 • LONG: 55.296249
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
