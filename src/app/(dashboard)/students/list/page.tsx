"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
    Users, Search, Filter, MoreHorizontal, 
    Printer, Edit3, UserCircle, ArrowUpDown, Loader2
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
import { List } from "react-window";

interface StudentData {
    id: string;
    admission_number: string;
    roll_number: string | null;
    status: string;
    name: string;
    gender: string;
    class_name: string;
}

export default function StudentListPage() {
    const supabase = createClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: allStudents = [], isLoading } = useQuery({
        queryKey: ['students-list-full'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("students")
                .select(`
                    id,
                    admission_number,
                    roll_number,
                    status,
                    profile:profiles(full_name, first_name, last_name, gender),
                    class:classes(name)
                `)
                .order("admission_number", { ascending: true });

            if (error) throw error;
            return (data || []).map((s: any) => ({
                id: s.id,
                admission_number: s.admission_number,
                roll_number: s.roll_number || "-",
                status: s.status || "active",
                name: s.profile?.first_name 
                    ? `${s.profile.first_name} ${s.profile.last_name || ''}`.trim() 
                    : (s.profile?.full_name || "Unknown"),
                gender: s.profile?.gender || "Unknown",
                class_name: s.class?.name || "N/A",
            })) as StudentData[];
        }
    });

    const filteredStudents = allStudents.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_number && s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
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

    // Virtualized Row Renderer
    const StudentRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const s = filteredStudents[index];
        if (!s) return null;
        
        const isSelected = selectedIds.includes(s.id);
        const isActive = s.status === "active";

        return (
            <div style={style} className={cn(
                "flex items-center border-b border-slate-100 hover:bg-slate-50 transition-colors px-4",
                isSelected && "bg-primary/5"
            )}>
                <div className="w-12 text-center shrink-0">
                    <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-slate-300"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(s.id)}
                    />
                </div>
                <div className="flex-1 min-w-[200px] px-4">
                    <div className="flex items-center gap-3">
                        <StudentAvatar 
                            name={s.name} 
                            classId={s.class_name} 
                            className="h-9 w-9 text-xs shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                            <p className="text-xs text-slate-400 truncate">{s.admission_number}</p>
                        </div>
                    </div>
                </div>
                <div className="w-32 px-4 shrink-0">
                    <Badge variant="outline" className="rounded-md border-slate-200 text-xs truncate max-w-full">
                        {s.class_name}
                    </Badge>
                </div>
                <div className="w-24 px-4 font-medium text-slate-600 text-sm shrink-0">
                    {s.roll_number}
                </div>
                <div className="w-28 px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            isActive ? "bg-emerald-500" : "bg-slate-300"
                        )} />
                        <span className={cn(
                            "text-xs font-medium capitalize truncate",
                            isActive ? "text-emerald-600" : "text-slate-500"
                        )}>{s.status}</span>
                    </div>
                </div>
                <div className="w-20 px-4 text-right shrink-0">
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
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 flex flex-col h-full max-h-[calc(100vh-80px)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Student List</h1>
                        <p className="text-sm text-slate-500">{allStudents.length} enrolled students</p>
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
                    <Button variant="outline" className="h-10 w-10 rounded-md border-slate-200 shrink-0">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                        onClick={handleBulkPrint}
                        disabled={selectedIds.length === 0}
                        className="h-10 px-4 rounded-md bg-slate-900 text-white font-medium text-sm gap-2 shrink-0"
                    >
                        <Printer className="h-4 w-4" />
                        Print ({selectedIds.length})
                    </Button>
                </div>
            </div>

            {/* Dense Data Table */}
            <Card className="rounded-md border flex flex-col flex-1 min-h-[500px]">
                <div className="flex items-center bg-slate-50 border-b border-slate-100 px-4 py-3 shrink-0 font-medium text-xs text-slate-500 uppercase">
                    <div className="w-12 text-center shrink-0">
                        <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-slate-300"
                            checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                            onChange={toggleSelectAll}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px] px-4 flex items-center gap-2 cursor-pointer hover:text-slate-900">
                        Student <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div className="w-32 px-4 shrink-0">Class</div>
                    <div className="w-24 px-4 shrink-0">Roll</div>
                    <div className="w-28 px-4 shrink-0">Status</div>
                    <div className="w-20 px-4 text-right shrink-0">Actions</div>
                </div>
                
                <div className="flex-1 bg-white relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                            <p className="text-sm text-slate-500 font-medium">Loading student registry...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <Users className="h-12 w-12 mb-2 opacity-20" />
                            <p className="text-sm">No students found matching your criteria.</p>
                        </div>
                    ) : (
                        <List
                            style={{ height: "100%", width: "100%", position: "absolute" }}
                            rowCount={filteredStudents.length}
                            rowHeight={64} // Matches the h-16 equivalent padding
                            rowComponent={StudentRow}
                            rowProps={{} as any} // react-window ts workaround
                        />
                    )}
                </div>
                
                {/* Pagination Status */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <p className="text-sm text-slate-500">
                        Showing {filteredStudents.length} of {allStudents.length} students
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-md text-xs" disabled>Prev</Button>
                        <Button variant="outline" size="sm" className="rounded-md text-xs" disabled>Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
