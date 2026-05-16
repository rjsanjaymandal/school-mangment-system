"use client";

import * as React from "react";
import { 
  Calendar, 
  CreditCard, 
  Search, 
  Settings, 
  User, 
  Users,
  GraduationCap,
  Library,
  Bus,
  Clock,
  FileText,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, [router]);

  return (
    <>
      {/* Navbar Trigger Button */}
      <Button
        variant="outline"
        className="h-9 w-56 justify-between text-muted-foreground border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-slate-50/50 hidden md:flex"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Search School...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white border border-slate-200 px-1.5 font-mono text-[10px] font-medium text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Unified Command Palette */}
      <CommandDialog 
        open={open} 
        onOpenChange={setOpen} 
        title="School Command Center" 
        description="Search students, staff, or take quick actions."
        showCloseButton={false}
      >
        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
          <CommandInput placeholder="Search students, staff, or actions..." className="border-none focus:ring-0" />
        </div>
        <CommandList className="p-2 max-h-[450px]">
          <CommandEmpty className="py-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-8 w-8 text-slate-200" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching records</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="INSTITUTIONAL LOGS">
            <SearchItem 
              icon={Clock} 
              title="Daily Log" 
              subtitle="View real-time school activity and events" 
              color="amber"
              onSelect={() => runCommand(() => {
                const el = document.getElementById('daily-log-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else router.push("/"); // If not on home, go home first
              })}
            />
            <SearchItem 
              icon={FileText} 
              title="Academic Reports" 
              subtitle="Generate and download student report cards" 
              color="blue"
              onSelect={() => runCommand(() => router.push("/reports"))}
            />
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="PEOPLE DIRECTORY">
            <SearchItem 
              icon={Users} 
              title="Student Directory" 
              subtitle="Browse all enrolled students and profiles" 
              color="emerald"
              onSelect={() => runCommand(() => router.push("/students"))}
            />
            <SearchItem 
              icon={User} 
              title="Staff Directory" 
              subtitle="View and manage teachers and administrators" 
              color="indigo"
              onSelect={() => runCommand(() => router.push("/teachers"))}
            />
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="QUICK ACTIONS">
            <SearchItem 
              icon={Calendar} 
              title="Mark Attendance" 
              subtitle="Record daily presence for any class" 
              color="rose"
              onSelect={() => runCommand(() => router.push("/students/attendance"))}
            />
            <SearchItem 
              icon={CreditCard} 
              title="Collect Fees" 
              subtitle="Process new student fee payments" 
              color="emerald"
              onSelect={() => runCommand(() => router.push("/fees"))}
            />
            <SearchItem 
              icon={Library} 
              title="Library Services" 
              subtitle="Issue books or manage returns" 
              color="purple"
              onSelect={() => runCommand(() => router.push("/library"))}
            />
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="ADMINISTRATION">
            <SearchItem 
              icon={GraduationCap} 
              title="Class Management" 
              subtitle="Organize classes, sections, and subjects" 
              color="blue"
              onSelect={() => runCommand(() => router.push("/academics/classes"))}
            />
            <SearchItem 
              icon={Bus} 
              title="Transport Fleet" 
              subtitle="Manage vehicles, routes, and drivers" 
              color="amber"
              onSelect={() => runCommand(() => router.push("/transport"))}
            />
            <SearchItem 
              icon={Settings} 
              title="School Settings" 
              subtitle="Update institutional info and preferences" 
              color="slate"
              onSelect={() => runCommand(() => router.push("/settings"))}
            />
          </CommandGroup>
        </CommandList>
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex gap-4 text-slate-400">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-slate-900 font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-slate-900 font-mono">↵</kbd> Select</span>
          </div>
          <span className="flex items-center gap-1 text-emerald-600/70"><ShieldCheck className="h-3 w-3" /> Secure Access</span>
        </div>
      </CommandDialog>
    </>
  );
}

function SearchItem({ 
  icon: Icon, 
  title, 
  subtitle, 
  color, 
  onSelect 
}: { 
  icon: React.ElementType, 
  title: string, 
  subtitle: string, 
  color: string, 
  onSelect: () => void 
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <CommandItem 
      onSelect={onSelect}
      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all data-[selected=true]:bg-slate-100 group"
    >
      <div className={cn("p-2 rounded-xl border shrink-0 transition-transform group-hover:scale-110", colors[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h4>
          <ChevronRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{subtitle}</p>
      </div>
    </CommandItem>
  );
}