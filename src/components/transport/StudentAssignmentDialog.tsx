"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { assignStudentTransport } from "@/app/actions/transport";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentAssignmentDialogProps {
    routes: any[];
    stops: any[];
}

export function StudentAssignmentDialog({ routes, stops }: StudentAssignmentDialogProps) {
    const router = useRouter();
    const supabase = createClient();
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);

    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [selectedStopId, setSelectedStopId] = useState("");

    const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchStudents();
        }
    }, [open]);

    const fetchStudents = async () => {
        setFetchingStudents(true);
        const { data, error } = await supabase
            .from("students")
            .select("id, profile:profiles(first_name, last_name)")
            .order("id");

        if (error) {
            toast.error("Failed to fetch students");
        } else {
            setStudents(data || []);
        }
        setFetchingStudents(false);
    };

    const handleAssign = async () => {
        if (!selectedStudentId || !selectedRouteId) {
            return toast.error("Please select a student and a route");
        }

        setLoading(true);
        const result = await assignStudentTransport({
            student_id: selectedStudentId,
            route_id: selectedRouteId,
            stop_id: selectedStopId || undefined,
        });
        setLoading(false);

        if (result.success) {
            setOpen(false);
            setSelectedStudentId("");
            setSelectedRouteId("");
            setSelectedStopId("");
            router.refresh();
            toast.success("Student assigned successfully");
        } else {
            toast.error(result.error);
        }
    };

    const filteredStops = stops.filter(s => s.route_id === selectedRouteId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow uppercase tracking-widest text-[10px] min-w-[160px] shadow-xl">
                    <UserPlus className="h-4 w-4" /> Assign Student
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-md overflow-hidden ring-1 ring-primary/20">
                <div className="bg-primary p-8 text-primary-foreground">
                    <DialogHeader>
                        <DialogTitle className="font-black text-2xl uppercase tracking-tighter">Provision Transit Node</DialogTitle>
                        <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Student Logistics Assignment</p>
                    </DialogHeader>
                </div>
                <div className="space-y-6 pt-4">
                    {/* Student Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Select Student</Label>
                        <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={studentPopoverOpen}
                                    className="w-full justify-between rounded-sm bg-background/50 border-border font-bold uppercase tracking-tight text-xs"
                                    disabled={fetchingStudents}
                                >
                                    {selectedStudentId
                                        ? `${students.find((s) => s.id === selectedStudentId)?.profile?.first_name} ${students.find((s) => s.id === selectedStudentId)?.profile?.last_name}`
                                        : fetchingStudents ? "Loading..." : "Search student..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                             <PopoverContent className="w-full p-0 bg-card border border-border shadow-2xl rounded-sm">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="Search student..." className="h-10 border-none focus:ring-0 font-bold" />
                                    <CommandList className="scrollbar-thin scrollbar-thumb-primary/20">
                                        <CommandEmpty className="py-4 text-center text-[10px] font-black text-foreground/30 uppercase tracking-widest">No student found.</CommandEmpty>
                                        <CommandGroup>
                                            {students.map((student) => (
                                                <CommandItem
                                                    key={student.id}
                                                    value={`${student.profile?.first_name} ${student.profile?.last_name} ${student.id}`}
                                                    className="py-3 px-4 aria-selected:bg-primary/10 aria-selected:text-primary transition-colors cursor-pointer"
                                                    onSelect={() => {
                                                        setSelectedStudentId(student.id);
                                                        setStudentPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-3 h-4 w-4",
                                                            selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <span className="font-black uppercase tracking-tight text-[11px]">{student.profile?.first_name} {student.profile?.last_name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Logistics Channel</Label>
                        <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                            <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold">
                                <SelectValue placeholder="Select a route" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-sm">
                                {routes.map((route) => (
                                    <SelectItem key={route.id} value={route.id} className="font-black uppercase tracking-tight text-[11px]">
                                        {route.name} ({route.route_number || "No #"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stop Selection */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Select Stop (Optional)</Label>
                        <Select value={selectedStopId} onValueChange={setSelectedStopId} disabled={!selectedRouteId}>
                            <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold">
                                <SelectValue placeholder={selectedRouteId ? "Select a stop" : "Choose route first"} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-sm">
                                {filteredStops.length === 0 ? (
                                    <div className="py-4 px-4 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center">No stops for this route</div>
                                ) : (
                                    filteredStops.map((stop) => (
                                        <SelectItem key={stop.id} value={stop.id} className="font-black uppercase tracking-tight text-[11px]">
                                            {stop.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedStudentId || !selectedRouteId}
                        className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl emerald-glow text-xs mt-4"
                    >
                        {loading ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

