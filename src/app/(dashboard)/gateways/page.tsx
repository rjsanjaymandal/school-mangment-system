import { createClient } from "@/lib/supabase/server";
import {
  Globe,
  CreditCard,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Activity,
  Cloud,
  Key,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default async function GatewayHub() {
  const supabase = await createClient();
  const { data: gateways } = await supabase
    .from("payment_gateways")
    .select("*")
    .order("name", { ascending: true });

  const gatewayCount = gateways?.length || 0;
  const activeCount = gateways?.filter(g => g.is_active).length || 0;
  const financialGateways = gateways?.filter((gateway) => gateway.provider === "financial") || [];
  const academicGateways = gateways?.filter((gateway) => gateway.provider !== "financial") || [];
  const activeFinancialCount = financialGateways.filter((gateway) => gateway.is_active).length;
  const activeAcademicCount = academicGateways.filter((gateway) => gateway.is_active).length;
  const gatewayHealth = gatewayCount === 0
    ? "Offline"
    : activeCount === gatewayCount
      ? "Optimal"
      : activeCount > 0
        ? "Stable"
        : "Attention";
  const operationalRate = gatewayCount > 0 ? Math.round((activeCount / gatewayCount) * 100) : 0;
  const financialTransit = financialGateways.length > 0 ? Math.round((activeFinancialCount / financialGateways.length) * 100) : 0;
  const academicTransit = academicGateways.length > 0 ? Math.round((activeAcademicCount / academicGateways.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 text-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4 text-foreground">
          <div className="h-14 w-14 rounded-2xl bg-primary border border-white/10 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Globe className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase italic leading-none">
              Ecosystem <span className="text-primary tracking-normal not-italic">/</span> Hub
            </h2>
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-4 flex items-center gap-x-3">
              <RefreshCw className="h-3 w-3 text-primary animate-spin-slow" />
              Institutional Connectivity & Financial Synchronisation
            </p>
          </div>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-xl border-border bg-card font-black gap-x-2 uppercase tracking-widest text-[10px] h-12 px-6"
          >
            <Key className="h-4 w-4" />
            API Keys
          </Button>
          <Button className="rounded-xl bg-primary text-primary-foreground font-black gap-x-2 px-8 h-12 shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border bg-card p-6 overflow-hidden relative group rounded-xl shadow-sm hover:border-primary/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Activity className="h-24 w-24 text-primary" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">
            Gateway Health
          </p>
          <h3 className="text-3xl font-black mt-2 text-foreground uppercase italic tracking-tighter">{gatewayHealth}</h3>
          <div className="mt-4 flex items-center gap-x-2 text-[10px] font-black text-primary/60 uppercase tracking-widest italic">
            Active footprint: {operationalRate}%
          </div>
        </Card>

        <Card className="border-border bg-card p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
            Configured Gateways
          </p>
          <h3 className="text-3xl font-black mt-2 text-foreground italic tracking-tighter">{gatewayCount.toString().padStart(2, "0")}</h3>
          <div className="mt-4 flex items-center gap-x-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
            Total bridge definitions
          </div>
        </Card>

        <Card className="border-primary/20 bg-primary/5 p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">
            Active Bridges
          </p>
          <h3 className="text-3xl font-black mt-2 text-foreground italic tracking-tighter">{activeCount.toString().padStart(2, '0')}</h3>
          <div className="mt-4 flex items-center gap-x-2 text-[10px] font-black text-primary uppercase tracking-widest italic">
            <Layers className="h-4 w-4" />
            Active Integration Node
          </div>
        </Card>

        <Card className="border-border bg-card p-6 rounded-xl shadow-sm hover:border-primary/40 transition-all">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
            Security Layer
          </p>
          <h3 className="text-3xl font-black mt-2 text-foreground italic tracking-tighter">V3.0</h3>
          <div className="mt-4 flex items-center gap-x-2 text-[10px] font-black text-primary uppercase tracking-widest italic leading-none">
            <ShieldCheck className="h-4 w-4" />
            Encrypted Transit
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Gateway Directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
              <Cloud className="h-4 w-4" />
              External Bridges
            </h3>
          </div>

          <Card className="border-border bg-card overflow-hidden rounded-xl shadow-sm">
            <div className="divide-y divide-border">
              {!gateways || gateways.length === 0 ? (
                <div className="p-20 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">No configured gateways detected in the active registry.</p>
                </div>
              ) : gateways.map((gate) => (
                <div
                  key={gate.id}
                  className="p-8 flex items-center gap-x-8 hover:bg-secondary/20 transition-all group"
                >
                  <div
                    className={cn(
                      "h-16 w-16 rounded-xl flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground shadow-sm",
                      gate.is_active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    {gate.provider === "financial" ? (
                      <CreditCard className="h-8 w-8" />
                    ) : (
                      <Layers className="h-8 w-8" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-3 mb-1">
                      <h4 className="font-black text-foreground text-xl italic tracking-tight">
                        {gate.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-x-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                      <span className="flex items-center gap-x-2">
                        <Activity className="h-3 w-3 text-primary" />
                        Provider: {gate.provider}
                      </span>
                      <span className="flex items-center gap-x-2">
                        <Lock className="h-3 w-3 text-primary" />
                        TLS 1.3
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-x-6">
                    <Badge
                      className={cn(
                        "text-[9px] font-black border-none rounded-lg tracking-widest uppercase px-4 py-1.5 italic",
                        gate.is_active
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {gate.is_active ? "OPERATIONAL" : "INACTIVE"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground/40 hover:text-primary rounded-xl transition-all"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <CardFooter className="bg-secondary/10 p-5 flex justify-center border-t border-border">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] italic">
                Institutional Hub for Cross-Platform Integrity
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Sync Controls */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">
            Ecosystem Orchestration
          </h3>

          <Card className="border-primary/20 bg-primary/5 p-10 relative overflow-hidden group rounded-xl shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <RefreshCw className="h-32 w-32 text-primary" />
            </div>
            <h4 className="text-2xl font-black tracking-tight mb-4 uppercase italic leading-none">
              Omni-Sync Oracle
            </h4>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-loose italic">
              Automated synchronization with all connected LMS and Financial
              platforms. Refreshes the status of every configured bridge in one pass.
            </p>
            <Button className="mt-10 w-full bg-primary text-primary-foreground font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/30 h-16 uppercase tracking-[0.2em] text-[10px]">
              MIGRATE RECORDS NOW
            </Button>
          </Card>

          <Card className="border-border bg-card p-8 rounded-xl shadow-sm">
            <CardHeader className="p-0 mb-6 flex items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                Gateway Traffic
              </CardTitle>
              <Zap className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <div className="space-y-8 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                  <span className="text-muted-foreground">Financial Transit</span>
                  <span className="text-primary">{financialTransit}%</span>
                </div>
                <Progress
                  value={financialTransit}
                  className="h-2 rounded-full bg-secondary"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                  <span className="text-muted-foreground">LMS Data Stream</span>
                  <span className="text-primary">{academicTransit}%</span>
                </div>
                <Progress
                  value={academicTransit}
                  className="h-2 rounded-full bg-secondary"
                />
              </div>
            </div>
          </Card>

          <Card className="border-primary bg-primary text-primary-foreground p-10 relative group overflow-hidden rounded-xl shadow-lg shadow-primary/20">
            <div className="relative z-10 space-y-6">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-sm transition-all group-hover:scale-110">
                <ArrowRight className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-black text-2xl italic tracking-tight uppercase leading-none">Connect New Bridge</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mt-4 italic">
                  Extend your ecosystem with the **Edu Maysan SDK**.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-14 border-white/20 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:text-primary transition-all shadow-md"
              >
                OPEN SDK DOCUMENTATION
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

