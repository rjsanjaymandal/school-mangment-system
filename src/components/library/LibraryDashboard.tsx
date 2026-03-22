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
}

export function LibraryDashboard({ books, transactions, students, inventoryItems }: LibraryDashboardProps) {
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
        (b) => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 mb-4">
                        <span className="h-1.5 w-1.5 rounded-sm bg-primary animate-pulse shadow-sm shadow-primary/50" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Repository Live</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Logistics & Repository</h2>
                    <p className="text-foreground/60 font-medium tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">Institutional Archive and Asset Management System</p>
                </div>
                <div className="flex gap-x-4">
                    <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-sm border-primary/20 bg-background font-black uppercase tracking-[0.2em] px-8 py-6 h-auto text-[11px] gap-x-2 hover:bg-primary/5 hover:border-primary/40 transition-all">
                                <ArrowRightLeft className="h-4 w-4" /> Issue Command
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border border-border max-w-lg rounded-sm p-0 overflow-hidden">
                            <div className="bg-card/40 p-6 border-b border-border">
                                <DialogTitle className="font-black text-2xl uppercase tracking-tight">Initiate Lending Protocol</DialogTitle>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Assign repository item to personnel</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Repository Item (Book)</Label>
                                    <Select value={issueForm.book_id} onValueChange={(v) => setIssueForm({ ...issueForm, book_id: v })}>
                                        <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11">
                                            <SelectValue placeholder="Select book" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 border-border">
                                            {books.filter(b => b.available_copies > 0).map(b => (
                                                <SelectItem key={b.id} value={b.id} className="font-bold uppercase text-[10px]">
                                                    {b.title} ({b.available_copies} AVAILABLE)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Recipient Personnel</Label>
                                    <Select value={issueForm.student_id} onValueChange={(v) => setIssueForm({ ...issueForm, student_id: v })}>
                                        <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px] h-11">
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 border-border">
                                            {students.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold uppercase text-[10px]">
                                                    {s.profile?.first_name} {s.profile?.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Return Maturity Date</Label>
                                    <Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} className="rounded-sm bg-background/50 border-border font-bold h-11" />
                                </div>
                                <Button onClick={handleIssueBook} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow shadow-xl text-[11px] mt-2">
                                    {loading ? "Processing..." : "Commit Lending Command"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] px-8 py-6 h-auto text-[11px] gap-x-2 emerald-glow shadow-2xl">
                                <Plus className="h-4 w-4" /> Add Repository Node
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border border-border max-w-lg rounded-sm p-0 overflow-hidden">
                            <div className="bg-card/40 p-6 border-b border-border">
                                <DialogTitle className="font-black text-2xl uppercase tracking-tight">Index New Item</DialogTitle>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Add book entry to institutional repository</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Item Title</Label>
                                        <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book title" className="rounded-sm bg-background/50 border-border font-bold uppercase text-xs h-11" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Author / Creator</Label>
                                        <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author name" className="rounded-sm bg-background/50 border-border font-bold uppercase text-xs h-11" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">ISBN / ID</Label>
                                        <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="ISBN" className="rounded-sm bg-background/50 border-border font-black text-xs h-11" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Classification</Label>
                                        <Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} placeholder="Science" className="rounded-sm bg-background/50 border-border font-bold uppercase text-xs h-11" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Stock Units</Label>
                                        <Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} className="rounded-sm bg-background/50 border-border font-black text-sm h-11" />
                                    </div>
                                </div>
                                <Button onClick={handleCreateBook} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow shadow-xl text-[11px] mt-2">
                                    {loading ? "Indexing..." : "Index Repository Node"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="library" className="space-y-6">
                <TabsList className="bg-card/40 backdrop-blur-xl border border-border p-1 rounded-sm h-14 w-fit">
                    <TabsTrigger value="library" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow">
                        <Library className="h-4 w-4" /> Repository
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2">
                        <ArrowRightLeft className="h-4 w-4" /> Protocol Logs
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2">
                        <Package className="h-4 w-4" /> Inventory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-0 space-y-6">
                    <div className="flex gap-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-4 h-4 w-4 text-primary/40" />
                            <Input placeholder="Filter Repository..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 bg-card/40 border-border rounded-sm h-12 shadow-sm font-black uppercase text-[10px] tracking-widest" />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredBooks.length === 0 ? (
                            <div className="bg-card/40 backdrop-blur-xl border border-border col-span-full p-20 flex flex-col items-center justify-center text-center rounded-sm">
                                <Book className="h-12 w-12 text-primary/20 mb-4" />
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-xs">Repository is currently void.</p>
                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mt-2">Initialize new nodes to populate the archive.</p>
                            </div>
                        ) : (
                            filteredBooks.map((book) => (
                                <div key={book.id} className="group relative overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="h-12 w-12 rounded-sm bg-card text-white flex items-center justify-center shadow-lg border border-primary/20">
                                            <Book className="h-6 w-6" />
                                        </div>
                                        <div className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest border",
                                            book.available_copies > 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {book.available_copies > 0 ? `${book.available_copies} UNITS` : "DEPLETED"}
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-6 relative z-10">
                                        <h4 className="font-black text-foreground text-lg uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{book.title}</h4>
                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Authority: {book.author}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">{book.category || "GENERAL"}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Total Nodes: {book.total_copies}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="transactions" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Repository Item</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Recipient</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Initialize Date</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Due Cycle</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Protocol Status</th>
                                        <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={6} className="py-20 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">No lending protocols in effect.</td></tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-6 px-8">
                                                    <span className="font-black text-foreground uppercase text-[11px] tracking-tight">{tx.book?.title || "—"}</span>
                                                </td>
                                                <td className="py-6 px-8 flex flex-col">
                                                    <span className="font-black text-foreground/70 uppercase text-[10px] tracking-widest">{tx.student?.profile?.first_name} {tx.student?.profile?.last_name}</span>
                                                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{tx.student?.admission_number}</span>
                                                </td>
                                                <td className="py-6 px-8 text-foreground/40 font-black text-[10px] tracking-widest">{tx.issue_date}</td>
                                                <td className="py-6 px-8 text-foreground/40 font-black text-[10px] tracking-widest italic">{tx.due_date}</td>
                                                <td className="py-6 px-8">
                                                    <div className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest border",
                                                        tx.status === "issued" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                            tx.status === "returned" ? "bg-primary/10 text-primary border-primary/20" :
                                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )}>
                                                        {tx.status}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    {tx.status === "issued" && (
                                                        <Button size="sm" variant="ghost" onClick={() => handleReturn(tx.id)} className="rounded-sm font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 px-4">
                                                            Terminate
                                                        </Button>
                                                    )}
                                                    {tx.fine_amount > 0 && (
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-4 italic underline decoration-dim">Penalty: ₹{tx.fine_amount}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Asset Item</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Sector</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Volume</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Unit Val</th>
                                        <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-primary/60">Asset Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {inventoryItems.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">Inventory sector is empty.</td></tr>
                                    ) : (
                                        inventoryItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-6 px-8">
                                                    <span className="font-black text-foreground uppercase text-[11px] tracking-tight">{item.name}</span>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{item.category || "—"}</span>
                                                </td>
                                                <td className="py-6 px-8 font-black text-foreground text-sm tracking-tighter">{item.quantity_in_stock}</td>
                                                <td className="py-6 px-8 font-black text-foreground/70 text-sm tracking-tight italic">₹{Number(item.unit_price).toLocaleString("en-IN")}</td>
                                                <td className="py-6 px-8">
                                                    <div className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest border",
                                                        item.quantity_in_stock <= (item.min_stock_level || 5) ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"
                                                    )}>
                                                        {item.quantity_in_stock <= (item.min_stock_level || 5) ? "LOW STOCK" : "STABLE"}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

