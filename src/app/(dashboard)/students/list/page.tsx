"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Search, MoreHorizontal, Printer, Edit3, UserCircle, Loader2, Upload, Download, X, LayoutGrid, List as ListIcon, Send, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { BulkActions } from "@/components/students/BulkActions";
import { List } from "react-window";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StudentData { id: string; admission_number: string; roll_number: string | null; status: string; name: string; gender: string; class_name: string; category?: string; parent_phone?: string; }

const ITEMS_PER_PAGE = 50;

export default function StudentListPage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [filters, setFilters] = useState({
        status: "all",
        gender: "all",
        class: "all",
        sortBy: "admission_number",
    });
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: allStudents = [], isLoading, refetch } = useQuery({
        queryKey: ['students-list-full'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("students")
                .select(`
                    id, 
                    admission_number, 
                    roll_number, 
                    status,
                    category,
                    profile:profiles(first_name, last_name), 
                    class:classes(name)
                `)
                .order("admission_number", { ascending: true })
                .limit(500);
            
            if (error) {
                console.error("Student list fetch error:", JSON.stringify(error));
                return [];
            }
            
            return (data || []).map((s: any) => ({
                id: s.id,
                admission_number: s.admission_number,
                roll_number: s.roll_number,
                status: s.status || "active",
                name: `${s.profile?.first_name || ''} ${s.profile?.last_name || ''}`.trim() || "Unknown",
                gender: s.profile?.gender || "-",
                class_name: s.class?.name || "N/A",
                category: s.category || "General"
            })) as StudentData[];
        },
        staleTime: 60000,
    });

    const { data: classes = [] } = useQuery({
        queryKey: ['classes-list'],
        queryFn: async () => {
            const { data } = await supabase.from("classes").select("id, name").order("name");
            return data || [];
        }
    });

    const stats = {
        total: allStudents.length,
        active: allStudents.filter(s => s.status === "active").length,
        inactive: allStudents.filter(s => s.status === "inactive").length,
        transferred: allStudents.filter(s => s.status === "transferred").length,
    };

    const filteredStudents = allStudents.filter((s: StudentData) => {
        const matchesSearch = !searchQuery || 
            s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.class_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filters.status === "all" || s.status === filters.status;
        const matchesGender = filters.gender === "all" || s.gender === filters.gender;
        const matchesClass = filters.class === "all" || s.class_name === filters.class;
        
        return matchesSearch && matchesStatus && matchesGender && matchesClass;
    }).sort((a, b) => {
        if (filters.sortBy === "name") return a.name.localeCompare(b.name);
        if (filters.sortBy === "class") return a.class_name.localeCompare(b.class_name);
        return a.admission_number.localeCompare(b.admission_number);
    });

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredStudents.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const StudentRow = ({ index, style, students, selectedIds, onToggleSelect }: any) => {
        const student = students[index];
        if (!student) return null;
        const isSelected = selectedIds.includes(student.id);
        return (
            <div style={style} className={cn("flex items-center px-4 border-b hover:bg-slate-50", isSelected ? "bg-emerald-50" : "")}>
                <div className="w-10"><input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(student.id)} className="rounded" /></div>
                <div className="w-20 shrink-0"><StudentAvatar name={student.name} /></div>
                <div className="w-32 shrink-0"><p className="text-sm font-mono">{student.admission_number}</p></div>
                <div className="flex-1 min-w-[150px] cursor-pointer" onClick={() => router.push(`/students/${student.id}`)}><p className="text-sm font-medium hover:text-emerald-600">{student.name}</p></div>
                <div className="w-20 shrink-0"><Badge variant="outline" className="text-xs">{student.class_name}</Badge></div>
                <div className="w-16 shrink-0"><span className="text-xs text-muted-foreground">{student.gender}</span></div>
                <div className="w-24 shrink-0"><Badge className={student.status === "active" ? "bg-emerald-100 text-emerald-700" : student.status === "inactive" ? "bg-slate-100" : "bg-amber-100 text-amber-700"}>{student.status}</Badge></div>
                <div className="w-20 px-4 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 rounded-md hover:bg-slate-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-md p-1 border-slate-200">
                            <DropdownMenuLabel className="text-xs font-medium text-slate-500 px-2 py-1">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer" onClick={() => router.push(`/students/${student.id}`)}><UserCircle className="h-4 w-4 text-blue-500" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer" onClick={() => router.push(`/students/${student.id}/edit`)}><Edit3 className="h-4 w-4 text-amber-500" /> Edit Record</DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-slate-100" />
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer"><Printer className="h-4 w-4 text-slate-400" /> Print ID Card</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer"><Send className="h-4 w-4 text-slate-400" /> Send SMS</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer"><Mail className="h-4 w-4 text-slate-400" /> Send Email</DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-slate-100" />
                            <DropdownMenuItem className="rounded-md gap-2 py-2 text-sm cursor-pointer text-rose-600 focus:text-rose-600" onClick={async () => {
                                if (confirm(`Delete ${student.name}?`)) {
                                    const { error } = await supabase.from("students").delete().eq("id", student.id);
                                    if (error) toast.error("Failed to delete"); else { toast.success("Deleted"); refetch(); }
                                }
                            }}><X className="h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    };

    const hasActiveFilters = filters.status !== "all" || filters.gender !== "all" || filters.class !== "all";

    return (
        <div className="p-4 md:p-6 space-y-6">
            {isLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
            ) : allStudents.length === 0 ? (
                <Card className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold">No students found</h3>
                    <p className="text-sm text-slate-500 mt-1">Check RLS policies or add students</p>
                </Card>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Total Students</p>
                                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"><Users className="h-5 w-5 text-indigo-600" /></div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Active</p>
                                    <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.active}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center"><UserCircle className="h-5 w-5 text-emerald-600" /></div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Inactive</p>
                                    <p className="text-2xl font-bold mt-1 text-slate-600">{stats.inactive}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center"><Users className="h-5 w-5 text-slate-600" /></div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">Transferred</p>
                                    <p className="text-2xl font-bold mt-1 text-amber-600">{stats.transferred}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center"><Send className="h-5 w-5 text-amber-600" /></div>
                            </div>
                        </Card>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-md bg-indigo-50 flex items-center justify-center shrink-0"><Users className="h-6 w-6 text-indigo-600" /></div>
                            <div><h1 className="text-2xl font-bold text-slate-900">Student List</h1><p className="text-sm text-slate-500">{filteredStudents.length} students</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/students/enroll">
                                <Button size="sm" className="bg-emerald-600 gap-2"><Users className="h-4 w-4" /> Add Student</Button>
                            </Link>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowImportDialog(true)}><Upload className="h-4 w-4" /> Import</Button>
                            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
                            <div className="flex border rounded-md">
                                <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-r-none" onClick={() => setViewMode("table")}><ListIcon className="h-4 w-4" /></Button>
                                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-l-none" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search students..." className="pl-10 h-10 rounded-md" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <Select value={filters.status} onValueChange={(v) => { setFilters(f => ({ ...f, status: v })); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-10 rounded-md"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="transferred">Transferred</SelectItem>
                                <SelectItem value="graduated">Graduated</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.gender} onValueChange={(v) => { setFilters(f => ({ ...f, gender: v })); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-10 rounded-md"><SelectValue placeholder="Gender" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Gender</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.class} onValueChange={(v) => { setFilters(f => ({ ...f, class: v })); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[160px] h-10 rounded-md"><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {classes.map((c: any) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.sortBy} onValueChange={(v) => setFilters(f => ({ ...f, sortBy: v }))}>
                            <SelectTrigger className="w-[140px] h-10 rounded-md"><SelectValue placeholder="Sort" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admission_number">Adm No.</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="class">Class</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (<Button variant="ghost" size="sm" onClick={() => setFilters({ status: "all", gender: "all", class: "all", sortBy: "admission_number" })} className="text-slate-500"><X className="h-4 w-4 mr-1" /> Clear</Button>)}
                    </div>

                    <BulkActions selectedIds={selectedIds} onClearSelection={() => setSelectedIds([])} onRefresh={() => refetch()} />

                    {viewMode === "table" ? (
                        <Card className="overflow-hidden border-slate-200 shadow-sm">
                            <div className="flex items-center px-4 py-3 border-b bg-slate-50">
                                <div className="w-10"><input type="checkbox" className="rounded" checked={selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0} onChange={toggleSelectAll} /></div>
                                <div className="w-20 shrink-0 text-xs font-medium text-slate-500">Avatar</div>
                                <div className="w-32 shrink-0 text-xs font-medium text-slate-500">Adm No.</div>
                                <div className="flex-1 min-w-[150px] text-xs font-medium text-slate-500">Name</div>
                                <div className="w-20 shrink-0 text-xs font-medium text-slate-500">Class</div>
                                <div className="w-16 shrink-0 text-xs font-medium text-slate-500">Gender</div>
                                <div className="w-24 shrink-0 text-xs font-medium text-slate-500">Status</div>
                                <div className="w-20 shrink-0"></div>
                            </div>
                            <div className="max-h-[60vh] overflow-auto">
                                <List style={{ height: "100%", width: "100%" }} rowCount={paginatedStudents.length} rowHeight={56} rowComponent={StudentRow} rowProps={{ students: paginatedStudents, selectedIds, onToggleSelect: toggleSelect }} />
                            </div>
                            <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Showing {paginatedStudents.length} of {filteredStudents.length}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="rounded-md text-xs" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                                    <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                                    <Button variant="outline" size="sm" className="rounded-md text-xs" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedStudents.map(student => (
                                <Card key={student.id} className={cn("p-4 cursor-pointer hover:border-emerald-300 transition-colors", selectedIds.includes(student.id) ? "border-emerald-500 bg-emerald-50" : "")} onClick={() => router.push(`/students/${student.id}`)}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="rounded mt-1" checked={selectedIds.includes(student.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(student.id); }} onClick={(e) => e.stopPropagation()} />
                                        <StudentAvatar name={student.name} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{student.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{student.admission_number}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">{student.class_name}</Badge>
                                                <Badge className={cn("text-xs", student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100")}>{student.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Import Students</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-500">Drop CSV file here or click to upload</p>
                                    <p className="text-xs text-slate-400 mt-1">Format: Name, Email, Phone, Class, Gender, DOB</p>
                                </div>
                                <Button variant="outline" className="w-full">Download Template</Button>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                                <Button className="bg-emerald-600">Import</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}