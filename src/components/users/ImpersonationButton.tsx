"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startImpersonation } from "@/lib/services/impersonation";

interface ImpersonationButtonProps {
    userId: string;
    userName: string;
}

export function ImpersonationButton({ userId, userName }: ImpersonationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleImpersonate = async () => {
        setIsLoading(true);
        try {
            await startImpersonation(userId);
            toast.success(`Shadowing ${userName}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to start shadow session");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleImpersonate}
            disabled={isLoading}
            className="h-8 gap-x-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <Eye className="h-3.5 w-3.5" />
            )}
            {isLoading ? "Joining..." : "Shadow"}
        </Button>
    );
}
