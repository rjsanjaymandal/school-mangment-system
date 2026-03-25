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
        if (!confirm("Are you sure you want to terminate this formation node?")) return;
        const res = await deleteClass(id);
        if (res.success) {
            toast.success("Formation node terminated successfully");
            router.refresh();
            setData(data.filter(c => c.id !== id));
        } else {
            toast.error(res.error || "Failed to terminate formation");
        }
    };

    const totalCapacity = data.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const uniqueRooms = new Set(data.map(c => c.room_number).filter(Boolean)).size;

    return (
        <div className="space-y-8">
            {isAdminOrTeacher && (
                <div className="flex justify-end items-center gap-x-4">
                    <Button
                        onClick={onAdd}
                        className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[180px] uppercase tracking-widest text-[10px] py-6 shadow-2xl transition-all hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Initialize Formation
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative overflow-hidden group shadow-2xl">
                    <School className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Active Formations</p>
                    <h3 className="text-3xl font-black text-primary">{data.length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative overflow-hidden group shadow-2xl">
                    <Users className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Total Capacity</p>
                    <h3 className="text-3xl font-black text-foreground">{totalCapacity}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative overflow-hidden group shadow-2xl">
                    <DoorOpen className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Allocated Rooms</p>
                    <h3 className="text-3xl font-black text-foreground">{uniqueRooms}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative overflow-hidden group shadow-2xl">
                    <Building2 className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Registry Status</p>
                    <h3 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Verified</h3>
                </Card>
            </div>

            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-primary/5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-x-2">
                        <Hash className="h-4 w-4" />
                        Formation Ledger
                    </h3>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                        <Input
                            placeholder="SEARCH FORMATIONS..."
                            className="pl-9 rounded-sm border-border bg-card/40 backdrop-blur-md h-10 text-[10px] uppercase font-black tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                <TableHead className="p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">Formation Alias</TableHead>
                                <TableHead className="p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">Occupancy Cap</TableHead>
                                <TableHead className="p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">Spatial ID (Room)</TableHead>
                                {isAdminOrTeacher && <TableHead className="text-right p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">Operations</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border/30">
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-32 text-center text-foreground/40 font-black uppercase tracking-widest text-xs"
                                    >
                                        No formation nodes matched the search signature.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((cls) => (
                                    <TableRow
                                        key={cls.id}
                                        className="hover:bg-primary/5 transition-colors border-border/50 group"
                                    >
                                        <TableCell className="p-5 font-black text-foreground uppercase tracking-tight italic">
                                            {cls.name}
                                        </TableCell>
                                        <TableCell className="p-5">
                                            <div className="flex items-center gap-x-2 font-mono text-[11px] font-black text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-sm w-fit group-hover:emerald-glow transition-all">
                                                <Users className="h-3.5 w-3.5" />
                                                {cls.capacity || "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-5 text-sm font-black text-foreground/60 uppercase tracking-widest">
                                            {cls.room_number || "UNALLOCATED"}
                                        </TableCell>
                                        {isAdminOrTeacher && (
                                            <TableCell className="text-right p-5">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-9 w-9 p-0 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card border-border rounded-sm shadow-2xl p-2 min-w-[160px]">
                                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2 py-1.5">Formation Operations</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => onEdit(cls)}
                                                            className="gap-x-2 cursor-pointer font-black uppercase text-[10px] tracking-widest focus:bg-primary/10 focus:text-primary p-2 mt-1 rounded-sm"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" /> Modify Node
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-border/50 my-1" />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(cls.id)}
                                                            className="gap-x-2 text-red-500 focus:text-red-600 cursor-pointer font-black uppercase text-[10px] tracking-widest focus:bg-red-500/10 p-2 rounded-sm"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Terminate Node
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-xl overflow-hidden ring-1 ring-primary/20 shadow-2xl">
                    <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                        <School className="absolute right-[-20px] top-[-20px] h-32 w-32 opacity-10 rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="font-black text-3xl uppercase tracking-tighter italic">
                                {editingClass ? "Modify Formation Node" : "Initialize Formation"}
                            </DialogTitle>
                            <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-[0.3em] mt-2 bg-white/10 w-fit px-3 py-1 rounded-sm border border-white/20">
                                Institutional Spatial & Capacity Configuration
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="p-2">
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

