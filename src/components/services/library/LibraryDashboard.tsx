"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    Library,
    Book,
    Search,
    Plus,
    Package,
    ArrowRightLeft,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    Download,
    Activity,
    Zap,
    ChevronRight,
    SearchCode,
    Barcode,
    UserPlus,
    Calendar,
    Save
} from "lucide-react";
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
import { 
    BarChart, Bar, 
    ResponsiveContainer, Tooltip, 
    XAxis, YAxis, CartesianGrid, Cell
} from "recharts";
import { createBook, issueBook, returnBook } from "@/app/actions/library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

    // --- Analytics Intelligence Layer ---
    const circulationVelocity = useMemo(() => {
        const issued = transactions?.filter(t => t.status === "issued").length || 0;
        const available = books?.reduce((acc, b) => acc + (b.available_copies || 0), 0) || 0;
        return [
            { name: "DEPLOYED", value: issued, color: "var(--primary)" },
            { name: "RESERVE", value: available, color: "rgba(16,185,129,0.3)" }
        ];
    }, [books, transactions]);

    const handleCreateBook = async () => {
        if (!bookForm.title || !bookForm.author) {
            toast.error("Title and Author are required nodes.");
            return;
        }
        setLoading(true);
        const result = await createBook({ ...bookForm, total_copies: parseInt(bookForm.total_copies) || 1 });
        setLoading(false);
        if (result.success) {
            toast.success("Catalog Fragment Initialized");
            setIsAddBookOpen(false);
            setBookForm({ title: "", author: "", isbn: "", category: "", total_copies: "1", shelf_location: "" });
            router.refresh();
        } else {
            toast.error(result.error || "Initialization Failure");
        }
    };

    const handleIssueBook = async () => {
        if (!issueForm.book_id || !issueForm.student_id) {
            toast.error("Target and Borrower must be identified.");
            return;
        }
        setLoading(true);
        const result = await issueBook(issueForm);
        setLoading(false);
        if (result.success) {
            toast.success("Asset Deployed Successfully");
            setIsIssueOpen(false);
            setIssueForm({ book_id: "", student_id: "", due_date: "" });
            router.refresh();
        } else {
            toast.error(result.error || "Deployment Failure");
        }
    };

    const handleReturn = async (txId: string) => {
        setLoading(true);
        const result = await returnBook(txId);
        setLoading(false);
        if (result.success) {
            toast.success("Asset Re-integrated");
            router.refresh();
        } else {
            toast.error(result.error || "Integration Failure");
        }
    };

    const filteredBooks = (books || []).filter(
        (b) => (b.title?.toLowerCase() || "").includes(search.toLowerCase()) || (b.author?.toLowerCase() || "").includes(search.toLowerCase())
    );

    const activeLoansCount = transactions?.filter(t => t.status === "issued").length || 0;
    const overdueCount = transactions?.filter(t => t.status === "issued" && new Date(t.due_date) < new Date()).length || 0;

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">
            
            {/* Header Architecture */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
                <div className="flex items-center gap-x-8">
                    <div className="h-16 w-16 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-sm group hover:bg-primary hover:text-primary-foreground transition-all duration-300 emerald-glow-sm">
                        <Library className="h-8 w-8 transition-all duration-300" />
                    </div>
                    <div>
                        <div className="relative">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                Library Management
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" /> 
                            Manage library catalog, inventory, and book issues
                        </p>
                    </div>
                </div>

                {isStaff && (
                    <div className="flex items-center gap-4">
                        <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-10 px-4 font-medium transition-all gap-2 group">
                                    <ArrowRightLeft className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" /> Issue Book
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 border-none bg-transparent max-w-xl">
                                <div className="bg-card border border-border p-8 rounded-xl shadow-lg relative overflow-hidden">
                                    <div className="relative z-10 space-y-8">
                                        <div className="text-center">
                                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                                                Issue Book
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">Record book borrowing details</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-foreground">Select Book</Label>
                                                <Select value={issueForm.book_id} onValueChange={(v) => setIssueForm({ ...issueForm, book_id: v })}>
                                                    <SelectTrigger className="h-11 bg-background border-border text-foreground font-medium rounded-sm focus:ring-1 focus:ring-primary/40">
                                                        <SelectValue placeholder="Search book..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-background border-border">
                                                        {books.filter(b => (b.available_copies || 0) > 0).map(b => (
                                                            <SelectItem key={b.id} value={b.id} className="font-medium text-sm hover:bg-muted focus:bg-muted">
                                                                {b.title} <span className="text-muted-foreground px-2">[{b.available_copies} Available]</span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-foreground">Select Student</Label>
                                                <Select value={issueForm.student_id} onValueChange={(v) => setIssueForm({ ...issueForm, student_id: v })}>
                                                    <SelectTrigger className="h-11 bg-background border-border text-foreground font-medium rounded-sm focus:ring-1 focus:ring-primary/40">
                                                        <SelectValue placeholder="Search student..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-background border-border">
                                                        {students.map(s => (
                                                            <SelectItem key={s.id} value={s.id} className="font-medium text-sm hover:bg-muted focus:bg-muted">
                                                                {s.profile?.full_name} <span className="text-muted-foreground px-2">#{s.admission_number}</span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-foreground">Due Date</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} className="h-11 bg-background border-border text-foreground font-medium pl-10 rounded-sm" />
                                                </div>
                                            </div>

                                            <Button onClick={handleIssueBook} disabled={loading} className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-sm shadow-sm">
                                                {loading ? "Processing..." : "Issue Book"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-10 px-4 font-medium transition-all gap-2 group">
                                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Add Book
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 border-none bg-transparent max-w-xl">
                                <div className="bg-card border border-border p-8 rounded-xl shadow-lg relative overflow-hidden">
                                    <div className="relative z-10 space-y-8">
                                        <div className="text-center">
                                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                                                Add New Book
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">Register a new book to the catalog</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-foreground">Book Title</Label>
                                                    <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Title..." className="h-11 bg-background border-border text-foreground font-medium rounded-sm" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.2em] italic">Intellect Lead</Label>
                                                    <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="AUTHOR..." className="h-14 bg-primary/5 border-primary/10 font-mono font-black text-[10px] uppercase rounded-sm" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.2em] italic">Archive Metadata (ISBN)</Label>
                                                <div className="relative">
                                                     <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                                     <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="UNIQUE IDENTIFIER..." className="h-14 bg-primary/5 border-primary/10 font-mono font-black text-[10px] pl-12 rounded-sm" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.2em] italic">Classification</Label>
                                                    <Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} placeholder="GENERAL..." className="h-14 bg-primary/5 border-primary/10 font-mono font-black text-[10px] uppercase rounded-sm" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[9px] font-mono font-black uppercase text-foreground/40 tracking-[0.2em] italic">Unit Density</Label>
                                                    <Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} className="h-14 bg-primary/5 border-primary/10 font-mono font-black text-[10px] rounded-sm" />
                                                </div>
                                            </div>

                                            <Button onClick={handleCreateBook} disabled={loading} className="w-full h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] font-mono text-[11px] rounded-sm emerald-glow transition-all active:scale-95 shadow-2xl mt-4">
                                                {loading ? "COMMITTING..." : "INTEGRATE TO ARCHIVE"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Analytics Surface */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-2 relative z-10">
                {/* Stats Matrix */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Total Books</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">{books?.length || 0}</h3>
                            </div>
                            <Book className="h-4 w-4 text-muted-foreground/30 absolute bottom-6 right-6 group-hover:text-primary transition-all duration-300" />
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Books Issued</p>
                            <h3 className="text-3xl font-bold tracking-tight text-foreground">{activeLoansCount}</h3>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground/30 absolute bottom-6 right-6 group-hover:text-primary transition-all duration-300" />
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Inventory Items</p>
                            <h3 className="text-3xl font-bold tracking-tight text-foreground">{inventoryItems?.length || 0}</h3>
                            <Package className="h-4 w-4 text-muted-foreground/30 absolute bottom-6 right-6 group-hover:text-primary transition-all duration-300" />
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Overdue Books</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className={cn("text-3xl font-bold tracking-tight", overdueCount > 0 ? "text-destructive" : "text-foreground")}>{overdueCount}</h3>
                            </div>
                            <AlertTriangle className={cn("h-4 w-4 absolute bottom-6 right-6 transition-all duration-300", overdueCount > 0 ? "text-destructive" : "text-muted-foreground/30 group-hover:text-primary")} />
                        </div>
                    </div>
                </div>

                {/* Circulation Analytics */}
                <div className="md:col-span-12 lg:col-span-8 bg-card border border-border p-8 rounded-xl shadow-sm relative group h-full">
                    <div className="relative z-10 flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-foreground">Circulation Overview</h3>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Real-time book circulation
                            </p>
                        </div>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={circulationVelocity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#88888810" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(16,185,129,0.4)", fontSize: 9, fontWeight: "900", letterSpacing: "0.2em" }} />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{ fill: "rgba(16,185,129,0.03)" }} 
                                    contentStyle={{ backgroundColor: "#060606", border: "1px solid rgba(16,185,129,0.2)", fontSize: "9px", fontFamily: "monospace", textTransform: "uppercase" }} 
                                    itemStyle={{ color: "var(--primary)", fontWeight: "bold" }}
                                />
                                <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={60}>
                                    {circulationVelocity.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Main Tabs Surface */}
            <Tabs defaultValue="library" className="space-y-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <TabsList className="bg-muted border border-border p-1 rounded-lg h-12 w-fit">
                        <div className="flex gap-1 h-full">
                            <TabsTrigger value="library" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-4 text-sm font-medium transition-all gap-2">
                                <Library className="h-4 w-4" /> Book Catalog
                            </TabsTrigger>
                            <TabsTrigger value="transactions" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-4 text-sm font-medium transition-all gap-2">
                                <ArrowRightLeft className="h-4 w-4" /> Transactions
                            </TabsTrigger>
                            {isStaff && (
                                <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-4 text-sm font-medium transition-all gap-2">
                                    <Package className="h-4 w-4" /> Inventory
                                </TabsTrigger>
                            )}
                        </div>
                    </TabsList>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Input 
                            placeholder="Search books..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            className="h-12 pl-10 bg-background border-border font-medium rounded-lg focus:ring-1 focus:ring-primary/40 transition-all" 
                        />
                    </div>
                </div>

                <TabsContent value="library" className="animate-in slide-in-from-bottom-2 mt-0 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.length === 0 ? (
                            <div className="col-span-full py-32 text-center bg-card border border-dashed border-border rounded-xl">
                                <div className="flex flex-col items-center">
                                    <SearchCode className="h-12 w-12 mb-4 text-muted-foreground/30" />
                                    <p className="font-semibold text-muted-foreground">No books found matching search.</p>
                                </div>
                            </div>
                        ) : (
                            filteredBooks.map((book) => (
                                <div key={book.id} className="bg-card p-6 border border-border rounded-xl group hover:shadow-md hover:border-border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-auto">
                                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
                                        <Book className="h-24 w-24 text-primary rotate-12" />
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="h-10 w-10 bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all rounded-lg">
                                                <Barcode className="h-5 w-5" />
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "rounded-full font-semibold text-xs px-3 py-1",
                                                (book.available_copies || 0) > 0 ? "text-primary border-primary/20 bg-primary/10" : "text-destructive border-destructive/20 bg-destructive/10"
                                            )}>
                                                {(book.available_copies || 0) > 0 ? "In Stock" : "Out of Stock"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3 mb-6 text-left relative z-10">
                                            <h4 className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2">{book.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-medium text-muted-foreground">Author: {book.author}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border relative z-10">
                                        <div className="text-left">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Category</p>
                                            <p className="text-xs font-medium text-foreground">{book.category || "General"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Available</p>
                                            <p className="font-bold text-foreground text-sm">{book.available_copies} <span className="text-muted-foreground font-medium">/ {book.total_copies}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="transactions" className="animate-in slide-in-from-bottom-2 mt-0 outline-none">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left order-collapse">
                                <thead className="bg-muted text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider">Book</th>
                                        <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-center">Student</th>
                                        <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-center">Duration</th>
                                        <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                                        {isStaff && <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-right">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Clock className="h-10 w-10 mb-4 opacity-50" />
                                                    <p className="font-semibold text-sm">No active book loans</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions?.map((tx) => (
                                            <tr key={tx.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex items-center justify-center font-bold text-primary-foreground text-sm rounded-lg bg-primary">
                                                            {tx.book?.title?.[0] || "?"}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{tx.book?.title || "—"}</span>
                                                            <span className="text-xs text-muted-foreground">ISBN: {tx.book?.isbn || "—"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="font-medium text-foreground text-sm">{tx.student?.profile?.full_name}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex flex-col items-center gap-1 text-xs font-medium">
                                                         <span className="text-muted-foreground">Issued: {tx.issue_date}</span>
                                                         <span className={cn(new Date(tx.due_date) < new Date() ? "text-destructive font-bold" : "text-muted-foreground")}>Due: {tx.due_date}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <Badge variant="outline" className={cn(
                                                        "rounded-full font-semibold text-xs px-3 py-1",
                                                        tx.status === "issued" ? "text-amber-600 border-amber-500/30 bg-amber-500/10" : "text-primary border-primary/20 bg-primary/10"
                                                    )}>
                                                        {tx.status}
                                                    </Badge>
                                                </td>
                                                {isStaff && (
                                                    <td className="py-4 px-6 text-right">
                                                        {tx.status === "issued" && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                onClick={() => handleReturn(tx.id)} 
                                                                className="h-8 px-4 font-medium transition-all"
                                                            >
                                                                Return
                                                            </Button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="animate-in slide-in-from-bottom-2 mt-0 outline-none">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left order-collapse">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider">Item Name</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-center">Category</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-center">Stock Quantity</th>
                                    <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-right">Unit Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {inventoryItems?.length === 0 ? (
                                    <tr><td colSpan={4} className="py-24 text-center text-muted-foreground"><p className="font-semibold text-sm">No inventory items found</p></td></tr>
                                ) : (
                                    inventoryItems?.map((item) => (
                                        <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 flex items-center justify-center text-muted-foreground rounded-lg bg-muted border border-border">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-medium text-muted-foreground text-sm">{item.category || "General"}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Badge variant="outline" className={cn(
                                                    "rounded-full font-semibold text-xs px-3 py-1",
                                                    (item.quantity_in_stock || 0) <= (item.min_stock_level || 5) ? "border-destructive/30 text-destructive bg-destructive/10" : "border-primary/20 text-primary bg-primary/10"
                                                )}>
                                                    Qty: {item.quantity_in_stock}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="font-semibold text-muted-foreground text-sm tabular-nums">₹{Number(item.unit_price).toLocaleString("en-IN")}</span>
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
