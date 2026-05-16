"use client";

import * as React from "react";
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Search, 
  Settings, 
  Smile, 
  User, 
  Users,
  GraduationCap,
  Library,
  Bus,
  Clock
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

export function QuickSearch() {
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
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors bg-slate-100/50 rounded-lg border border-slate-200/50"
      >
        <Search className="h-3 w-3" />
        <span>Search</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a name or action..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Students & Staff">
            <CommandItem onSelect={() => runCommand(() => router.push("/students"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Student Directory</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/teachers"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Staff List</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="School Logs">
            <CommandItem onSelect={() => runCommand(() => {
              const el = document.getElementById('daily-log-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setOpen(false);
            })}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Daily Log (Recent Activity)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/students/attendance"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Attendance Records</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/students/attendance"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Mark Attendance</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/fees"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Collect Fees</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/library"))}>
              <Library className="mr-2 h-4 w-4" />
              <span>Issue Book</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="School Sections">
            <CommandItem onSelect={() => runCommand(() => router.push("/academics/classes"))}>
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Class Management</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/transport"))}>
              <Bus className="mr-2 h-4 w-4" />
              <span>Bus Routes</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
