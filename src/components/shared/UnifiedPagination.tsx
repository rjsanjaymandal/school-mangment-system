"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnifiedPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    className?: string;
    itemName?: string;
}

export function UnifiedPagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    className,
    itemName = "records"
}: UnifiedPaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={cn(
            "flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm mt-6",
            className
        )}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{startItem}</span> - <span className="text-slate-900">{endItem}</span> of <span className="text-slate-900">{totalItems}</span> {itemName}
            </div>
            
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4 text-slate-500" />
                </Button>

                <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                            return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, idx, arr) => {
                            const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                            return (
                                <div key={page} className="flex items-center gap-1.5">
                                    {showEllipsis && <span className="text-slate-300 font-black">...</span>}
                                    <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        className={cn(
                                            "h-9 w-9 p-0 rounded-xl text-[10px] font-black transition-all",
                                            currentPage === page 
                                                ? "bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200" 
                                                : "border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-500"
                                        )}
                                        onClick={() => onPageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                </div>
                            );
                        })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                </Button>
            </div>
        </div>
    );
}
