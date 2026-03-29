"use client";

import { useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startImpersonation } from "@/app/(dashboard)/users/actions";

export function ImpersonationButton({ userId, userName }: { userId: string, userName: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleImpersonate() {
    setIsLoading(true);
    try {
      const result = await startImpersonation(userId);
      if (result.success) {
        toast.success(`Now viewing as ${userName}`);
        // Redirect to dashboard to see the impersonated view
        window.location.href = "/";
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("Failed to start impersonation");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-sm font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all gap-x-2"
      onClick={handleImpersonate}
      disabled={isLoading}
      title={`Login as ${userName}`}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <UserCheck className="h-3 w-3" />
      )}
      SHADOW VIEW
    </Button>
  );
}
