"use client";

import { stopImpersonation } from "@/lib/services/impersonation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { useTransition } from "react";

interface ImpersonationBannerProps {
  targetName: string;
  targetRole: string;
}

export function ImpersonationBanner({
  targetName,
  targetRole,
}: ImpersonationBannerProps) {
  const [isPending, startTransition] = useTransition();

  const handleReturn = () => {
    startTransition(async () => {
      try {
        await stopImpersonation();
      } catch (error) {
        console.error("Failed to stop impersonation:", error);
      }
    });
  };

  return (
    <div className="w-full bg-slate-900 text-white py-2 px-6 flex items-center justify-between sticky top-0 z-[100] border-b border-white/10 animate-in slide-in-from-top duration-500 shadow-2xl">
      <div className="flex items-center gap-x-4">
        <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center animate-pulse">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-none italic">
            Shadow Mode Active
          </p>
          <div className="flex items-center gap-x-2 mt-0.5">
            <span className="text-sm font-bold tracking-tight">
              {targetName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black uppercase border border-white/10 text-white/80">
              {targetRole}
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleReturn}
        disabled={isPending}
        variant="ghost"
        className="h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin mr-2" />
        ) : (
          <LogOut className="h-3 w-3 mr-2 text-white/60" />
        )}
        {isPending ? "Ending Session..." : "End Session"}
      </Button>
    </div>
  );
}
