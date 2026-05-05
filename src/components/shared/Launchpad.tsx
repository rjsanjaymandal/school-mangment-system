"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Settings,
  MessageSquare,
  Bus,
  Library,
  Package,
  Calendar,
  Award,
  ShieldCheck,
  Heart,
  Stethoscope,
  Trophy,
  Globe,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
  IndianRupee,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  description?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[];
}

const navigation: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Home", href: "/", icon: LayoutDashboard, description: "Main dashboard" },
    ],
  },
  {
    group: "Students",
    items: [
      { name: "Students", href: "/students", icon: GraduationCap, description: "Manage student profiles" },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck, description: "Track daily attendance" },
      { name: "Conduct", href: "/conduct", icon: ShieldCheck, description: "Student behavior records" },
      { name: "Health", href: "/health", icon: Stethoscope, description: "Health profiles & medical" },
    ],
  },
  {
    group: "Staff",
    items: [
      { name: "Teachers", href: "/teachers", icon: UserSquare2, roles: ["admin"], description: "Staff directory" },
      { name: "HR", href: "/hr", icon: Users, roles: ["admin"], description: "Human resources" },
    ],
  },
  {
    group: "Academics",
    items: [
      { name: "Classes", href: "/classes", icon: Users, roles: ["admin", "teacher"], description: "Class sections" },
      { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"], description: "Curriculum" },
      { name: "Exams", href: "/exams", icon: FileText, description: "Exam schedules" },
      { name: "Gradebook", href: "/gradebook", icon: ClipboardCheck, description: "Student marks" },
      { name: "Timetable", href: "/timetable", icon: Calendar, description: "School schedule" },
      { name: "Certificates", href: "/certificates", icon: Award, description: "Generate certificates" },
    ],
  },
  {
    group: "Finance",
    items: [
      { name: "Fee Collection", href: "/finance/dashboard", icon: IndianRupee, description: "Manage fees & payments" },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Library", href: "/library", icon: Library, description: "Books & issues" },
      { name: "Transport", href: "/transport", icon: Bus, description: "Bus routes" },
      { name: "Messages", href: "/messages", icon: MessageSquare, description: "Announcements" },
    ],
  },
  {
    group: "Reports",
    roles: ["admin", "teacher"],
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3, description: "Performance analytics" },
      { name: "Reports", href: "/reports", icon: FileBarChart, roles: ["admin"], description: "Generate reports" },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Users", href: "/users", icon: UserCheck, description: "User accounts" },
      { name: "Settings", href: "/settings", icon: Settings, description: "School configuration" },
      { name: "Audit Logs", href: "/audit", icon: History, description: "System activity" },
    ],
  },
];

export function Launchpad({ 
  userRole = "admin", 
  searchQuery = "" 
}: { 
  userRole?: string, 
  searchQuery?: string 
}) {
  const filteredNavigation = navigation
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => 
          (!item.roles || item.roles.includes(userRole)) &&
          ((item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
           (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (filteredNavigation.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-6 rounded-md border border-slate-200 mb-4">
          <LayoutDashboard className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No modules found</h3>
        <p className="text-sm text-slate-500">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {filteredNavigation.map((group) => (
        <div key={group.group} className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase">
              {group.group}
            </h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col p-4 bg-white border border-slate-200 rounded-md hover:border-emerald-500 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium text-slate-900 text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}