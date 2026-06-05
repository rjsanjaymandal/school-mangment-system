"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, Users, GraduationCap, UserSquare2, BookOpen, Calendar, IndianRupee, FileText, Bus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "student" | "staff" | "teacher" | "class" | "subject" | "exam" | "fee" | "transport";
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  href: string;
}

const typeIcons: Record<string, any> = {
  student: GraduationCap,
  staff: UserSquare2,
  teacher: Users,
  class: Users,
  subject: BookOpen,
  exam: FileText,
  fee: IndianRupee,
  transport: Bus,
};

export function AdvancedSearch() {
  const supabase = createClient();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const search = async () => {
      setIsSearching(true);
      const searchTerm = query.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search students
      if (activeFilters.length === 0 || activeFilters.includes("student")) {
        const { data: students } = await supabase
          .from("students")
          .select("id, admission_number, profile:profiles(full_name, email)")
          .ilike("admission_number", `%${searchTerm}%`)
          .limit(5);
        
        if (students) {
          students.forEach((s: any) => {
            allResults.push({
              type: "student",
              id: s.id,
              title: s.profile?.full_name || "Unknown",
              subtitle: `Admission: ${s.admission_number}`,
              icon: GraduationCap,
              href: `/students/${s.id}`
            });
          });
        }
      }

      // Search staff
      if (activeFilters.length === 0 || activeFilters.includes("staff")) {
        const { data: staff } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .ilike("full_name", `%${searchTerm}%`)
          .eq("role", "staff")
          .limit(5);
        
        if (staff) {
          staff.forEach((s: any) => {
            allResults.push({
              type: "staff",
              id: s.id,
              title: s.full_name,
              subtitle: s.email,
              icon: UserSquare2,
              href: `/hr/staff/${s.id}`
            });
          });
        }
      }

      // Search classes
      if (activeFilters.length === 0 || activeFilters.includes("class")) {
        const { data: classes } = await supabase
          .from("classes")
          .select("id, name, section")
          .ilike("name", `%${searchTerm}%`)
          .limit(5);
        
        if (classes) {
          classes.forEach((c: any) => {
            allResults.push({
              type: "class",
              id: c.id,
              title: c.name,
              subtitle: c.section || "No section",
              icon: Users,
              href: `/classes`
            });
          });
        }
      }

      // Search subjects
      if (activeFilters.length === 0 || activeFilters.includes("subject")) {
        const { data: subjects } = await supabase
          .from("subjects")
          .select("id, name, code")
          .ilike("name", `%${searchTerm}%`)
          .limit(5);
        
        if (subjects) {
          subjects.forEach((s: any) => {
            allResults.push({
              type: "subject",
              id: s.id,
              title: s.name,
              subtitle: s.code || "No code",
              icon: BookOpen,
              href: `/subjects`
            });
          });
        }
      }

      setResults(allResults);
      setIsSearching(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filterOptions = [
    { value: "student", label: "Students" },
    { value: "staff", label: "Staff" },
    { value: "class", label: "Classes" },
    { value: "subject", label: "Subjects" },
  ];

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search students, staff, classes, subjects..."
          className="pl-10 pr-20 h-10"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button onClick={handleClear} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded">
              <X className="h-3 w-3" />
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border rounded-lg shadow-lg p-3 z-50">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => toggleFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  activeFilters.includes(option.value)
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((result) => {
            const Icon = result.icon;
            return (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => {
                  router.push(result.href);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full p-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0"
              >
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{result.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{result.subtitle}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {result.type}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}