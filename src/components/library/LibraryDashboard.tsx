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
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Logistics & Repository</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Library, Inventory & Asset Management</p>
                </div>
                <div className="flex gap-x-3">
                    <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2">
                                <ArrowRightLeft className="h-4 w-4" /> Issue Book
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Issue Book</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Book</Label>
                                    <Select value={issueForm.book_id} onValueChange={(v) => setIssueForm({ ...issueForm, book_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                                        <SelectContent>{books.filter(b => b.available_copies > 0).map(b => <SelectItem key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Student</Label>
                                    <Select value={issueForm.student_id} onValueChange={(v) => setIssueForm({ ...issueForm, student_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.profile?.first_name} {s.profile?.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Due Date</Label>
                                    <Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} />
                                </div>
                                <Button onClick={handleIssueBook} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                    {loading ? "Issuing..." : "Issue Book"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
                                <Plus className="h-4 w-4" /> Add Book
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Add New Book</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Title</Label>
                                        <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book title" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Author</Label>
                                        <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author name" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">ISBN</Label>
                                        <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="ISBN" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Category</Label>
                                        <Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} placeholder="Science" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-400">Copies</Label>
                                        <Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleCreateBook} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                    {loading ? "Adding..." : "Add Book"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="library" className="space-y-6">
                <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14">
                    <TabsTrigger value="library" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <Library className="h-4 w-4" /> Central Library
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <ArrowRightLeft className="h-4 w-4" /> Lending History
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2">
                        <Package className="h-4 w-4" /> School Inventory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="space-y-6">
                    <div className="flex gap-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-slate-100 rounded-2xl h-12 shadow-sm" />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredBooks.length === 0 ? (
                            <Card className="border-none glass futuristic-card col-span-full p-12 flex flex-col items-center justify-center text-center">
                                <Book className="h-12 w-12 text-slate-300 mb-4" />
                                <p className="text-slate-400 font-bold">No books in the library yet.</p>
                                <p className="text-xs text-slate-400 mt-1">Click "Add Book" to start building your catalog.</p>
                            </Card>
                        ) : (
                            filteredBooks.map((book) => (
                                <Card key={book.id} className="border-none glass futuristic-card group p-2">
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg neon-blue">
                                            <Book className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className={cn("font-bold text-[10px]", book.available_copies > 0 ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                                            {book.available_copies > 0 ? `${book.available_copies} IN STOCK` : "OUT OF STOCK"}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">{book.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium">By {book.author}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{book.category || "General"}</span>
                                            <span className="text-[10px] font-bold text-slate-400">Total: {book.total_copies}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="transactions">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Book</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Student</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Issued</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Due</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                                    <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-medium">No lending history yet.</td></tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-6 px-8 font-bold text-slate-900">{tx.book?.title || "—"}</td>
                                            <td className="py-6 px-8 font-medium text-slate-600">{tx.student?.profile?.first_name} {tx.student?.profile?.last_name}</td>
                                            <td className="py-6 px-8 text-slate-400 font-mono text-xs">{tx.issue_date}</td>
                                            <td className="py-6 px-8 text-slate-400 font-mono text-xs">{tx.due_date}</td>
                                            <td className="py-6 px-8">
                                                <Badge variant="outline" className={cn("font-bold text-[10px] uppercase tracking-widest", tx.status === "issued" ? "bg-blue-50 text-blue-600 border-blue-100" : tx.status === "returned" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                                                    {tx.status}
                                                </Badge>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                {tx.status === "issued" && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleReturn(tx.id)} className="rounded-xl font-bold text-xs text-slate-400 hover:text-blue-500 hover:bg-blue-50">
                                                        RETURN
                                                    </Button>
                                                )}
                                                {tx.fine_amount > 0 && (
                                                    <span className="text-xs font-bold text-red-500 ml-2">Fine: ₹{tx.fine_amount}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="inventory">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Item</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Category</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Stock</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Unit Price</th>
                                    <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {inventoryItems.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No inventory items yet.</td></tr>
                                ) : (
                                    inventoryItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/60 transition-colors">
                                            <td className="py-6 px-8 font-bold text-slate-900">{item.name}</td>
                                            <td className="py-6 px-8 text-slate-500">{item.category || "—"}</td>
                                            <td className="py-6 px-8 font-black text-slate-900">{item.quantity_in_stock}</td>
                                            <td className="py-6 px-8 font-medium text-slate-600">₹{Number(item.unit_price).toLocaleString("en-IN")}</td>
                                            <td className="py-6 px-8">
                                                <Badge variant="outline" className={cn("font-bold text-[10px]",
                                                    item.quantity_in_stock <= (item.min_stock_level || 5) ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                                                )}>
                                                    {item.quantity_in_stock <= (item.min_stock_level || 5) ? "LOW STOCK" : "IN STOCK"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
