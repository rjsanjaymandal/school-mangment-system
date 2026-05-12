"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    MoreHorizontal, Trash2, UserCheck, UserX, 
    Mail, Download, Upload, ArrowRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
    DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface BulkActionsProps {
    selectedIds: string[];
    onClearSelection: () => void;
    onRefresh: () => void;
}

export function BulkActions({ selectedIds, onClearSelection, onRefresh }: BulkActionsProps) {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleBulkStatusChange = async (status: string) => {
        if (selectedIds.length === 0) return;
        
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("students")
                .update({ status })
                .in("id", selectedIds);

            if (error) throw error;

            toast.success(`Updated ${selectedIds.length} students to ${status}`);
            onClearSelection();
            onRefresh();
        } catch (error) {
            toast.error("Failed to update students");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} students?`)) return;
        
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("students")
                .delete()
                .in("id", selectedIds);

            if (error) throw error;

            toast.success(`Deleted ${selectedIds.length} students`);
            onClearSelection();
            onRefresh();
        } catch (error) {
            toast.error("Failed to delete students");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        toast.info(`Exporting ${selectedIds.length} students to CSV...`);
        // Export logic would go here
    };

    if (selectedIds.length === 0) return null;

    return (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-sm font-medium text-emerald-700">
                {selectedIds.length} selected
            </span>
            
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                            <UserCheck className="h-4 w-4" />
                            Change Status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("active")}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("inactive")}>
                            <UserX className="h-4 w-4 mr-2" />
                            Set Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("transferred")}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Mark Transferred
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusChange("graduated")}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Mark Graduated
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" className="h-8 gap-2" onClick={handleExportCSV}>
                    <Download className="h-4 w-4" />
                    Export
                </Button>

                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-red-600 hover:text-red-700"
                    onClick={handleBulkDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={onClearSelection}>
                Clear
            </Button>
        </div>
    );
}