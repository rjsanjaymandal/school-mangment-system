"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { addDepartment } from "@/app/actions/hr";
import { toast } from "sonner";

export function AddDepartmentModal({ onAdd }: { onAdd?: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        const res = await addDepartment(name, code || undefined);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Department added successfully");
            setOpen(false);
            setName("");
            setCode("");
            if (onAdd) onAdd();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5">
                    <Plus className="h-3 w-3" />
                    Dept
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Add Department</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="dept-name">Department Name <span className="text-destructive">*</span></Label>
                        <Input 
                            id="dept-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="e.g. Science" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dept-code">Department Code</Label>
                        <Input 
                            id="dept-code" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            placeholder="e.g. SCI" 
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !name} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Department
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
