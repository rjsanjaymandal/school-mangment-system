"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Library,
    Book,
    Search,
    Plus,
    Package,
    ArrowRightLeft,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createBook, issueBook, returnBook } from "@/app/actions/library";
import { createInventoryItem } from "@/app/actions/modules";
import { useRouter } from "next/navigation";

interface LibraryDashboardProps {
    books: any[];
    transactions: any[];
    students: any[];
    inventoryItems: any[];
    userRole?: string | null;
}

export function LibraryDashboard({ books, transactions, students, inventoryItems, userRole }: LibraryDashboardProps) {
    const isStaff = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isAddBookOpen, setIsAddBookOpen] = useState(false);
    const [isIssueOpen, setIsIssueOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", total_copies: "1", shelf_location: "" });
    const [issueForm, setIssueForm] = useState({ book_id: "", student_id: "", due_date: "" });

    const handleCreateBook = async () => {
        setLoading(true);
        const result = await createBook({ ...bookForm, total_copies: parseInt(bookForm.total_copies) || 1 });
        setLoading(false);
        if (result.success) {
            setIsAddBookOpen(false);
            setBookForm({ title: "", author: "", isbn: "", category: "", total_copies: "1", shelf_location: "" });
            router.refresh();
        }
    };

    const handleIssueBook = async () => {
        setLoading(true);
        const result = await issueBook(issueForm);
        setLoading(false);
        if (result.success) {
            setIsIssueOpen(false);
            setIssueForm({ book_id: "", student_id: "", due_date: "" });
            router.refresh();
        }
    };

    const handleReturn = async (txId: string) => {
        setLoading(true);
        await returnBook(txId);
        setLoading(false);
        router.refresh();
    };

    const filteredBooks = books.filter(
        (b) => (b.title?.toLowerCase() || "").includes(search.toLowerCase()) || (b.author?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">
            {/* Background Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
                <div className="flex items-center gap-x-8">
                    <div className="h-20 w-20 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(16,185,129,0.15)] skew-x-[-12deg] group hover:bg-primary hover:text-primary-foreground transition-all duration-700">
                        <Library className="h-10 w-10 skew-x-[12deg] transition-all duration-700" />
                    </div>
                    <div>
                        <div className="relative">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                Library <span className="text-primary italic">& Inventory</span>
                            </h2>
                            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-primary/40 skew-x-[-24deg]" />
                        </div>
                        <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
                            Library Management & School Inventory Tracking
                        </p>
                    </div>
                </div>

                {isStaff && (
                    <div className="flex gap-x-4 skew-x-[-12deg]">
                        <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-16 px-10 rounded-none border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary uppercase font-black tracking-[0.2em] text-[11px] transition-all group">
                                    <span className="not-skew-x flex items-center gap-3">
                                        <ArrowRightLeft className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" /> ISSUE BOOK
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 border-none bg-transparent skew-x-[-12deg] max-w-2xl overflow-visible">
                                <div className="relative glass-panel border-primary/20 p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                                    
                                    <div className="not-skew-x relative z-10">
                                        <div className="not-skew-x flex justify-between items-start mb-10">
                                            <div>
                                                <DialogTitle className="font-black italic text-4xl uppercase tracking-tighter text-foreground leading-none">
                                                    Issue <span className="text-primary italic">Book</span>
                                                </DialogTitle>
                                                <div className="h-1 w-20 bg-primary/40 mt-4 skew-x-[-24deg]" />
                                                <p className="text-[10px] font-mono font-black text-primary/60 uppercase tracking-[0.4em] mt-6 italic">Assign a book to a student profile</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setIsIssueOpen(false)} className="text-primary/40 hover:text-primary hover:bg-primary/10 -mt-4 -mr-4 rounded-none">
                                                <Plus className="h-6 w-6 rotate-45" />
                                            </Button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] flex items-center gap-2 italic">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" /> SELECT BOOK
                                                </Label>
                                                <Select value={issueForm.book_id} onValueChange={(v) => setIssueForm({ ...issueForm, book_id: v })}>
                                                    <SelectTrigger className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 focus:ring-primary/20 font-mono font-black uppercase text-[11px] tracking-widest transition-all">
                                                        <SelectValue placeholder="SELECT_VOID" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-primary/20 rounded-none shadow-2xl">
                                                        {books.filter(b => b.available_copies > 0).map(b => (
                                                            <SelectItem key={b.id} value={b.id} className="font-mono font-black uppercase text-[10px] tracking-widest focus:bg-primary focus:text-primary-foreground italic py-3 cursor-pointer">
                                                                {b.title} [AVAIL: {b.available_copies}]
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] flex items-center gap-2 italic">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" /> SELECT STUDENT
                                                </Label>
                                                <Select value={issueForm.student_id} onValueChange={(v) => setIssueForm({ ...issueForm, student_id: v })}>
                                                    <SelectTrigger className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 focus:ring-primary/20 font-mono font-black uppercase text-[11px] tracking-widest transition-all">
                                                        <SelectValue placeholder="SELECT_VOID" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-primary/20 rounded-none shadow-2xl">
                                                        {students.map(s => (
                                                            <SelectItem key={s.id} value={s.id} className="font-mono font-black uppercase text-[10px] tracking-widest focus:bg-primary focus:text-primary-foreground italic py-3 cursor-pointer">
                                                                {s.profile?.first_name} {s.profile?.last_name} [ID: {s.admission_number}]
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3 pb-4">
                                                <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] flex items-center gap-2 italic">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" /> DUE DATE
                                                </Label>
                                                <Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black text-xs transition-all" />
                                            </div>

                                            <Button onClick={handleIssueBook} disabled={loading} className="w-full h-18 rounded-none bg-primary text-primary-foreground font-black italic uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs border border-primary/20 gap-3">
                                                {loading ? "PROCESSING..." : "CONFIRM ISSUE"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Collection Label */}
                                    <div className="absolute -left-12 -bottom-10 opacity-[0.03] font-mono text-[100px] font-black italic text-primary pointer-events-none uppercase">DEPLOY</div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-16 px-10 rounded-none bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] emerald-glow shadow-2xl hover:scale-105 transition-all group">
                                    <span className="not-skew-x flex items-center gap-3">
                                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> ADD NEW BOOK
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 border-none bg-transparent skew-x-[-12deg] max-w-2xl overflow-visible">
                                <div className="relative glass-panel border-primary/20 p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-3xl -ml-16 -mt-16" />
                                    
                                    <div className="not-skew-x relative z-10">
                                        <div className="not-skew-x flex justify-between items-start mb-10">
                                            <div>
                                                <DialogTitle className="font-black italic text-4xl uppercase tracking-tighter text-foreground leading-none">
                                                    Add <span className="text-primary italic">New Book</span>
                                                </DialogTitle>
                                                <div className="h-1 w-20 bg-primary/40 mt-4 skew-x-[-24deg]" />
                                                <p className="text-[10px] font-mono font-black text-primary/60 uppercase tracking-[0.4em] mt-6 italic">Add a new book to the library collection</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setIsAddBookOpen(false)} className="text-primary/40 hover:text-primary hover:bg-primary/10 -mt-4 -mr-4 rounded-none">
                                                <Plus className="h-6 w-6 rotate-45" />
                                            </Button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">BOOK TITLE</Label>
                                                    <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="TITLE_ID" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">AUTHOR</Label>
                                                    <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="AUTHOR_NAME" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">ISBN</Label>
                                                    <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="KEY_VALUE" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">CATEGORY</Label>
                                                    <Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} placeholder="SECTOR_VOID" className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black uppercase text-xs transition-all placeholder:text-foreground/10" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.3em] italic">TOTAL COPIES</Label>
                                                    <Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} className="h-14 rounded-none bg-background/50 border-primary/10 hover:border-primary/40 font-mono font-black tabular-nums transition-all" />
                                                </div>
                                            </div>

                                            <Button onClick={handleCreateBook} disabled={loading} className="w-full h-18 rounded-none bg-primary text-primary-foreground font-black italic uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs border border-primary/20 gap-3 mt-4">
                                                {loading ? "SAVING..." : "SAVE BOOK"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Matrix Label */}
                                    <div className="absolute -right-12 -bottom-10 opacity-[0.03] font-mono text-[100px] font-black italic text-primary pointer-events-none uppercase">ARCHIVE</div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Library Stats Grid */}
            <div className="grid gap-8 md:grid-cols-4 reveal-2 relative z-10">
                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-primary/10 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-primary/10 group-hover:border-primary/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-primary/60 mb-2 italic">Total Books</p>
                                <h3 className="text-4xl font-black text-foreground italic leading-none">{books.length}</h3>
                            </div>
                            <Book className="h-8 w-8 text-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-primary group-hover:opacity-10 transition-all duration-700">INDEX</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-blue-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-blue-500/10 group-hover:border-blue-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Issued Books</p>
                                <h3 className="text-4xl font-black text-blue-500 italic leading-none">{transactions.filter(t => t.status === "issued").length}</h3>
                            </div>
                            <ArrowRightLeft className="h-8 w-8 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-blue-500/40 group-hover:opacity-10 transition-all duration-700">HELD</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-amber-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-amber-500/10 group-hover:border-amber-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Low Stock</p>
                                <h3 className="text-4xl font-black text-amber-500 italic leading-none">{inventoryItems.filter(i => i.quantity_in_stock <= (i.min_stock_level || 5)).length}</h3>
                            </div>
                            <Package className="h-8 w-8 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-amber-500/40 group-hover:opacity-10 transition-all duration-700">LOW</div>
                    </div>
                </div>

                <div className="group relative transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-red-500/5 skew-x-[-12deg] translate-x-3 translate-y-3 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative glass-panel p-8 border-red-500/10 group-hover:border-red-500/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl overflow-hidden">
                        <div className="not-skew-x flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 mb-2 italic">Overdue</p>
                                <h3 className="text-4xl font-black text-red-500 italic leading-none">{transactions.filter(t => t.status === "issued" && new Date(t.due_date) < new Date()).length}</h3>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500/40 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 font-mono text-[40px] font-black italic text-red-500/40 group-hover:opacity-10 transition-all duration-700">OVER</div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="library" className="space-y-12 relative z-10">
                <TabsList className="bg-transparent border-none p-0 h-auto w-full justify-start gap-4 skew-x-[-12deg]">
                    <TabsTrigger value="library" className="h-16 px-10 rounded-none border border-primary/10 bg-card/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] transition-all emerald-glow">
                        <span className="not-skew-x flex items-center gap-3">
                            <Library className="h-4 w-4" /> BOOKS
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="h-16 px-10 rounded-none border border-primary/10 bg-card/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] transition-all">
                        <span className="not-skew-x flex items-center gap-3">
                            <ArrowRightLeft className="h-4 w-4" /> {isStaff ? "TRANSACTIONS" : "MY BORROWING"}
                        </span>
                    </TabsTrigger>
                    {isStaff && (
                        <TabsTrigger value="inventory" className="h-16 px-10 rounded-none border border-primary/10 bg-card/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] transition-all">
                            <span className="not-skew-x flex items-center gap-3">
                                <Package className="h-4 w-4" /> INVENTORY
                            </span>
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="library" className="mt-0 space-y-6">
                    <div className="flex gap-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-4 h-4 w-4 text-primary/40" />
                            <Input placeholder="Search Books..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 bg-card/40 border-border rounded-sm h-12 shadow-sm font-black uppercase text-[10px] tracking-widest" />
                        </div>
                    </div>

                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {filteredBooks.length === 0 ? (
                            <div className="bg-card/20 backdrop-blur-3xl border border-primary/10 col-span-full p-32 flex flex-col items-center justify-center text-center skew-x-[-12deg]">
                                <div className="not-skew-x flex flex-col items-center">
                                    <Book className="h-20 w-20 text-primary/10 mb-8 animate-pulse" />
                                    <p className="text-foreground/40 font-mono font-black uppercase tracking-[0.5em] text-xs underline decoration-primary/20 underline-offset-8">No Books Found</p>
                                    <p className="text-[10px] font-mono font-black text-primary/30 uppercase tracking-[0.3em] mt-6 italic">Add new books to populate the library collection.</p>
                                </div>
                            </div>
                        ) : (
                            filteredBooks.map((book) => (
                                <div key={book.id} className="group relative skew-x-[-12deg] transition-all duration-700 hover:-translate-y-2 hover:translate-x-2">
                                    <div className="absolute inset-0 bg-primary/5 -z-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="relative glass-panel p-8 border-primary/10 group-hover:border-primary/40 transition-all duration-700 rounded-none shadow-2xl overflow-hidden">
                                        <div className="not-skew-x">
                                            <div className="flex items-start justify-between mb-10">
                                                <div className="h-16 w-16 bg-background/50 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                                    <Book className="h-8 w-8" />
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1 font-mono font-black text-[10px] uppercase tracking-[0.2em] italic border skew-x-[12deg]",
                                                    book.available_copies > 0 ? "bg-primary/5 text-primary border-primary/20" : "bg-red-500/5 text-red-500 border-red-500/20"
                                                )}>
                                                    <span className="inline-block skew-x-[-12deg]">
                                                        {book.available_copies > 0 ? `${book.available_copies} AVAILABLE` : "OUT OF STOCK"}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3 mb-8">
                                                <h4 className="font-black italic text-foreground text-2xl uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">{book.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 w-4 bg-primary/20" />
                                                    <p className="text-[10px] font-mono font-black text-foreground/40 uppercase tracking-[0.3em]">Authority: {book.author}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/5">
                                                <div>
                                                    <p className="text-[8px] font-mono font-black text-foreground/20 uppercase tracking-widest mb-1">CLASSIFICATION</p>
                                                    <p className="text-[10px] font-mono font-black text-primary uppercase tracking-widest italic">{book.category || "GENERAL"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-mono font-black text-foreground/20 uppercase tracking-widest mb-1">TOTAL COPIES</p>
                                                    <p className="font-mono font-black text-foreground/60 text-lg tabular-nums tracking-tighter italic">{book.total_copies}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Background Collection Label */}
                                        <div className="absolute -right-6 -bottom-6 opacity-5 font-mono text-[60px] font-black italic text-primary/20 pointer-events-none uppercase">NODE</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="transactions" className="mt-0">
                    <div className="relative skew-x-[-12deg] transition-all duration-700">
                        <div className="absolute inset-0 bg-primary/5 -z-10 blur-3xl opacity-50" />
                        <div className="relative glass-panel border-primary/10 rounded-none shadow-2xl overflow-hidden">
                            <div className="not-skew-x overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-primary/5 border-b border-primary/10">
                                        <tr>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Reposit_Node</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Personnel_ID</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Deployment_Date</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Duration_Cycle</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Status_Flag</th>
                                            {isStaff && <th className="text-right py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Operations</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan={6} className="py-32 text-center text-foreground/20 font-black uppercase tracking-[0.5em] text-xs skew-x-[12deg]">No Transaction History</td></tr>
                                        ) : (
                                            transactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                    <td className="py-8 px-10">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground italic uppercase text-sm tracking-tighter group-hover:text-primary transition-colors">{tx.book?.title || "—"}</span>
                                                            <span className="text-[9px] font-mono font-black text-foreground/30 uppercase tracking-widest mt-1">ISBN: {tx.book?.isbn || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 px-10 flex flex-col">
                                                        <span className="font-black text-foreground/70 uppercase text-[11px] tracking-widest italic">{tx.student?.profile?.first_name} {tx.student?.profile?.last_name}</span>
                                                        <span className="text-[9px] font-mono font-black text-primary/40 uppercase tracking-widest mt-1">ID: {tx.student?.admission_number}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <span className="font-mono font-black text-foreground/40 text-[10px] tracking-widest uppercase italic">{tx.issue_date}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <span className="font-mono font-black text-foreground/40 text-[10px] tracking-widest uppercase italic">{tx.due_date}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <div className={cn(
                                                            "inline-flex items-center px-4 py-1.5 rounded-none font-mono font-black text-[9px] uppercase tracking-[0.2em] border skew-x-[12deg]",
                                                            tx.status === "issued" ? "bg-blue-500/5 text-blue-500 border-blue-500/20" :
                                                                tx.status === "returned" ? "bg-primary/5 text-primary border-primary/20" :
                                                                    "bg-red-500/5 text-red-500 border-red-500/20"
                                                        )}>
                                                            <span className="inline-block skew-x-[-12deg]">{tx.status}</span>
                                                        </div>
                                                    </td>
                                                    {isStaff && (
                                                        <td className="py-8 px-10 text-right">
                                                            <div className="flex flex-col items-end gap-2">
                                                                {tx.status === "issued" && (
                                                                    <Button size="sm" variant="outline" onClick={() => handleReturn(tx.id)} className="h-10 px-6 rounded-none border-primary/20 hover:bg-primary hover:text-primary-foreground font-black text-[10px] uppercase tracking-widest transition-all skew-x-[12deg]">
                                                                        <span className="inline-block skew-x-[-12deg]">RETURN BOOK</span>
                                                                    </Button>
                                                                )}
                                                                {tx.fine_amount > 0 && (
                                                                    <span className="animate-pulse text-[10px] font-black text-red-500 uppercase tracking-widest italic bg-red-500/5 px-2 py-1">LATE FEE: ₹{tx.fine_amount}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="mt-0">
                    <div className="relative skew-x-[-12deg] transition-all duration-700">
                        <div className="absolute inset-0 bg-primary/5 -z-10 blur-3xl opacity-50" />
                        <div className="relative glass-panel border-primary/10 rounded-none shadow-2xl overflow-hidden">
                            <div className="not-skew-x overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-primary/5 border-b border-primary/10">
                                        <tr>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Asset_Item_Node</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Containment_Sector</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Volume_Depth</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Unit_Valuation</th>
                                            <th className="text-left py-6 px-10 font-black uppercase tracking-[0.3em] text-[10px] text-primary/60 italic">Operational_Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {inventoryItems.length === 0 ? (
                                            <tr><td colSpan={5} className="py-32 text-center text-foreground/20 font-black uppercase tracking-[0.5em] text-xs skew-x-[12deg]">Inventory is Empty</td></tr>
                                        ) : (
                                            inventoryItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                    <td className="py-8 px-10">
                                                        <span className="font-black text-foreground italic uppercase text-sm tracking-tighter group-hover:text-primary transition-colors">{item.name}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-foreground/40 italic">{item.category || "GENERAL_ASSET"}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <span className="font-mono font-black text-foreground text-lg tracking-tighter tabular-nums italic group-hover:text-primary transition-colors">{item.quantity_in_stock}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <span className="font-mono font-black text-foreground/50 text-[11px] tracking-widest uppercase italic tabular-nums">₹{Number(item.unit_price).toLocaleString("en-IN")}</span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <div className={cn(
                                                            "inline-flex items-center px-4 py-1.5 rounded-none font-mono font-black text-[9px] uppercase tracking-[0.2em] border skew-x-[12deg]",
                                                            item.quantity_in_stock <= (item.min_stock_level || 5) ? "bg-red-500/5 text-red-500 border-red-500/20" : "bg-primary/5 text-primary border-primary/20"
                                                        )}>
                                                            <span className="inline-block skew-x-[-12deg]">{item.quantity_in_stock <= (item.min_stock_level || 5) ? "LOW STOCK" : "IN STOCK"}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

