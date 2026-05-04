"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
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
  Package,
  Calendar,
  IndianRupee,
  Truck,
  Award,
  ShieldCheck,
  Heart,
  Shield,
  Stethoscope,
  Trophy,
  Globe,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserService } from "@/lib/services/user";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  subItems?: { name: string; href: string }[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[];
}

const navigation: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        roles: ["admin", "teacher"],
      },
      {
        name: "Reports",
        href: "/reports",
        icon: FileBarChart,
        roles: ["admin"],
      },
    ],
  },
  {
    group: "Staff & Students",
    roles: ["admin", "teacher", "student"],
    items: [
      { 
        name: "Students", 
        href: "/students", 
        icon: GraduationCap,
        subItems: [
          { name: "Enroll New", href: "/students/enroll" },
          { name: "Student List", href: "/students/list" },
          { name: "Documents", href: "/students/documents" },
          { name: "Attendance", href: "/students/attendance" },
        ]
      },
      { 
        name: "HR", 
        href: "/hr", 
        icon: UserSquare2, 
        roles: ["admin"],
        subItems: [
          { name: "Staff Directory", href: "/hr/directory" },
          { name: "Add Staff", href: "/hr/add-staff" },
        ]
      },
      { name: "Conduct", href: "/conduct", icon: UserCheck },
      { name: "Health", href: "/health", icon: Stethoscope },
    ],
  },
  {
    group: "Academics",
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
      { name: "Certificates", href: "/certificates", icon: Award },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Fees", href: "/fees", icon: CreditCard },
      { name: "Library", href: "/library", icon: Library },
      { name: "Transport", href: "/transport", icon: Bus },
    ],
  },
  {
    group: "Admin",
    roles: ["admin"],
    items: [
      { name: "Users", href: "/users", icon: UserCheck },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Logs", href: "/audit", icon: History },
    ],
  },
];

export function Sidebar({ initialProfile }: { initialProfile?: any }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(initialProfile || null);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Students"]);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    if (initialProfile) return;
    let active = true;
    const fetchProfile = async () => {
      const profile = await UserService.getCurrentProfile();
      if (active && profile && !("error" in profile)) {
        setUserProfile(profile);
      }
    };
    void fetchProfile();
    return () => { active = false; };
  }, [initialProfile]);

  const resolvedProfile = initialProfile ?? userProfile;
  const userRole = resolvedProfile?.role || "student";

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
    <div className="flex h-full flex-col bg-white border-r border-slate-200 text-slate-900">
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-emerald-600 text-white p-2 rounded-md">
            <GraduationCap className="h-5 w-5" />
          </div>
        <div>
          <span className="font-semibold text-base">Edu Maysan</span>
          <span className="text-xs text-muted-foreground block">School Management</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredNavigation.map((group) => (
          <div key={group.group}>
            <h3 className="text-xs font-medium text-slate-400 uppercase mb-2 px-2">
              {group.group}
            </h3>
            <div className="space-y-0.5">
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isExpanded = expandedItems.includes(item.name);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isActive = pathname === item.href || (hasSubItems && item.subItems?.some(s => pathname === s.href));

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => hasSubItems && toggleExpand(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium",
                        isActive && !hasSubItems
                          ? "bg-slate-900 text-white" 
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      {hasSubItems && (
                         <ChevronDown className={cn("h-4 w-4", isExpanded ? "rotate-180" : "")} />
                      )}
                    </button>

                    {hasSubItems && isExpanded && (
                      <div className="ml-4 pl-4 border-l border-slate-200 space-y-1 py-1">
                        {item.subItems?.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "block px-3 py-1.5 text-sm rounded-md",
                              pathname === sub.href
                                ? "text-emerald-600 bg-emerald-50 font-medium"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100 border-slate-200 bg-slate-50/50 bg-slate-50/50">
        <Link href="/profile" className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-medium">
              {userProfile?.full_name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userProfile?.full_name || "Loading..."}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </Link>
      </div>
    </div>
  );
}
