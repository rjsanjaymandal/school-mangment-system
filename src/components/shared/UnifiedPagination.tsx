"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UnifiedPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    onItemsPerPageChange?: (size: number) => void;
    className?: string;
    itemName?: string;
}

export function UnifiedPagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    onItemsPerPageChange,
    className,
    itemName = "records"
}: UnifiedPaginationProps) {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={cn(
            "flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100",
            className
        )}>
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Records Overview
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                        Showing <span className="text-slate-900 dark:text-white font-black">{startItem}-{endItem}</span> of <span className="text-slate-900 dark:text-white font-black">{totalItems}</span> {itemName}
                    </span>
                </div>

                {onItemsPerPageChange && (
                    <div className="hidden md:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Per Page:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(val) => onItemsPerPageChange(parseInt(val))}
                        >
                            <SelectTrigger className="h-8 w-16 text-[10px] font-black rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 shadow-sm">
                                <SelectValue placeholder={itemsPerPage.toString()} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
                                {[10, 20, 50, 100].map(size => (
                                    <SelectItem key={size} value={size.toString()} className="text-[10px] font-bold rounded-lg cursor-pointer">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-white hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm group"
                >
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                </Button>

                <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "ghost"}
                                size="sm"
                                onClick={() => onPageChange(pageNum)}
                                className={cn(
                                    "h-9 min-w-[36px] rounded-xl text-[10px] font-black transition-all",
                                    currentPage === pageNum 
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                                )}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                            <span className="text-slate-300 px-1 font-black">...</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPageChange(totalPages)}
                                className="h-9 min-w-[36px] rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 hover:bg-white hover:text-slate-900"
                            >
                                {totalPages}
                            </Button>
                        </>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-white hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm group"
                >
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
