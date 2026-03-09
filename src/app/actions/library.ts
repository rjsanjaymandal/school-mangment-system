"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== LIBRARY BOOKS =====

export async function createBook(data: {
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    total_copies?: number;
    shelf_location?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("library_books").insert({
            ...data,
            available_copies: data.total_copies || 1,
        });
        if (error) throw error;
        revalidatePath("/library");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateBook(id: string, data: Partial<{
    title: string;
    author: string;
    isbn: string;
    category: string;
    total_copies: number;
    shelf_location: string;
}>) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("library_books").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/library");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteBook(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("library_books").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/library");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== BOOK ISSUE / RETURN =====

export async function issueBook(data: { book_id: string; student_id: string; due_date: string }) {
    try {
        const supabase = createAdminClient();

        // Check availability
        const { data: book, error: bookErr } = await supabase
            .from("library_books")
            .select("available_copies")
            .eq("id", data.book_id)
            .single();

        if (bookErr) throw bookErr;
        if (!book || book.available_copies <= 0) {
            return { success: false, error: "No copies available for this book." };
        }

        // Create transaction
        const { error: txErr } = await supabase.from("library_transactions").insert({
            book_id: data.book_id,
            student_id: data.student_id,
            due_date: data.due_date,
            status: "issued",
        });
        if (txErr) throw txErr;

        // Decrement available copies
        const { error: updateErr } = await supabase
            .from("library_books")
            .update({ available_copies: book.available_copies - 1 })
            .eq("id", data.book_id);
        if (updateErr) throw updateErr;

        revalidatePath("/library");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function returnBook(transactionId: string) {
    try {
        const supabase = createAdminClient();

        // Get transaction
        const { data: tx, error: txErr } = await supabase
            .from("library_transactions")
            .select("*, book:library_books(*)")
            .eq("id", transactionId)
            .single();

        if (txErr) throw txErr;
        if (!tx) return { success: false, error: "Transaction not found." };

        // Calculate fine
        const dueDate = new Date(tx.due_date);
        const today = new Date();
        let fine = 0;
        if (today > dueDate) {
            const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            fine = diffDays * 5; // ₹5 per day
        }

        // Update transaction
        const { error: updateTxErr } = await supabase
            .from("library_transactions")
            .update({
                return_date: today.toISOString().split("T")[0],
                fine_amount: fine,
                status: "returned",
            })
            .eq("id", transactionId);
        if (updateTxErr) throw updateTxErr;

        // Increment available copies
        const { error: updateBookErr } = await supabase
            .from("library_books")
            .update({ available_copies: (tx.book?.available_copies || 0) + 1 })
            .eq("id", tx.book_id);
        if (updateBookErr) throw updateBookErr;

        revalidatePath("/library");
        return { success: true, fine };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
