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
  roles?: string[]; // Allowed roles for this item
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[]; // Allowed roles for the entire group
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
        roles: ["admin", "teacher"],
      },
      {
        name: "Institutional Oracle",
        href: "/oracle",
        icon: BrainCircuit,
        futuristic: true,
        roles: ["admin"],
      },
    ],
  },
  {
    group: "Personnel",
    roles: ["admin", "teacher"],
    items: [
      { name: "Students", href: "/students", icon: GraduationCap },
      {
        name: "Teachers",
        href: "/teachers",
        icon: UserSquare2,
        roles: ["admin"],
      },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
      { name: "Conduct Hub", href: "/conduct", icon: ShieldAlert },
      { name: "Health Vault", href: "/health", icon: Stethoscope },
      {
        name: "Heritage Hub",
        href: "/heritage",
        icon: GraduationCap,
        roles: ["admin"],
      },
    ],
  },
  {
    group: "Academic",
    roles: ["admin", "teacher", "student"],
    items: [
      {
        name: "Classes",
        href: "/classes",
        icon: Users,
        roles: ["admin", "teacher"],
      },
      {
        name: "Subjects",
        href: "/subjects",
        icon: BookOpen,
        roles: ["admin", "teacher"],
      },
      { name: "Gradebook", href: "/gradebook", icon: FileText },
      { name: "Exams", href: "/exams", icon: ClipboardCheck },
      { name: "Timetable", href: "/timetable", icon: Calendar },
      { name: "Certificates", href: "/certificates", icon: Award },
      {
        name: "Activity Pulse",
        href: "/activities",
        icon: Trophy,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    group: "Enterprise",
    items: [
      { name: "Fees", href: "/fees", icon: CreditCard },
      { name: "Library", href: "/library", icon: Library },
      {
        name: "Procurement Hub",
        href: "/inventory",
        icon: Package,
        roles: ["admin"],
      },
      { name: "Transport", href: "/transport", icon: Bus },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      {
        name: "Parent Pulse",
        href: "/guardian",
        icon: Heart,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Security Vault", href: "/audit", icon: Shield },
      { name: "Compliance Vault", href: "/compliance", icon: FileText },
      { name: "Ecosystem Gateways", href: "/gateways", icon: Globe },
    ],
  },
];

import { useEffect, useState } from "react";
import { UserService } from "@/lib/services/user";

export function Sidebar() {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await UserService.getCurrentProfile();
      if (profile && !("error" in profile)) {
        setUserProfile(profile);
      }
    };
    fetchProfile();
  }, []);

  const userRole = userProfile?.role || "student";

  const filteredNavigation = navigation
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(userRole),
      ),
    }))
    .filter((group) => group.items.length > 0);

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
        {filteredNavigation.map((group) => (
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
            {userProfile?.first_name?.[0] || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">
              {userProfile
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : "Loading..."}
            </span>
            <span className="text-[10px] opacity-60 uppercase tracking-widest truncate">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
