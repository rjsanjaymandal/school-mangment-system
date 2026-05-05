"use client";

import { useState } from "react";
import { 
    Users, Search, Filter, MoreHorizontal, 
    Printer, Edit3, UserCircle, Download, ChevronRight,
    ArrowUpDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
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
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-indigo-50 flex items-center justify-center">
                        <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Student List</h1>
                        <p className="text-sm text-slate-500">{allStudents.length} active students</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search students..." 
                            className="pl-10 h-10 rounded-md border-slate-200 bg-white font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-10 w-10 rounded-md border-slate-200">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                        onClick={handleBulkPrint}
                        disabled={selectedIds.length === 0}
                        className="h-10 px-4 rounded-md bg-slate-900 text-white font-medium text-sm gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print ({selectedIds.length})
                    </Button>
                </div>
            </div>

            {/* Dense Data Table */}
            <Card className="rounded-md overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-slate-300"
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                                        Student <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Class</th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Roll</th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map((s, i) => (
                                <tr key={s.id} className={cn(
                                    "hover:bg-slate-50 transition-colors",
                                    selectedIds.includes(s.id) && "bg-primary/5"
                                )}>
                                    <td className="px-4 py-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-slate-300"
                                            checked={selectedIds.includes(s.id)}
                                            onChange={() => toggleSelectOne(s.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <StudentAvatar 
                                                name={s.name} 
                                                classId={s.class} 
                                                className="h-9 w-9 text-xs"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="rounded-md border-slate-200 text-xs">
                                            {s.class}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-600">
                                        {s.roll}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                s.status === "Active" ? "bg-emerald-500" : "bg-slate-300"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-medium",
                                                s.status === "Active" ? "text-emerald-600" : "text-slate-500"
                                            )}>{s.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-md hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-md p-1 border-slate-200">
                                                <DropdownMenuLabel className="text-xs font-medium text-slate-500 px-2 py-1">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer">
                                                    <UserCircle className="h-4 w-4 text-blue-500" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer">
                                                    <Edit3 className="h-4 w-4 text-amber-500" /> Edit Record
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                                <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer">
                                                    <Printer className="h-4 w-4 text-slate-400" /> Print ID Card
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {filteredStudents.length} of {allStudents.length} students
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-md text-xs" disabled>Prev</Button>
                        <Button variant="outline" size="sm" className="rounded-md text-xs">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
