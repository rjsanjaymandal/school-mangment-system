"use client";

import { useState } from "react";
import { 
    Users, Search, Filter, MoreHorizontal, 
    Printer, Edit3, UserCircle, Download, ChevronRight,
    ArrowUpDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function StudentListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Mock data for the dense table
    const allStudents = [
        { id: "ADM-2026-0001", name: "Ethan Hunt", class: "10-A", roll: "22", status: "Active", gender: "Male" },
        { id: "ADM-2026-0002", name: "Sarah Connor", class: "09-B", roll: "14", status: "Active", gender: "Female" },
        { id: "ADM-2026-0003", name: "James Bond", class: "12-C", roll: "07", status: "Dropped", gender: "Male" },
        { id: "ADM-2026-0004", name: "Ellen Ripley", class: "11-A", roll: "18", status: "Active", gender: "Female" },
        { id: "ADM-2026-0005", name: "Luke Skywalker", class: "08-D", roll: "31", status: "Active", gender: "Male" },
    ];

    const filteredStudents = allStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll.includes(searchQuery)
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredStudents.map(s => s.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkPrint = () => {
        if (selectedIds.length === 0) return;
        toast.info("Preparing Bulk Identity Batch", {
            description: `Generating documents for ${selectedIds.length} students.`,
            icon: <Printer className="h-4 w-4" />
        });
    };

    return (
        <div className="space-y-10">
            {/* Header + Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 reveal-1">
                <div className="flex items-center gap-x-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center indigo-glow">
                        <Users className="h-7 w-7 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                            Student Registry
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                            Central Intelligence • {allStudents.length} Active Profiles
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-x-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Neural Search (Name, ID, Roll)..." 
                            className="pl-12 h-14 rounded-2xl border-slate-200/60 bg-white dark:bg-slate-900 font-bold text-xs shadow-sm focus:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm active:scale-95 transition-all">
                        <Filter className="h-5 w-5 text-slate-600" />
                    </Button>
                    <Button 
                        onClick={handleBulkPrint}
                        disabled={selectedIds.length === 0}
                        className="h-14 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest gap-x-2 shadow-xl active:scale-95 transition-all"
                    >
                        <Printer className="h-4 w-4" />
                        Print ({selectedIds.length})
                    </Button>
                </div>
            </div>

            {/* Dense Data Table */}
            <Card className="card-premium rounded-[3rem] overflow-hidden reveal-2 shadow-2xl border-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-6 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <div className="flex items-center gap-x-2 cursor-pointer hover:text-slate-900">
                                        Profile <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Class/Section</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Roll No</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {filteredStudents.map((s, i) => (
                                <tr key={s.id} className={cn(
                                    "group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors",
                                    selectedIds.includes(s.id) && "bg-primary/5 hover:bg-primary/5"
                                )}>
                                    <td className="px-8 py-5 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => toggleSelectOne(s.id)}
                                        />
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-x-4">
                                            <StudentAvatar 
                                                name={s.name} 
                                                classId={s.class} 
                                                className="h-11 w-11 text-[10px] shadow-lg"
                                            />
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{s.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="rounded-lg bg-white dark:bg-slate-900 border-slate-200 font-black text-[10px] py-1 px-3">
                                            {s.class}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 font-black text-slate-600 dark:text-slate-400">
                                        {s.roll}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-x-2">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                s.status === "Active" ? "bg-emerald-500" : "bg-slate-300"
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                s.status === "Active" ? "text-emerald-600" : "text-slate-400"
                                            )}>{s.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-2xl border-slate-200">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Management</DropdownMenuLabel>
                                                <DropdownMenuItem className="rounded-xl gap-x-3 py-2.5 font-bold text-xs cursor-pointer">
                                                    <UserCircle className="h-4 w-4 text-blue-500" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl gap-x-3 py-2.5 font-bold text-xs cursor-pointer">
                                                    <Edit3 className="h-4 w-4 text-amber-500" /> Edit Record
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                                <DropdownMenuItem className="rounded-xl gap-x-3 py-2.5 font-bold text-xs cursor-pointer">
                                                    <Printer className="h-4 w-4 text-slate-400" /> Print Identity
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Showing 1-{filteredStudents.length} of {allStudents.length} Records
                    </p>
                    <div className="flex gap-x-2">
                        <Button variant="outline" size="sm" className="rounded-lg font-black text-[9px] uppercase tracking-widest h-8" disabled>Prev</Button>
                        <Button variant="outline" size="sm" className="rounded-lg font-black text-[9px] uppercase tracking-widest h-8">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
