"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Filter, MoreHorizontal, Printer, Edit3, UserCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { List } from "react-window";

interface StudentData { id: string; admission_number: string; roll_number: string | null; status: string; name: string; gender: string; class_name: string; }

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
                    profile:profiles(first_name, last_name), 
                    class:classes(name)
                `)
                .order("admission_number", { ascending: true })
                .limit(200);
            
            if (error) {
                console.error("Student list fetch error:", error);
                throw error;
            }
            
            return (data || []).map((s: any) => ({
                id: s.id,
                admission_number: s.admission_number,
                roll_number: s.roll_number,
                status: s.status || "active",
                name: `${s.profile?.first_name || ''} ${s.profile?.last_name || ''}`.trim() || "Unknown",
                gender: s.profile?.gender || "-",
                class_name: s.class?.name || "N/A"
            })) as StudentData[];
        },
        staleTime: 60000,
    });

    const filteredStudents = allStudents.filter((s: StudentData) => s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()) || s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.class_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const StudentRow = ({ index, style, students, selectedIds, onToggleSelect }: any) => {
        const student = students[index];
        if (!student) return null;
        const isSelected = selectedIds.includes(student.id);
        return (
            <div style={style} className={`flex items-center px-4 border-b hover:bg-slate-50 ${isSelected ? "bg-emerald-50" : ""}`}>
                <div className="w-10"><input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(student.id)} className="rounded" /></div>
                <div className="w-20 shrink-0"><StudentAvatar name={student.name} /></div>
                <div className="w-32 shrink-0"><p className="text-sm font-mono">{student.admission_number}</p></div>
                <div className="flex-1 min-w-[150px]"><p className="text-sm font-medium">{student.name}</p></div>
                <div className="w-20 shrink-0"><Badge variant="outline" className="text-xs">{student.class_name}</Badge></div>
                <div className="w-16 shrink-0"><span className="text-xs text-muted-foreground">{student.gender}</span></div>
                <div className="w-24 shrink-0"><Badge className={student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}>{student.status}</Badge></div>
                <div className="w-20 px-4 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 rounded-md hover:bg-slate-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-md p-1 border-slate-200">
                            <DropdownMenuLabel className="text-xs font-medium text-slate-500 px-2 py-1">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer"><UserCircle className="h-4 w-4 text-blue-500" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer"><Edit3 className="h-4 w-4 text-amber-500" /> Edit Record</DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-slate-100" />
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer"><Printer className="h-4 w-4 text-slate-400" /> Print ID Card</DropdownMenuItem>
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
                    <div className="h-12 w-12 rounded-md bg-indigo-50 flex items-center justify-center shrink-0"><Users className="h-6 w-6 text-indigo-600" /></div>
                    <div><h1 className="text-2xl font-bold text-slate-900">Student List</h1><p className="text-sm text-slate-500">{allStudents.length} enrolled students</p></div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search students..." className="pl-10 h-10 rounded-md border-slate-200 bg-white font-medium text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                    <Button variant="outline" className="rounded-md h-10"><Filter className="h-4 w-4" /></Button>
                </div>
            </div>
            <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
                <div className="flex items-center px-4 py-3 border-b bg-slate-50 shrink-0">
                    <div className="w-10"><input type="checkbox" className="rounded" /></div>
                    <div className="w-20 shrink-0 text-xs font-medium text-slate-500">Avatar</div>
                    <div className="w-32 shrink-0 text-xs font-medium text-slate-500">Adm No.</div>
                    <div className="flex-1 min-w-[150px] text-xs font-medium text-slate-500">Name</div>
                    <div className="w-20 shrink-0 text-xs font-medium text-slate-500">Class</div>
                    <div className="w-16 shrink-0 text-xs font-medium text-slate-500">Gender</div>
                    <div className="w-24 shrink-0 text-xs font-medium text-slate-500">Status</div>
                    <div className="w-20 shrink-0"></div>
                </div>
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <List
                            style={{ height: "100%", width: "100%" }}
                            rowCount={filteredStudents.length}
                            rowHeight={56}
                            rowComponent={StudentRow}
                            rowProps={{
                                students: filteredStudents,
                                selectedIds,
                                onToggleSelect: (id: string) =>
                                    setSelectedIds((prev) =>
                                        prev.includes(id)
                                            ? prev.filter((x) => x !== id)
                                            : [...prev, id]
                                    ),
                            }}
                        />
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <p className="text-sm text-slate-500">Showing {filteredStudents.length} of {allStudents.length} students</p>
                    <div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-md text-xs" disabled>Prev</Button><Button variant="outline" size="sm" className="rounded-md text-xs" disabled>Next</Button></div>
                </div>
            </Card>
        </div>
    );
}