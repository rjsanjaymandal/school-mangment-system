"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Book, Search, CheckCircle, Clock, SearchCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
}

interface Transaction {
  id: string;
  book_id: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  book?: Book;
  student?: { full_name: string; admission_number: string };
}

export default function LibraryPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"books" | "circulation">("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === "books") {
        const { data } = await supabase
          .from("library_books")
          .select("*")
          .order("title");
        if (isMounted.current) {
          setBooks(data || []);
          setLoading(false);
        }
      } else if (activeTab === "circulation") {
        const { data } = await supabase
          .from("library_transactions")
          .select("*, students!inner(full_name, admission_number)")
          .order("issue_date", { ascending: false })
          .limit(50);
        if (isMounted.current) {
          setTransactions(data || []);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => { isMounted.current = false; };
  }, [activeTab, supabase]);

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isbn?.includes(searchQuery)
  );

  const stats = {
    totalBooks: books.length,
    totalCopies: books.reduce((sum, b) => sum + (b.total_copies || 0), 0),
    available: books.reduce((sum, b) => sum + (b.available_copies || 0), 0),
    issued: transactions.filter(t => !t.return_date).length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Library Management"
        subtitle="Books and circulation management"
        icon={Book}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("books")}
              className={cn(
                "h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all",
                activeTab === "books"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Book className="h-4 w-4 inline mr-2" />
              Books
            </button>
            <button
              onClick={() => setActiveTab("circulation")}
              className={cn(
                "h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all",
                activeTab === "circulation"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Book className="h-4 w-4 inline mr-2" />
              Circulation
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Titles" value={stats.totalBooks} icon={Book} color="blue" description="Unique titles" />
        <DashboardStatCard title="Total Copies" value={stats.totalCopies} icon={Book} color="blue" description="All copies" />
        <DashboardStatCard title="Available" value={stats.available} icon={CheckCircle} color="emerald" description="Ready to lend" />
        <DashboardStatCard title="Issued" value={stats.issued} icon={Clock} color="amber" description="Currently borrowed" />
      </div>

      {activeTab === "books" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex-1">Book Inventory</h3>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search books by title, author, ISBN..."
                className="pl-10 rounded-xl border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Title</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Author</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">ISBN</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Category</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Total</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Available</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Shelf</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading...</td></tr>
                ) : filteredBooks.length === 0 ? (
                  <tr><td colSpan={7} className="p-16 text-center">
                    <SearchCode className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No books found</p>
                  </td></tr>
                ) : (
                  filteredBooks.map(book => (
                    <tr key={book.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-bold text-sm text-slate-900 dark:text-white">{book.title}</td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{book.author}</td>
                      <td className="py-4 px-4 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">{book.isbn || "-"}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">{book.category || "General"}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-sm">{book.total_copies || 0}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn("font-bold text-sm", (book.available_copies || 0) > 0 ? "text-emerald-600" : "text-red-600")}>
                          {book.available_copies || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{book.shelf_location || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "circulation" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Circulation History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Book</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Student</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Issue Date</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Due Date</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Return Date</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center">
                    <Clock className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No transactions</p>
                  </td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-bold text-sm text-slate-900 dark:text-white">{t.book_id}</td>
                      <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">{(t as any).students?.full_name || "-"}</td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{t.issue_date ? new Date(t.issue_date).toLocaleDateString() : "-"}</td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "-"}</td>
                      <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">{t.return_date ? new Date(t.return_date).toLocaleDateString() : "-"}</td>
                      <td className="py-4 px-4 text-center">
                        {t.return_date ? (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">Returned</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">Issued</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}