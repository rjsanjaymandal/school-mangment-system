"use client";

import { stopImpersonation } from "@/lib/services/impersonation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { useTransition } from "react";

export function ImpersonationBanner({
  targetName,
  targetRole,
}: {
  targetName: string;
  targetRole: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleReturn = () => {
    startTransition(async () => {
      await stopImpersonation();
    });
  };

  return (
    <div className="bg-red-600 text-white py-2 px-6 flex items-center justify-between shadow-lg sticky top-0 z-50 animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-x-3">
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="text-sm font-medium">
          <span className="opacity-80">You are currently viewing as </span>
          <span className="font-black uppercase tracking-tight">
            {targetName}
          </span>
          <span className="mx-2 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black uppercase">
            {targetRole}
          </span>
        </div>
      </div>

      <Button
        onClick={handleReturn}
        disabled={isPending}
        variant="ghost"
        className="text-white hover:bg-white/10 hover:text-white border-white/20 h-8 rounded-xl font-black text-[10px] uppercase tracking-widest"
      >
        <LogOut className="h-3 w-3 mr-2" />
        {isPending ? "Returning..." : "Return to Admin"}
      </Button>
    </div>
  );
}
