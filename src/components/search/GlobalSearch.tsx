"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, User, Book, CreditCard, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: "student" | "teacher" | "fee" | "exam" | "class" | "attendance";
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", type: "student", title: "Rahul Sharma", subtitle: "Class 10-A • Roll No. 12", href: "/students/sms-001", icon: <User className="h-4 w-4 text-blue-500" /> },
  { id: "2", type: "student", title: "Priya Patel", subtitle: "Class 12-Science • Roll No. 05", href: "/students/sms-002", icon: <User className="h-4 w-4 text-blue-500" /> },
  { id: "3", type: "teacher", title: "Mr. Rajesh Kumar", subtitle: "Mathematics Teacher", href: "/teachers/t-001", icon: <User className="h-4 w-4 text-emerald-500" /> },
  { id: "4", type: "fee", title: "Annual Tuition Fee", subtitle: "₹15,000 • Class 10", href: "/finance/structure", icon: <CreditCard className="h-4 w-4 text-amber-500" /> },
  { id: "5", type: "exam", title: "Unit Test - Term 1", subtitle: "Class 10-A • Oct 2025", href: "/exams", icon: <FileText className="h-4 w-4 text-purple-500" /> },
  { id: "6", type: "class", title: "Class 10-A", subtitle: "Section A • 45 Students", href: "/classes", icon: <Book className="h-4 w-4 text-orange-500" /> },
];

const AI_SUGGESTIONS = [
  "Students with low attendance",
  "Pending fee payments over ₹10,000",
  "Classes with average grade below 60%",
  "Staff with upcoming evaluations",
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Derived state for search results to avoid setState in effect
  const filteredResults = query.length > 1 
    ? MOCK_RESULTS.filter(
        r => r.title.toLowerCase().includes(query.toLowerCase()) || 
             r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const showSuggestions = query.length > 1 && !isAIProcessing;

  const handleAISearch = (suggestion: string) => {
    setQuery(suggestion);
    setIsAIProcessing(true);
    setTimeout(() => {
      setIsAIProcessing(false);
      if (suggestion.toLowerCase().includes("attendance")) {
        setResults([
          { id: "ai1", type: "attendance", title: "15 students with <75% attendance", subtitle: "Requires immediate attention", href: "/students/attendance", icon: <TrendingUp className="h-4 w-4 text-red-500" /> },
          { id: "ai2", type: "class", title: "Class 9-B", subtitle: "78% attendance • Below target", href: "/classes", icon: <Book className="h-4 w-4 text-orange-500" /> },
        ]);
      } else if (suggestion.toLowerCase().includes("fee")) {
        setResults([
          { id: "ai3", type: "fee", title: "23 pending payments", subtitle: "Total: ₹3,45,000 outstanding", href: "/finance/collect", icon: <CreditCard className="h-4 w-4 text-amber-500" /> },
        ]);
      } else {
        setResults(MOCK_RESULTS);
      }
      // suggestions will be hidden by isAIProcessing
    }, 1000);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-64 justify-between text-slate-500 hover:bg-slate-50 rounded-md"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search...</span>
        </div>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <Card className="w-full max-w-xl mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search students, teachers, fees..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
                {query && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setQuery("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isAIProcessing ? (
                <div className="p-8 text-center">
                  <Sparkles className="h-8 w-8 mx-auto text-emerald-500 animate-pulse" />
                  <p className="mt-2 text-sm text-slate-500">Analyzing data...</p>
                </div>
              ) : query.length === 0 ? (
                <div className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    AI Quick Search
                  </p>
                  <div className="space-y-2">
                    {AI_SUGGESTIONS.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleAISearch(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md flex items-center gap-2"
                      >
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {(results.length > 0 || filteredResults.length > 0) ? (
                    <div className="p-2">
                      {(results.length > 0 ? results : filteredResults).map(result => (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            {result.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{result.title}</p>
                            <p className="text-xs text-slate-500">{result.subtitle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      <p className="text-sm">No results found for "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}