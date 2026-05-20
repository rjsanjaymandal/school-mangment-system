"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { addStop, updateStop, deleteStop } from "@/app/actions/transport";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StopManagementProps {
    routeId: string;
    routeName: string;
    stops: any[];
}

export function StopManagement({ routeId, routeName, stops }: StopManagementProps) {
    const router = useRouter();
    const [isAddStopOpen, setIsAddStopOpen] = useState(false);
    const [isEditStopOpen, setIsEditStopOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingStop, setEditingStop] = useState<any>(null);
    const [stopForm, setStopForm] = useState({
        name: "",
        pickup_time: "07:00",
        drop_time: "15:00",
        stop_order: "0",
    });

    const handleAddStop = async () => {
        if (!stopForm.name) return toast.error("Stop name is required");
        setLoading(true);
        const result = await addStop({
            route_id: routeId,
            name: stopForm.name,
            pickup_time: stopForm.pickup_time,
            drop_time: stopForm.drop_time,
            stop_order: parseInt(stopForm.stop_order) || 0,
        });
        setLoading(false);
        if (result.success) {
            setIsAddStopOpen(false);
            setStopForm({ name: "", pickup_time: "07:00", drop_time: "15:00", stop_order: "0" });
            router.refresh();
            toast.success("Stop added successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleUpdateStop = async () => {
        if (!editingStop) return;
        setLoading(true);
        const result = await updateStop(editingStop.id, {
            name: stopForm.name,
            pickup_time: stopForm.pickup_time,
            drop_time: stopForm.drop_time,
            stop_order: parseInt(stopForm.stop_order) || 0,
        });
        setLoading(false);
        if (result.success) {
            setIsEditStopOpen(false);
            setEditingStop(null);
            router.refresh();
            toast.success("Stop updated successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleDeleteStop = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stop?")) return;
        setLoading(true);
        const result = await deleteStop(id);
        setLoading(false);
        if (result.success) {
            router.refresh();
            toast.success("Stop deleted successfully");
        } else {
            toast.error(result.error);
        }
    };

    const openEdit = (stop: any) => {
        setEditingStop(stop);
        setStopForm({
            name: stop.name,
            pickup_time: stop.pickup_time || "07:00",
            drop_time: stop.drop_time || "15:00",
            stop_order: stop.stop_order?.toString() || "0",
        });
        setIsEditStopOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground tracking-tight">
                            Route Stops
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Sequence of pickup and drop points</p>
                    </div>
                </div>
                <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-md font-bold uppercase tracking-wider text-[10px] border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                            <Plus className="h-3.5 w-3.5 mr-2" /> Add Stop
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-primary/5 border-b border-border p-8">
                            <DialogHeader>
                                <DialogTitle className="font-bold text-xl tracking-tight text-foreground text-center">Add New Stop</DialogTitle>
                                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mt-1 text-center flex items-center justify-center gap-2">
                                    <MapPin className="h-3 w-3" /> Define a new service location
                                </p>
                            </DialogHeader>
                        </div>
                        <div className="p-8 space-y-5 bg-card">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Stop Name</Label>
                                <Input 
                                    value={stopForm.name} 
                                    onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} 
                                    placeholder="e.g. Central Station" 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Pickup Time</Label>
                                    <Input 
                                        type="time" 
                                        value={stopForm.pickup_time} 
                                        onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} 
                                        className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Drop Time</Label>
                                    <Input 
                                        type="time" 
                                        value={stopForm.drop_time} 
                                        onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} 
                                        className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Stop Order</Label>
                                <Input 
                                    type="number" 
                                    value={stopForm.stop_order} 
                                    onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                            <Button 
                                onClick={handleAddStop} 
                                disabled={loading} 
                                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-wider transition-all text-xs mt-4"
                            >
                                {loading ? "Adding..." : "Add Stop"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {stops.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider italic border border-dashed border-border rounded-lg">
                        [No stops defined]
                    </div>
                ) : (
                    stops.map((stop, idx) => (
                        <div key={stop.id} className="group relative flex items-center justify-between p-4 bg-muted/20 border border-transparent rounded-md hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <span className="text-xl font-bold tracking-tight">{idx + 1}</span>
                            </div>
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">{stop.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                IN: {stop.pickup_time || "00:00"}
                                            </span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-muted" />
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                OUT: {stop.drop_time || "00:00"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(stop)} className="h-8 w-8 text-muted-foreground/30 hover:text-primary hover:bg-primary/10 transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStop(stop.id)} className="h-8 w-8 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isEditStopOpen} onOpenChange={setIsEditStopOpen}>
                <DialogContent className="max-w-md p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-primary/5 border-b border-border p-8">
                        <DialogHeader>
                            <DialogTitle className="font-bold text-xl tracking-tight text-foreground text-center">Edit Stop</DialogTitle>
                            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mt-1 text-center flex items-center justify-center gap-2">
                                <Edit2 className="h-3 w-3" /> Update stop information
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-5 bg-card">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Stop Name</Label>
                            <Input 
                                value={stopForm.name} 
                                onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} 
                                className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Pickup Time</Label>
                                <Input 
                                    type="time" 
                                    value={stopForm.pickup_time} 
                                    onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Drop Time</Label>
                                <Input 
                                    type="time" 
                                    value={stopForm.drop_time} 
                                    onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} 
                                    className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Stop Order</Label>
                            <Input 
                                type="number" 
                                value={stopForm.stop_order} 
                                onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} 
                                className="rounded-md border-border bg-muted/20 focus:border-primary transition-all h-10 font-medium"
                            />
                        </div>
                        <Button 
                            onClick={handleUpdateStop} 
                            disabled={loading} 
                            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-wider transition-all text-xs mt-4"
                        >
                            {loading ? "Updating..." : "Update Stop"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

    );
}

