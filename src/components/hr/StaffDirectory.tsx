"use client";

import { useState } from "react";
import { 
    Search, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    IdCard, 
    Filter,
    ShieldCheck,
    Users,
    Activity,
    Mail,
    Phone,
    Briefcase,
    Building2,
    CheckCircle2,
    X,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ERPCard } from "@/components/ui/erp-card";
import { cn } from "@/lib/utils";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";

export function StaffDirectory({ initialData, departments, userRole }: { initialData: any[], departments: any[], userRole: string | null }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    const filteredStaff = initialData.filter((staff) => {
        const matchesSearch = 
            staff.first_name?.toLowerCase().includes(search.toLowerCase()) || 
            staff.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            staff.staff_id?.toLowerCase().includes(search.toLowerCase());
        
        const matchesDept = deptFilter === "all" || staff.department_id === deptFilter;
        const matchesType = typeFilter === "all" || staff.staff_type === typeFilter;

        return matchesSearch && matchesDept && matchesType;
    });

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const isAdmin = userRole === "admin";

    return (
        <div className="space-y-6">
            {/* Filter Hub */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search staff by name or ID..." 
                        className="pl-11 h-11 rounded-xl bg-slate-50/50 border-slate-200 text-xs font-bold"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select 
                        value={typeFilter} 
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        className="h-11 px-4 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="teaching">Teaching</option>
                        <option value="non_teaching">Non-Teaching</option>
                    </select>
                    <select 
                        value={deptFilter} 
                        onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                        className="h-11 px-4 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <Button 
                            variant={viewMode === "table" ? "secondary" : "ghost"} 
                            size="icon" 
                            className="h-10 w-10 rounded-none" 
                            onClick={() => setViewMode("table")}
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === "grid" ? "secondary" : "ghost"} 
                            size="icon" 
                            className="h-10 w-10 rounded-none" 
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === "table" ? (
                <ERPCard
                    title="Staff List"
                    description="Complete staff and employee records"
                    icon={<Users className="h-5 w-5" />}
                    color="emerald"
                    className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-4">Personnel</th>
                                    <th className="px-6 py-4">ID & Type</th>
                                    <th className="px-6 py-4">Designation</th>
                                    <th className="px-6 py-4">Contact</th>
                                    {isAdmin && <th className="px-6 py-4 text-center">Monthly Salary</th>}
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                                            No personnel found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStaff.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-11 w-11 rounded-xl bg-white p-0.5 border border-slate-100 shadow-sm group-hover:rotate-3 transition-transform">
                                                        <Avatar className="h-full w-full rounded-[10px]">
                                                            <AvatarImage src={staff.photo_url} />
                                                            <AvatarFallback className="bg-emerald-500 text-white font-black text-xs">
                                                                {staff.first_name[0]}{staff.last_name?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 tracking-tight text-sm">
                                                            {staff.first_name} {staff.last_name}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">
                                                            {staff.highest_qualification}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-mono text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {staff.staff_id}
                                                </div>
                                                <div className={cn(
                                                    "inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                                    staff.staff_type === 'teaching' 
                                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                                )}>
                                                    {staff.staff_type === 'teaching' ? 'Teaching' : 'Admin'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Briefcase className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">{staff.designation?.name || "N/A"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{staff.department?.name || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600">{staff.mobile}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{staff.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-5 text-center">
                                                    <div className="font-black text-emerald-600 text-sm tracking-tighter">
                                                        ₹{staff.monthly_salary?.toLocaleString() || "0"}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 rounded-xl hover:bg-slate-100">
                                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl backdrop-blur-xl bg-white/95">
                                                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 py-2">Operations</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/hr/staff/${staff.id}`)}>
                                                            <Eye className="h-4 w-4 text-blue-500" /> View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/hr/staff/${staff.id}/edit`)}>
                                                            <Edit className="h-4 w-4 text-amber-500" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                                        <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50 text-emerald-600">
                                                            <IdCard className="h-4 w-4" /> Generate ID Card
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Unified Pagination Framework */}
                    <UnifiedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStaff.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        itemName="personnel"
                    />
                </ERPCard>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
                        {paginatedStaff.map((staff) => (
                            <div 
                                key={staff.id} 
                                className="glass futuristic-card group relative p-6 rounded-3xl border-none shadow-xl text-center hover:scale-[1.02] transition-all cursor-pointer"
                                onClick={() => router.push(`/hr/staff/${staff.id}`)}
                            >
                                <div className="absolute top-4 right-4">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                        staff.staff_type === 'teaching' 
                                            ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                            : "bg-slate-50 text-slate-500 border-slate-100"
                                    )}>
                                        {staff.staff_type === 'teaching' ? 'Teaching' : 'Admin'}
                                    </span>
                                </div>
                                <div className="h-20 w-20 mx-auto rounded-2xl bg-white p-1 border-2 border-slate-100 shadow-sm group-hover:rotate-6 transition-transform">
                                    <Avatar className="h-full w-full rounded-xl">
                                        <AvatarImage src={staff.photo_url} />
                                        <AvatarFallback className="bg-emerald-500 text-white font-black text-xl">
                                            {staff.first_name[0]}{staff.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="mt-4">
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{staff.first_name} {staff.last_name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{staff.designation?.name || "N/A"}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Staff ID</p>
                                            <p className="text-[10px] font-black font-mono text-slate-600">{staff.staff_id}</p>
                                        </div>
                                        <div className="h-6 w-[1px] bg-slate-100" />
                                        <div className="flex flex-col items-center">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Dept</p>
                                            <p className="text-[10px] font-black text-slate-600 truncate max-w-[60px]">{staff.department?.name || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <UnifiedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStaff.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        itemName="personnel"
                    />
                </div>
            )}
        </div>
    );
}
