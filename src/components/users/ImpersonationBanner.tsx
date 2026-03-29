"use client";

import { useState } from "react";
import { Ghost, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { stopImpersonation } from "@/app/(dashboard)/users/actions";

export function ImpersonationBanner() {
  const [isStopping, setIsStopping] = useState(false);

  async function handleExit() {
    setIsStopping(true);
    try {
      const result = await stopImpersonation();
      if (result.success) {
        toast.info("Shadow session ended. Returning to Admin view.");
        // Redirect home to regain admin context
        window.location.href = "/";
      }
    } catch (error: any) {
      toast.error("Failed to exit shadow session");
    } finally {
      setIsStopping(false);
    }
  }

  return (
    <div className="w-full bg-primary py-2 px-4 flex items-center justify-between border-b border-white/20 animate-in slide-in-from-top-full duration-500 z-[100] gap-x-4 shadow-xl">
      <div className="flex items-center gap-x-3">
        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
            <Ghost className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-tighter text-white leading-none italic">
                SHADOW MODE ACTIVE
            </p>
            <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-0.5">
                You are currently viewing the system as another user.
            </p>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleExit}
        disabled={isStopping}
        className="rounded-full bg-black/20 hover:bg-black/40 text-white font-black text-[9px] uppercase tracking-widest px-6 h-8 border border-white/10 transition-all hover:scale-105 active:scale-95"
      >
        {isStopping ? (
          <Loader2 className="h-3 w-3 animate-spin mr-2" />
        ) : (
          <X className="h-3.5 w-3.5 mr-2" />
        )}
        Exit session
      </Button>
    </div>
  );
}
