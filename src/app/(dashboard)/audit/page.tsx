"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  History,
  UserCheck,
  Key,
  Map,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const mockAuditLogs = [
  {
    id: "1",
    actor: "Sanjay (Admin)",
    action: "Update Grade",
    entity: "Mark (Phys-102)",
    time: "2 mins ago",
    ip: "192.168.1.45",
  },
  {
    id: "2",
    actor: "Dr. Elena Vance",
    action: "Record Conduct",
    entity: "Conduct (ID: 452)",
    time: "15 mins ago",
    ip: "102.14.56.22",
  },
  {
    id: "3",
    actor: "System Agent",
    action: "Auto-Procurement",
    entity: "Order (Draft: 88)",
    time: "1 hour ago",
    ip: "Internal",
  },
  {
    id: "4",
    actor: "Sanjay (Admin)",
    action: "Login Success",
    entity: "Auth Session",
    time: "2 hours ago",
    ip: "192.168.1.45",
  },
];

export default function AuditVault() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Security Audit Vault
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Institutional Integrity Monitoring & Immutable Activity Logging
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Key className="h-4 w-4" />
            Key Rotation
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Lock className="h-4 w-4" />
            Lockdown System
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Security Level
          </p>
          <h3 className="text-3xl font-black mt-2">Maximum</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            V2.0 Encryption Active
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Audit Logs
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">12,542</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400">
            Data Retention: 7 Years
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Unique Active IPs
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">18</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-500">
            <Map className="h-4 w-4" />
            Verified Locations
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-red-100 bg-red-50/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
            Failed Auth Attempts
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">03</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-red-400">
            <AlertCircle className="h-4 w-4" />
            No Action Required
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Audit Log Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
              <History className="h-4 w-4" />
              Immutable Log Stream
            </h3>
            <div className="flex gap-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filter logs..."
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 border-slate-100"
              >
                <Filter className="h-3 w-3 mr-2" />
                Refine
              </Button>
            </div>
          </div>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-slate-100">
                {mockAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-6 flex items-start gap-x-4 hover:bg-white/50 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 neon-blue">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-sm tracking-tight">
                          {log.action}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        By{" "}
                        <span className="font-bold text-slate-700">
                          {log.actor}
                        </span>{" "}
                        on{" "}
                        <span className="font-bold text-slate-700">
                          {log.entity}
                        </span>
                      </p>
                      <div className="flex items-center gap-x-2 pt-2">
                        <Badge
                          variant="outline"
                          className="text-[8px] font-black text-slate-400 border-slate-100 bg-slate-50"
                        >
                          IP: {log.ip}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[8px] font-black text-blue-500 border-blue-50 bg-blue-50/50"
                        >
                          VERIFIED
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-300 hover:text-slate-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Logs are cryptographically hashed for institutional tampering
                protection
              </p>
            </div>
          </Card>
        </div>

        {/* Security Controls */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Institutional Control
          </h3>

          <Card className="border-none glass futuristic-card bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <UserCheck className="h-20 w-20" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              RBAC Manager
            </h4>
            <p className="text-xs opacity-60 font-medium leading-relaxed">
              Visual interface for granular Role-Based Access Control. Tweak
              permissions for teachers, students, and guardians.
            </p>
            <Button className="mt-6 w-full bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 border-none shadow-xl shadow-blue-900/40">
              CONFIGURE RBAC
            </Button>
          </Card>

          <Card className="border-none glass futuristic-card p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                Security Health
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase">
                    Database Encryption
                  </span>
                </div>
                <Badge className="bg-green-500 text-white border-none">
                  ACTIVE
                </Badge>
              </div>
              <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase">
                    RLS Security Layers
                  </span>
                </div>
                <Badge className="bg-green-500 text-white border-none">
                  ACTIVE
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
