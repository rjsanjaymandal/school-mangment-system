"use client";

import { useState } from "react";
import {
  FileText,
  Shield,
  Download,
  Eye,
  AlertTriangle,
  Calendar,
  Upload,
  Search,
  Filter,
  Lock,
  CheckCircle2,
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
import { cn } from "@/lib/utils";

const mockDocuments = [
  {
    id: "1",
    title: "Institutional Land Lease 2024",
    category: "Legal",
    expiry: "2027-05-12",
    status: "Secure",
    version: "V2",
  },
  {
    id: "2",
    title: "Teacher Employment Contracts",
    category: "HR",
    expiry: "2025-01-15",
    status: "Action Required",
    version: "V1",
  },
  {
    id: "3",
    title: "Q3 Audit Report (Fiscal)",
    category: "Financial",
    expiry: "N/A",
    status: "Secure",
    version: "V4",
  },
  {
    id: "4",
    title: "Student Privacy Policy v4.2",
    category: "Legal",
    expiry: "N/A",
    status: "Secure",
    version: "V3",
  },
];

export default function ComplianceVault() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Compliance Vault
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Encrypted Institutional Archives & Regulatory Document Management
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Shield className="h-4 w-4" />
            Certify Batch
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Upload className="h-4 w-4" />
            Upload Archive
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Archival Health
          </p>
          <h3 className="text-3xl font-black mt-2">100% Secure</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-300">
            <CheckCircle2 className="h-4 w-4" />
            No Breaches Detected
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-yellow-100 bg-yellow-50/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
            Upcoming Expirations
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">
            01 Document
          </h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            Renews within 60 days
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Encrypted Storage
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">4.2 GB</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400">
            AES-256 Protocol
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Access Requests
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">
            00 Pending
          </h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-500">
            Audit Clear
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Document Master List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
              Institutional Archives
            </h3>
            <div className="flex gap-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search archives..."
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 flex items-center gap-x-6 hover:bg-white/50 transition-all group"
                >
                  <div className="h-14 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-2 mb-1">
                      <h4 className="font-black text-slate-900 truncate">
                        {doc.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[8px] font-black border-slate-200"
                      >
                        {doc.category.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-x-4 text-[10px] font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-x-1">
                        <Calendar className="h-3 w-3" />
                        Expiry: {doc.expiry}
                      </span>
                      <span className="flex items-center gap-x-1">
                        <Shield className="h-3 w-3" />
                        Version: {doc.version}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
              <p className="uppercase tracking-[0.2em]">
                End-to-end Encrypted Institutional Repository
              </p>
              <p>TOTAL: 124 DOCUMENTS</p>
            </div>
          </Card>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
            <Lock className="h-4 w-4 text-slate-400" />
            Security Overlays
          </h3>

          <Card className="border-none glass futuristic-card p-8 bg-linear-to-br from-blue-600 to-blue-500 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Shield className="h-24 w-24" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              Automated Compliance
            </h4>
            <p className="text-xs opacity-80 font-medium leading-relaxed">
              The vault automatically scans for expiring legal documents and
              triggers HR/Admin notifications 90 days prior.
            </p>
            <div className="mt-6 flex items-center gap-x-4">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase opacity-60">
                  Scanning status
                </p>
                <p className="text-sm font-black">ACTIVE / CLEAR</p>
              </div>
            </div>
          </Card>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <CardHeader className="bg-slate-900 p-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-400">
                Document Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {["Legal", "Academic", "HR", "Financial"].map((cat) => (
                  <button
                    key={cat}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all font-bold group"
                  >
                    <span className="text-sm text-slate-700">
                      {cat} Archives
                    </span>
                    <Badge className="bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {Math.floor(Math.random() * 40) + 10}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
