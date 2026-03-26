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
}

export function ClassList({ initialData, userRole }: ClassListProps) {
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
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <Input
                        placeholder="Search classes..."
                        className="pl-12 bg-white/5 border-white/10 h-14 font-black text-[10px] uppercase tracking-[0.2em] italic placeholder:text-foreground/20 focus-visible:ring-emerald-500/50 skew-x-[-8deg]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isAdminOrTeacher && (
                    <Button
                        onClick={onAdd}
                        className="h-14 px-10 bg-emerald-500 text-white font-black rounded-sm shadow-[0_0_40px_oklch(var(--emerald-500)/0.2)] emerald-border-glow uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg] transition-all hover:scale-105"
                    >
                        <span className="not-skew-x flex items-center gap-x-3">
                            Add New Class
                            <Plus className="h-4 w-4" />
                        </span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="glass-card p-8 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700">
                    <School className="absolute right-[-10px] bottom-[-10px] h-20 w-20 text-emerald-500 opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 italic">Total Classes</p>
                    <h3 className="text-5xl font-black italic tracking-tighter text-foreground group-hover:text-emerald-500 transition-colors">{data.length}</h3>
                    <div className="h-1 w-full bg-white/5 mt-6"><div className="h-full bg-emerald-500 w-[65%]" /></div>
                </div>
                <div className="glass-card p-8 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700">
                    <Users className="absolute right-[-10px] bottom-[-10px] h-20 w-20 text-emerald-500 opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 italic">Total Capacity</p>
                    <h3 className="text-5xl font-black italic tracking-tighter text-foreground group-hover:text-emerald-500 transition-colors">{totalCapacity}</h3>
                    <div className="h-1 w-full bg-white/5 mt-6"><div className="h-full bg-emerald-500 w-[45%]" /></div>
                </div>
                <div className="glass-card p-8 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700">
                    <DoorOpen className="absolute right-[-10px] bottom-[-10px] h-20 w-20 text-emerald-500 opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 italic">Allocated Rooms</p>
                    <h3 className="text-5xl font-black italic tracking-tighter text-foreground group-hover:text-emerald-500 transition-colors">{uniqueRooms}</h3>
                    <div className="h-1 w-full bg-white/5 mt-6"><div className="h-full bg-emerald-500 w-[82%]" /></div>
                </div>
                <div className="glass-card p-8 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700">
                    <Building2 className="absolute right-[-10px] bottom-[-10px] h-20 w-20 text-emerald-500 opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 italic">System Status</p>
                    <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase group-hover:text-emerald-500 transition-all transition-colors leading-none mt-2">Verified</h3>
                    <div className="h-1 w-full bg-white/5 mt-6"><div className="h-full bg-emerald-500 w-full shadow-[0_0_10px_oklch(var(--emerald-500))]" /></div>
                </div>
            </div>

            <div className="glass-panel p-2 rounded-sm border border-white/10 overflow-hidden shadow-2xl shadow-emerald-500/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Class Name</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Capacity</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Room No.</th>
                            {isAdminOrTeacher && <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium tracking-tight">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={isAdminOrTeacher ? 4 : 3} className="h-64 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 italic">No classes matched the search criteria.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((cls) => (
                                <tr key={cls.id} className="group hover:bg-white/5 transition-all duration-500">
                                    <td className="px-10 py-8 font-black text-foreground uppercase italic tracking-tight text-sm group-hover:text-emerald-500 transition-colors">
                                        {cls.name}
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-x-4 font-black text-foreground text-sm italic tracking-tighter group-hover:scale-105 origin-left transition-transform">
                                            <Users className="h-4 w-4 text-emerald-500" />
                                            {cls.capacity || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">
                                        {cls.room_number || "UNALLOCATED"}
                                    </td>
                                    {isAdminOrTeacher && (
                                        <td className="px-10 py-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 text-foreground/40 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-none skew-x-[-12deg]">
                                                        <MoreHorizontal className="h-4 w-4 not-skew-x" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-panel border-white/10 p-2 min-w-[200px]">
                                                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-40 px-3 py-2">Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit(cls)}
                                                        className="gap-x-3 cursor-pointer font-black uppercase text-[10px] tracking-widest focus:bg-emerald-500 focus:text-white p-3 rounded-none italic transition-all"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" /> Edit Class
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(cls.id)}
                                                        className="gap-x-3 text-red-500 focus:text-white focus:bg-red-500 cursor-pointer font-black uppercase text-[10px] tracking-widest p-3 rounded-none italic transition-all"
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
                <DialogContent className="glass-panel border-white/10 p-0 overflow-hidden max-w-xl">
                    <div className="p-8 bg-white/5 border-b border-white/10 relative overflow-hidden">
                        <School className="absolute right-[-20px] top-[-20px] h-32 w-32 text-emerald-500 opacity-5 rotate-12" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground relative z-10">
                            {editingClass ? "Edit Class" : "Add New Class"}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 mt-2 relative z-10">Configure class details and capacity</p>
                    </div>
                    <div className="p-4">
                        <ClassForm
                            initialData={editingClass}
                            onSuccess={() => setIsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

