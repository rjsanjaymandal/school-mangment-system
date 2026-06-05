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
    Activity,
    SearchCode,
    Barcode,
    UserPlus,
    Calendar,
    Save,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createBook, issueBook, returnBook } from "@/app/actions/library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import {
    BarChart, Bar,
    ResponsiveContainer, Tooltip,
    XAxis, YAxis, CartesianGrid, Cell
} from "recharts";

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
    const [activeTab, setActiveTab] = useState<"library" | "transactions" | "inventory">("library");

    const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "", total_copies: "1", shelf_location: "" });
    const [issueForm, setIssueForm] = useState({ book_id: "", student_id: "", due_date: "" });

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
            toast.error("Title and Author are required");
            return;
        }
        setLoading(true);
        const result = await createBook({ ...bookForm, total_copies: parseInt(bookForm.total_copies) || 1 });
        setLoading(false);
        if (result.success) {
            toast.success("Book added successfully");
            setIsAddBookOpen(false);
            setBookForm({ title: "", author: "", isbn: "", category: "", total_copies: "1", shelf_location: "" });
            router.refresh();
        } else {
            toast.error(result.error || "Failed to add book");
        }
    };

    const handleIssueBook = async () => {
        if (!issueForm.book_id || !issueForm.student_id) {
            toast.error("Book and Student must be selected");
            return;
        }
        setLoading(true);
        const result = await issueBook(issueForm);
        setLoading(false);
        if (result.success) {
            toast.success("Book issued successfully");
            setIsIssueOpen(false);
            setIssueForm({ book_id: "", student_id: "", due_date: "" });
            router.refresh();
        } else {
            toast.error(result.error || "Issue failed");
        }
    };

    const handleReturn = async (txId: string) => {
        setLoading(true);
        const result = await returnBook(txId);
        setLoading(false);
        if (result.success) {
            toast.success("Book returned");
            router.refresh();
        } else {
            toast.error(result.error || "Return failed");
        }
    };

    const filteredBooks = (books || []).filter(
        (b) => (b.title?.toLowerCase() || "").includes(search.toLowerCase()) || (b.author?.toLowerCase() || "").includes(search.toLowerCase())
    );

    const activeLoansCount = transactions?.filter(t => t.status === "issued").length || 0;
    const overdueCount = transactions?.filter(t => t.status === "issued" && new Date(t.due_date) < new Date()).length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Library className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Library Management</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage library catalog, inventory, and book issues</p>
                    </div>
                </div>

                {isStaff && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsIssueOpen(true)}
                            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                        >
                            <ArrowRightLeft className="h-4 w-4 inline mr-2" /> Issue Book
                        </button>
                        <button
                            onClick={() => setIsAddBookOpen(true)}
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all"
                        >
                            <Plus className="h-4 w-4 inline mr-2" /> Add Book
                        </button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Books" value={books?.length || 0} icon={Book} color="blue" description="Catalog entries" />
                <DashboardStatCard title="Books Issued" value={activeLoansCount} icon={ArrowRightLeft} color="amber" description="Active loans" />
                <DashboardStatCard title="Inventory Items" value={inventoryItems?.length || 0} icon={Package} color="purple" description="Library supplies" />
                <DashboardStatCard title="Overdue Books" value={overdueCount} icon={AlertTriangle} color="rose" description="Past due date" />
            </div>

            {/* Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Circulation Overview</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Real-time book circulation</p>
                        </div>
                        <Activity className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={circulationVelocity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9, fontWeight: "900", letterSpacing: "0.2em" }} />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{ fill: "var(--muted)" }} 
                                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "10px" }}
                                    labelStyle={{ color: "var(--foreground)" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                                    {circulationVelocity.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("library")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === "library" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Library className="h-4 w-4 inline mr-2" /> Book Catalog
                    </button>
                    <button
                        onClick={() => setActiveTab("transactions")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === "transactions" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <ArrowRightLeft className="h-4 w-4 inline mr-2" /> Transactions
                    </button>
                    {isStaff && (
                        <button
                            onClick={() => setActiveTab("inventory")}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === "inventory" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Package className="h-4 w-4 inline mr-2" /> Inventory
                        </button>
                    )}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search books..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Library Tab */}
            {activeTab === "library" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredBooks.length === 0 ? (
                        <div className="col-span-full py-16 text-center">
                            <SearchCode className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No books found matching search.</p>
                        </div>
                    ) : (
                        filteredBooks.map((book) => (
                            <div key={book.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                        <Barcode className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                        (book.available_copies || 0) > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
                                    )}>
                                        {(book.available_copies || 0) > 0 ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4 flex-1">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{book.title}</h4>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Author: {book.author}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{book.category || "General"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available</p>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{book.available_copies} <span className="text-slate-400">/ {book.total_copies}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Book</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Student</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Duration</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                                    {isStaff && <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                                {transactions?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <Clock className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No active book loans</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions?.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                        {tx.book?.title?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{tx.book?.title || "-"}</span>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ISBN: {tx.book?.isbn || "-"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{tx.student?.profile?.full_name}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col gap-1 text-xs font-bold">
                                                    <span className="text-slate-500 dark:text-slate-400">Issued: {tx.issue_date}</span>
                                                    <span className={cn(new Date(tx.due_date) < new Date() ? "text-red-600" : "text-slate-500")}>Due: {tx.due_date}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    tx.status === "issued" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            {isStaff && (
                                                <td className="py-4 px-4 text-right">
                                                    {tx.status === "issued" && (
                                                        <button
                                                            onClick={() => handleReturn(tx.id)}
                                                            className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[9px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                                        >
                                                            Return
                                                        </button>
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
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-left">Item Name</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Category</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Stock Quantity</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Unit Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                            {inventoryItems?.length === 0 ? (
                                <tr><td colSpan={4} className="py-16 text-center"><p className="text-sm font-bold text-slate-500 dark:text-slate-400">No inventory items found</p></td></tr>
                            ) : (
                                inventoryItems?.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                                </div>
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.category || "General"}</span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                (item.quantity_in_stock || 0) <= (item.min_stock_level || 5) ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            )}>
                                                Qty: {item.quantity_in_stock}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="font-bold text-sm text-slate-500 dark:text-slate-400 tabular-nums">₹{Number(item.unit_price).toLocaleString("en-IN")}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Issue Book Modal */}
            {isIssueOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Issue Book</h3>
                            <button onClick={() => setIsIssueOpen(false)} className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center">
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Select Book</label>
                                <select
                                    value={issueForm.book_id}
                                    onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                >
                                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Search book...</option>
                                    {books.filter(b => (b.available_copies || 0) > 0).map(b => (
                                        <option key={b.id} value={b.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{b.title} [{b.available_copies} Available]</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Select Student</label>
                                <select
                                    value={issueForm.student_id}
                                    onChange={(e) => setIssueForm({ ...issueForm, student_id: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                >
                                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Search student...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{s.profile?.full_name} #{s.admission_number}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Due Date</label>
                                <Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                            </div>
                            <button
                                onClick={handleIssueBook}
                                disabled={loading}
                                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Issue Book"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Book Modal */}
            {isAddBookOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Add New Book</h3>
                            <button onClick={() => setIsAddBookOpen(false)} className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center">
                                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Book Title</label>
                                    <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Title..." className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Author</label>
                                    <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author..." className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">ISBN</label>
                                <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="ISBN..." className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Category</label>
                                    <Input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} placeholder="General..." className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Total Copies</label>
                                    <Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Shelf Location</label>
                                <Input value={bookForm.shelf_location} onChange={(e) => setBookForm({ ...bookForm, shelf_location: e.target.value })} placeholder="e.g. A-12" className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                            </div>
                            <button
                                onClick={handleCreateBook}
                                disabled={loading}
                                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Book"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}