"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { addDesignation } from "@/app/actions/hr";
import { toast } from "sonner";

export function AddDesignationModal({ departments, onAdd }: { departments: any[], onAdd?: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [departmentId, setDepartmentId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        const res = await addDesignation(name, departmentId || undefined, code || undefined);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Designation added successfully");
            setOpen(false);
            setName("");
            setCode("");
            setDepartmentId("");
            if (onAdd) onAdd();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5">
                    <Plus className="h-3 w-3" />
                    Desig
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Add Designation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="desig-name">Designation Name <span className="text-destructive">*</span></Label>
                        <Input 
                            id="desig-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="e.g. Senior Teacher" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desig-code">Designation Code</Label>
                        <Input 
                            id="desig-code" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            placeholder="e.g. S-TCH" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desig-dept">Parent Department (Optional)</Label>
                        <Select value={departmentId} onValueChange={setDepartmentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="text-muted-foreground italic">None</SelectItem>
                                {departments.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !name} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Designation
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
