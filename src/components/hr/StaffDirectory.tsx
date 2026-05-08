"use client";

import { useState } from "react";
import { 
    Search, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    IdCard, 
    Filter,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StaffMember } from "@/app/actions/hr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function StaffDirectory({ initialData, departments, userRole }: { initialData: any[], departments: any[], userRole: string | null }) {
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState<"all" | "teaching" | "non_teaching">("all");

    // Client-side filtering for immediate response
    const filteredStaff = initialData.filter((staff) => {
        const matchesSearch = 
            staff.first_name?.toLowerCase().includes(search.toLowerCase()) || 
            staff.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            staff.staff_id?.toLowerCase().includes(search.toLowerCase());
        
        const matchesDept = deptFilter === "all" || staff.department_id === deptFilter;
        
        // Filter by staff type (teaching vs non-teaching)
        const matchesRole = roleFilter === "all" || 
            (roleFilter === "teaching" && staff.staff_type === "teaching") ||
            (roleFilter === "non_teaching" && staff.staff_type === "non_teaching");
        const matchesType = typeFilter === "all" || staff.staff_type === typeFilter;

        return matchesSearch && matchesDept && matchesType && matchesRole;
    });

    const isAdmin = userRole === "admin";

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or Staff ID..." 
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Staff Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="teaching">Teaching</SelectItem>
                            <SelectItem value="non_teaching">Non-Teaching</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={deptFilter} onValueChange={setDeptFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((d: any) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Table */}
            <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-600">Staff Member</TableHead>
                                <TableHead className="font-bold text-slate-600">ID & Type</TableHead>
                                <TableHead className="font-bold text-slate-600">Role</TableHead>
                                <TableHead className="font-bold text-slate-600">Contact</TableHead>
                                {isAdmin && <TableHead className="font-bold text-slate-600">Salary</TableHead>}
                                <TableHead className="text-right font-bold text-slate-600">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">
                                        No staff members found matching criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((staff) => (
                                    <TableRow key={staff.id} className="hover:bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-white border-slate-200 shadow-sm">
                                                    <AvatarImage src={staff.photo_url} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                                        {staff.first_name[0]}{staff.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-slate-900">
                                                        {staff.first_name} {staff.last_name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                                        {staff.highest_qualification}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm font-medium text-slate-700 text-slate-700">
                                                {staff.staff_id}
                                            </div>
                                            <Badge variant={staff.staff_type === 'teaching' ? 'default' : 'secondary'} className={staff.staff_type === 'teaching' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' : ''}>
                                                {staff.staff_type === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 text-slate-900">
                                                {staff.designation?.name || "N/A"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {staff.department?.name || "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{staff.mobile}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{staff.email}</div>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell>
                                                <div className="font-bold text-emerald-600 flex items-center gap-1">
                                                    ₹{staff.monthly_salary?.toLocaleString() || "0"}
                                                    <ShieldCheck className="h-3 w-3 opacity-50" />
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px]">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                                                        <Link href={`/hr/staff/${staff.id}`}>
                                                            <Eye className="h-4 w-4 text-blue-500" /> View Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                                                        <Link href={`/hr/staff/${staff.id}/edit`}>
                                                            <Edit className="h-4 w-4 text-amber-500" /> Edit Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer gap-2 font-medium text-emerald-600 focus:text-emerald-700">
                                                        <IdCard className="h-4 w-4" /> Generate ID Card
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
