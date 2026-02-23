"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Library,
  Book,
  Bookmark,
  Search,
  Filter,
  Plus,
  Clock,
  Tag,
  User,
  Package,
  History,
  ArrowRightLeft,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LogisticsHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Logistics & Repository
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Institutional Assets and Library Management
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Package className="h-4 w-4" />
            Audit Assets
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Plus className="h-4 w-4" />
            New Acquisition
          </Button>
        </div>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14">
          <TabsTrigger
            value="library"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <Library className="h-4 w-4" />
            Central Library
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Lending History
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <Package className="h-4 w-4" />
            School Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <div className="flex gap-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search institutional repository for resources..."
                className="pl-9 bg-white border-slate-100 rounded-2xl h-12 shadow-sm"
              />
            </div>
            <Button className="h-12 rounded-2xl px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none transition-all">
              Subject Filter
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Advanced Calculus v4",
                author: "Dr. Stern",
                category: "Mathematics",
                stock: 12,
                available: 8,
              },
              {
                title: "Molecular Biology",
                author: "Jane Doe",
                category: "Science",
                stock: 5,
                available: 1,
              },
              {
                title: "Universal History",
                author: "H.G. Wells",
                category: "Social Sciences",
                stock: 20,
                available: 20,
              },
            ].map((book, i) => (
              <Card
                key={i}
                className="border-none glass futuristic-card group p-2"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg neon-blue">
                    <Book className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold text-[10px]",
                      book.available > 0
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-red-50 text-red-600 border-red-100",
                    )}
                  >
                    {book.available > 0
                      ? `${book.available} IN STOCK`
                      : "OUT OF STOCK"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      By {book.author}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {book.category}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-xl h-8 text-[10px] font-bold px-4 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 border-none transition-all"
                    >
                      ISSUE BOOK
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b">
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Resource Entity
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Target Student
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Issue Cycle
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Due State
                  </th>
                  <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    title: "Advanced Physics",
                    student: "Alexander Pierce",
                    issued: "12 Oct",
                    due: "26 Oct",
                    status: "Active",
                  },
                  {
                    title: "Organic Chemistry",
                    student: "Sophia Martinez",
                    issued: "05 Oct",
                    due: "19 Oct",
                    status: "Overdue",
                  },
                ].map((tx, i) => (
                  <tr key={i} className="hover:bg-white/60 transition-colors">
                    <td className="py-6 px-8 font-bold text-slate-900">
                      {tx.title}
                    </td>
                    <td className="py-6 px-8 font-medium text-slate-600">
                      {tx.student}
                    </td>
                    <td className="py-6 px-8 text-slate-400 font-mono text-xs">
                      {tx.issued}
                    </td>
                    <td className="py-6 px-8 text-slate-400 font-mono text-xs">
                      {tx.due}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-bold text-[10px] uppercase tracking-widest",
                          tx.status === "Active"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-red-50 text-red-600 border-red-100",
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-lg font-black flex items-center gap-x-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  Asset Lifecycle
                </CardTitle>
                <Badge className="bg-blue-500 text-white border-none font-black text-[10px]">
                  98% TRACKED
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Laboratory Laptops", val: 85, status: "Active" },
                  { name: "Smart Boards", val: 92, status: "Stable" },
                  { name: "Chemical Stock", val: 40, status: "Low" },
                ].map((asset, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold opacity-80">{asset.name}</span>
                      <Badge
                        variant="outline"
                        className={`${asset.status === "Low" ? "border-red-500/50 text-red-400" : "border-green-500/50 text-green-400"} text-[8px] font-black`}
                      >
                        {asset.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${asset.val < 50 ? "bg-red-500" : "bg-blue-500"} neon-blue`}
                        style={{ width: `${asset.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
