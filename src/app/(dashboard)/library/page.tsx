"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Book, Search, Plus, User, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ERPCard } from "@/components/ui/erp-card";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState<"books" | "circulation" | "search">("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadBooks() {
    setLoading(true);
    const { data } = await supabase
      .from("library_books")
      .select("*")
      .order("title");
    setBooks(data || []);
    setLoading(false);
  }

  async function loadTransactions() {
    setLoading(true);
    const { data } = await supabase
      .from("library_transactions")
      .select("*, students!inner(full_name, admission_number)")
      .order("issue_date", { ascending: false })
      .limit(50);
    setTransactions(data || []);
    setLoading(false);
  }

  const loadData = useCallback(() => {
    if (activeTab === "books") {
      loadBooks();
    } else if (activeTab === "circulation") {
      loadTransactions();
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library Management</h1>
          <p className="text-muted-foreground">Books and circulation management</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === "books" ? "default" : "outline"} onClick={() => setActiveTab("books")}>
            <Book className="h-4 w-4 mr-2" />
            Books
          </Button>
          <Button variant={activeTab === "circulation" ? "default" : "outline"} onClick={() => setActiveTab("circulation")}>
            <User className="h-4 w-4 mr-2" />
            Circulation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Book className="h-4 w-4" />
            Total Titles
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalBooks}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Book className="h-4 w-4" />
            Total Copies
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.totalCopies}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Available
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.available}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            Issued
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.issued}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books by title, author, ISBN..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === "books" && (
        <ERPCard accentColor="blue">
          <CardHeader className="border-b">
            <CardTitle>Book Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Author</th>
                    <th className="text-left p-4 font-medium">ISBN</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-center p-4 font-medium">Total</th>
                    <th className="text-center p-4 font-medium">Available</th>
                    <th className="text-left p-4 font-medium">Shelf</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No books found</td></tr>
                  ) : (
                    filteredBooks.map(book => (
                      <tr key={book.id} className="border-t hover:bg-slate-50">
                        <td className="p-4 font-medium">{book.title}</td>
                        <td className="p-4 text-muted-foreground">{book.author}</td>
                        <td className="p-4 font-mono text-sm">{book.isbn || "-"}</td>
                        <td className="p-4"><Badge variant="outline">{book.category || "General"}</Badge></td>
                        <td className="p-4 text-center">{book.total_copies || 0}</td>
                        <td className="p-4 text-center">
                          <span className={(book.available_copies || 0) > 0 ? "text-emerald-600" : "text-red-600"}>
                            {book.available_copies || 0}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{book.shelf_location || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </ERPCard>
      )}

      {activeTab === "circulation" && (
        <ERPCard accentColor="emerald">
          <CardHeader className="border-b">
            <CardTitle>Circulation History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium">Book</th>
                    <th className="text-left p-4 font-medium">Student</th>
                    <th className="text-left p-4 font-medium">Issue Date</th>
                    <th className="text-left p-4 font-medium">Due Date</th>
                    <th className="text-left p-4 font-medium">Return Date</th>
                    <th className="text-center p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions</td></tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} className="border-t hover:bg-slate-50">
                        <td className="p-4 font-medium">{t.book_id}</td>
                        <td className="p-4">{(t as any).students?.full_name || "-"}</td>
                        <td className="p-4">{t.issue_date ? new Date(t.issue_date).toLocaleDateString() : "-"}</td>
                        <td className="p-4">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "-"}</td>
                        <td className="p-4">{t.return_date ? new Date(t.return_date).toLocaleDateString() : "-"}</td>
                        <td className="p-4 text-center">
                          {t.return_date ? (
                            <Badge className="bg-emerald-100 text-emerald-700">Returned</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">Issued</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </ERPCard>
      )}
    </div>
  );
}