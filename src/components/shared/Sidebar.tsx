"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  Users,
  UserSquare2,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  CreditCard,
  Settings,
  MessageSquare,
  Bus,
  Library,
  Zap,
  Package,
  Calendar,
  DollarSign,
  Truck,
  Award,
  ShieldAlert,
  Heart,
  Shield,
  Stethoscope,
  Trophy,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  futuristic?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    group: "Core",
    items: [
      { name: "Command Center", href: "/", icon: LayoutDashboard },
      {
        name: "Neural Insights",
        href: "/analytics",
        icon: Zap,
        futuristic: true,
      },
      {
        name: "Institutional Oracle",
        href: "/oracle",
        icon: BrainCircuit,
        futuristic: true,
      },
    ],
  },
  {
    group: "Personnel",
    items: [
      { name: "Students", href: "/students", icon: GraduationCap },
      { name: "Teachers", href: "/teachers", icon: UserSquare2 },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
      { name: "Conduct Hub", href: "/conduct", icon: ShieldAlert },
      { name: "Health Vault", href: "/health", icon: Stethoscope },
      { name: "Heritage Hub", href: "/heritage", icon: GraduationCap },
    ],
  },
  {
    group: "Academic",
    items: [
      { name: "Classes", href: "/classes", icon: Users },
      { name: "Subjects", href: "/subjects", icon: BookOpen },
      { name: "Gradebook", href: "/gradebook", icon: FileText },
      { name: "Exams", href: "/exams", icon: ClipboardCheck },
      { name: "Timetable", href: "/timetable", icon: Calendar },
      { name: "Certificates", href: "/certificates", icon: Award },
      { name: "Activity Pulse", href: "/activities", icon: Trophy },
    ],
  },
  {
    group: "Enterprise",
    items: [
      { name: "Fees", href: "/fees", icon: CreditCard },
      { name: "Library", href: "/library", icon: Library },
      { name: "Procurement Hub", href: "/inventory", icon: Package },
      { name: "Transport", href: "/transport", icon: Bus },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "Parent Pulse", href: "/guardian", icon: Heart },
    ],
  },
  {
    group: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Security Vault", href: "/audit", icon: Shield },
      { name: "Compliance Vault", href: "/compliance", icon: FileText },
      { name: "Ecosystem Gateways", href: "/gateways", icon: Globe },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white/40 backdrop-blur-md border-r border-white/20 text-slate-800">
      <div className="p-6 pb-2 flex items-center gap-x-3">
        <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg neon-blue">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-slate-900">
            EduSmart
          </span>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-70">
            Enterprise v2.0
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {navigation.map((group) => (
          <div key={group.group} className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-x-3 text-slate-500 text-sm font-medium px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-sm hover:text-slate-900",
                    pathname === item.href &&
                      "bg-white shadow-md text-slate-900 border border-slate-100",
                    item.futuristic &&
                      "border border-blue-100/50 bg-blue-50/10",
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors duration-300",
                      pathname === item.href
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.name}
                  {"futuristic" in item && item.futuristic && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-x-3 p-3 rounded-2xl bg-slate-900 text-white shadow-xl neon-blue ring-1 ring-white/10 group cursor-pointer hover:bg-slate-800 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
            S
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">
              Sanjay (Admin)
            </span>
            <span className="text-[10px] opacity-60 truncate">
              System Controller
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
