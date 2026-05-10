"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, FileText, Users, BookOpen, Calendar, GraduationCap, CreditCard, Bell, Settings, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  title: string;
  description?: string;
  href: string;
  icon: any;
  category: string;
}

const QUICK_LINKS: SearchResult[] = [
  { title: "Timetable", description: "Class schedule & teacher allocation", href: "/timetable", icon: Calendar, category: "Academics" },
  { title: "Student List", description: "Manage all students", href: "/students", icon: GraduationCap, category: "Students" },
  { title: "Staff Directory", description: "Manage teachers & staff", href: "/hr/directory", icon: Users, category: "HR" },
  { title: "Fee Collection", description: "Collect and manage fees", href: "/fees", icon: CreditCard, category: "Finance" },
  { title: "Exams", description: "Manage exams and results", href: "/exams", icon: FileText, category: "Academics" },
  { title: "Attendance", description: "Track student attendance", href: "/attendance", icon: Users, category: "Students" },
  { title: "Notifications", description: "View all notifications", href: "/notifications", icon: Bell, category: "System" },
  { title: "Analytics", description: "View reports and insights", href: "/analytics", icon: Settings, category: "System" },
  { title: "Library", description: "Book management", href: "/library", icon: BookOpen, category: "Academics" },
  { title: "Transport", description: "Fleet and routes", href: "/transport", icon: Settings, category: "Admin" },
];

const DEFAULT_RESULTS = QUICK_LINKS.slice(0, 6);

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return DEFAULT_RESULTS;
    return QUICK_LINKS.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const categories = [...new Set(results.map((r) => r.category))];

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-56 justify-between text-muted-foreground border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-slate-50/50"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Search...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white border border-slate-200 px-1.5 font-mono text-[10px] font-medium text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 bg-white rounded-xl shadow-2xl border border-slate-200">
          <DialogHeader className="p-0">
            <DialogTitle className="sr-only">Global Search</DialogTitle>
          </DialogHeader>
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search pages, actions, students..."
                className="pl-12 pr-10 h-12 border-0 focus-visible:ring-0 text-base bg-transparent placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-slate-100 rounded-full"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {query && (
              <div className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100">
                Press <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Enter</kbd> to go directly
              </div>
            )}

            {!query && (
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quick Navigation</p>
              </div>
            )}

            {categories.map((category) => (
              <div key={category} className="mb-1">
                <div className="px-4 py-2">
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase bg-slate-50 border-slate-200 text-slate-600">
                    {category}
                  </Badge>
                </div>
                {results
                  .filter((r) => r.category === category)
                  .map((result, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left group transition-colors"
                      onClick={() => handleSelect(result.href)}
                    >
                      <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <result.icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-slate-900">{result.title}</div>
                        {result.description && (
                          <div className="text-xs text-muted-foreground">{result.description}</div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
              </div>
            ))}

            {results.length === 0 && query && (
              <div className="text-center py-12 text-slate-400">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for students, staff, or pages</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-xl">
            <div className="flex items-center gap-2">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}