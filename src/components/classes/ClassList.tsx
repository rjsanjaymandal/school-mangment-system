"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    Users,
    School,
    DoorOpen,
    Hash,
    Search,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Class } from "@/types/database";
import { toast } from "sonner";
import { ClassForm } from "./ClassForm";
import { deleteClass } from "@/app/actions/classes";
import { useRouter } from "next/navigation";

interface ClassListProps {
    initialData: Class[];
    userRole?: string | null;
    teachers: { id: string; full_name: string }[];
}

export function ClassList({ initialData, userRole, teachers }: ClassListProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [data, setData] = useState<Class[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);

    const filteredData = data.filter((cls) =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.room_number && cls.room_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const onAdd = () => {
        setEditingClass(null);
        setIsOpen(true);
    };

    const onEdit = (cls: Class) => {
        setEditingClass(cls);
        setIsOpen(true);
    };

    const onDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return;
        const res = await deleteClass(id);
        if (res.success) {
            toast.success("Class deleted successfully");
            router.refresh();
            setData(data.filter(c => c.id !== id));
        } else {
            toast.error(res.error || "Failed to delete class");
        }
    };

    const totalCapacity = data.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const uniqueRooms = new Set(data.map(c => c.room_number).filter(Boolean)).size;

    return (
        <div className="space-y-12 reveal-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                        placeholder="Search classes..."
                        className="pl-12 bg-card border-border h-12 font-bold text-[10px] uppercase tracking-widest placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isAdminOrTeacher && (
                    <Button
                        onClick={onAdd}
                        className="h-12 px-8 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm uppercase tracking-widest text-[9px] transition-all hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add New Class
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card className="bg-card border-border p-6 relative overflow-hidden group hover:border-primary/50 transition-all rounded-xl shadow-sm">
                    <School className="absolute right-[-10px] bottom-[-10px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">Total Classes</p>
                    <h3 className="text-4xl font-bold tracking-tight text-foreground transition-colors">{data.length}</h3>
                    <div className="h-1 w-full bg-muted mt-6 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[65%]" />
                    </div>
                </Card>
                <Card className="bg-card border-border p-6 relative overflow-hidden group hover:border-primary/50 transition-all rounded-xl shadow-sm">
                    <Users className="absolute right-[-10px] bottom-[-10px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">Total Capacity</p>
                    <h3 className="text-4xl font-bold tracking-tight text-foreground transition-colors">{totalCapacity}</h3>
                    <div className="h-1 w-full bg-muted mt-6 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[45%]" />
                    </div>
                </Card>
                <Card className="bg-card border-border p-6 relative overflow-hidden group hover:border-primary/50 transition-all rounded-xl shadow-sm">
                    <DoorOpen className="absolute right-[-10px] bottom-[-10px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">Allocated Rooms</p>
                    <h3 className="text-4xl font-bold tracking-tight text-foreground transition-colors">{uniqueRooms}</h3>
                    <div className="h-1 w-full bg-muted mt-6 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[82%]" />
                    </div>
                </Card>
                <Card className="bg-card border-border p-6 relative overflow-hidden group hover:border-primary/50 transition-all rounded-xl shadow-sm">
                    <Building2 className="absolute right-[-10px] bottom-[-10px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 italic">System Status</p>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground uppercase mt-1 leading-none">Verified</h3>
                    <div className="h-1 w-full bg-muted mt-6 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full" />
                    </div>
                </Card>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/50">
                        <tr className="border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Class Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Capacity</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Room No.</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Class Teacher</th>
                            {isAdminOrTeacher && <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={isAdminOrTeacher ? 5 : 4} className="h-64 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">No classes matched the search criteria.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((cls) => (
                                <tr key={cls.id} className="group hover:bg-muted/30 transition-all duration-300">
                                    <td className="px-6 py-5 font-bold text-foreground uppercase tracking-tight text-sm group-hover:text-primary transition-colors italic">
                                        {cls.name}
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-foreground/80">
                                        <div className="flex items-center gap-x-3 italic">
                                            <Users className="h-4 w-4 text-primary" />
                                            {cls.capacity || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">
                                        {cls.room_number || "UNALLOCATED"}
                                    </td>
                                    <td className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 italic">
                                        {(cls as any).teacher?.full_name || "NOT ASSIGNED"}
                                    </td>
                                    {isAdminOrTeacher && (
                                        <td className="px-6 py-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-9 w-9 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border shadow-lg p-2 min-w-[200px] rounded-xl">
                                                    <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest opacity-40 px-3 py-2">Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit(cls)}
                                                        className="gap-x-3 cursor-pointer font-bold uppercase text-[10px] tracking-widest focus:bg-primary focus:text-white p-3 rounded-lg italic transition-all"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" /> Edit Class
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(cls.id)}
                                                        className="gap-x-3 text-destructive focus:text-white focus:bg-destructive cursor-pointer font-bold uppercase text-[10px] tracking-widest p-3 rounded-lg italic transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Delete Class
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-card border-border p-0 overflow-hidden max-w-xl rounded-2xl shadow-2xl">
                    <div className="p-8 bg-muted/30 border-b border-border relative overflow-hidden">
                        <School className="absolute right-[-20px] top-[-20px] h-32 w-32 text-primary opacity-5 rotate-12" />
                        <h3 className="text-2xl font-bold uppercase tracking-tight text-foreground relative z-10">
                            {editingClass ? "Edit Class" : "Add New Class"}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-2 relative z-10 italic">Configure class details and capacity</p>
                    </div>
                    <div className="p-6">
                        <ClassForm
                            initialData={editingClass}
                            teachers={teachers}
                            onSuccess={() => setIsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

