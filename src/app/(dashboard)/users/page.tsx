import { UserManagement } from "@/components/admin/UserManagement";
import { Shield } from "lucide-react";

export default function IdentityManagementPage() {
  return (
    <div className="p-8 space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Identity & Access
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Centralized RBAC Management & Strategic Identity Governance
          </p>
        </div>
        <div className="flex items-center gap-x-3 bg-white/50 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20">
          <Shield className="h-6 w-6 text-slate-900" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              System Status
            </span>
            <span className="text-xs font-bold text-green-500 tracking-tighter">
              SECURE CLOUD SYNC
            </span>
          </div>
        </div>
      </div>

      <UserManagement />
    </div>
  );
}
