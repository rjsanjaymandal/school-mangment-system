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
                <Button className="rounded-2xl bg-indigo-600 text-white font-bold gap-x-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700">
                    <UserPlus className="h-4 w-4" /> Assign Student
                </Button>
            </DialogTrigger>
            <DialogContent className="glass border-none sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-black text-2xl">Assign Transport</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    {/* Student Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Select Student</Label>
                        <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={studentPopoverOpen}
                                    className="w-full justify-between rounded-xl bg-white/50 border-slate-200"
                                    disabled={fetchingStudents}
                                >
                                    {selectedStudentId
                                        ? `${students.find((s) => s.id === selectedStudentId)?.profile?.first_name} ${students.find((s) => s.id === selectedStudentId)?.profile?.last_name}`
                                        : fetchingStudents ? "Loading..." : "Search student..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 glass border-none shadow-2xl">
                                <Command>
                                    <CommandInput placeholder="Search student..." className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>No student found.</CommandEmpty>
                                        <CommandGroup>
                                            {students.map((student) => (
                                                <CommandItem
                                                    key={student.id}
                                                    value={`${student.profile?.first_name} ${student.profile?.last_name} ${student.id}`}
                                                    onSelect={() => {
                                                        setSelectedStudentId(student.id);
                                                        setStudentPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {student.profile?.first_name} {student.profile?.last_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Route Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Select Route</Label>
                        <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                            <SelectTrigger className="rounded-xl bg-white/50 border-slate-200">
                                <SelectValue placeholder="Select a route" />
                            </SelectTrigger>
                            <SelectContent className="glass border-none">
                                {routes.map((route) => (
                                    <SelectItem key={route.id} value={route.id} className="font-medium">
                                        {route.name} ({route.route_number || "No #"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stop Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-400">Select Stop (Optional)</Label>
                        <Select value={selectedStopId} onValueChange={setSelectedStopId} disabled={!selectedRouteId}>
                            <SelectTrigger className="rounded-xl bg-white/50 border-slate-200">
                                <SelectValue placeholder={selectedRouteId ? "Select a stop" : "Choose route first"} />
                            </SelectTrigger>
                            <SelectContent className="glass border-none">
                                {filteredStops.length === 0 ? (
                                    <div className="py-2 px-4 text-xs font-medium text-slate-400">No stops for this route</div>
                                ) : (
                                    filteredStops.map((stop) => (
                                        <SelectItem key={stop.id} value={stop.id} className="font-medium">
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
                        className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold shadow-xl hover:scale-[1.02] transition-transform"
                    >
                        {loading ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
