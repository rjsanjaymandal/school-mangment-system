import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";

export const LibraryService = {
  async getAllBooks(filters?: { category?: string; status?: string; search?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("library_books")
        .select("*")
        .order("title", { ascending: true });

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,isbn.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getBookById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("library_books")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async createBook(bookData: {
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    total_copies?: number;
    shelf_location?: string;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("library_books")
        .insert({
          ...bookData,
          total_copies: bookData.total_copies || 1,
          available_copies: bookData.total_copies || 1,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async updateBook(id: string, bookData: Partial<{
    title: string;
    author: string;
    isbn: string;
    category: string;
    total_copies: number;
    shelf_location: string;
    status: string;
  }>) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("library_books")
        .update(bookData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async deleteBook(id: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("library_books").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAvailableBooks() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("library_books")
        .select("*")
        .gt("available_copies", 0)
        .eq("status", "available")
        .order("title", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getCategories() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("library_books")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;
      const categories = [...new Set((data || []).map(b => b.category))];
      return { data: categories, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAllTransactions(filters?: { student_id?: string; book_id?: string; status?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("library_transactions")
        .select(`
          *,
          book:library_books(title, author, isbn),
          student:students(id, admission_number, profile:profiles(full_name))
        `)
        .order("issue_date", { ascending: false });

      if (filters?.student_id) query = query.eq("student_id", filters.student_id);
      if (filters?.book_id) query = query.eq("book_id", filters.book_id);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async issueBook(bookId: string, studentId: string, dueDays: number = 14) {
    try {
      const supabase = createAdminClient();
      
      const { data: book, error: bookError } = await supabase
        .from("library_books")
        .select("available_copies")
        .eq("id", bookId)
        .single();

      if (bookError) throw bookError;
      if (book.available_copies <= 0) {
        throw new Error("No copies available");
      }

      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      const { data: transaction, error: transError } = await supabase
        .from("library_transactions")
        .insert({
          book_id: bookId,
          student_id: studentId,
          issue_date: issueDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          status: 'issued'
        })
        .select()
        .single();

      if (transError) throw transError;

      await supabase
        .from("library_books")
        .update({ available_copies: book.available_copies - 1 })
        .eq("id", bookId);

      return { data: transaction, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async returnBook(transactionId: string, fineAmount: number = 0) {
    try {
      const supabase = createAdminClient();
      
      const { data: transaction, error: transError } = await supabase
        .from("library_transactions")
        .select("book_id, status")
        .eq("id", transactionId)
        .single();

      if (transError) throw transError;
      if (transaction.status === 'returned') {
        throw new Error("Book already returned");
      }

      const returnDate = new Date().toISOString().split('T')[0];
      const status = fineAmount > 0 ? 'overdue' : 'returned';

      const { data: updatedTrans, error: updateError } = await supabase
        .from("library_transactions")
        .update({
          return_date: returnDate,
          fine_amount: fineAmount,
          status
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (updateError) throw updateError;

      const { data: book } = await supabase
        .from("library_books")
        .select("available_copies")
        .eq("id", transaction.book_id)
        .single();

      await supabase
        .from("library_books")
        .update({ available_copies: (book?.available_copies || 0) + 1 })
        .eq("id", transaction.book_id);

      return { data: updatedTrans, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentTransactions(studentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("library_transactions")
        .select(`
          *,
          book:library_books(title, author, isbn)
        `)
        .eq("student_id", studentId)
        .order("issue_date", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getOverdueBooks() {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("library_transactions")
        .select(`
          *,
          book:library_books(title, author, isbn),
          student:students(id, admission_number, profile:profiles(full_name))
        `)
        .eq("status", "issued")
        .lt("due_date", today)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getLibraryStats() {
    try {
      const supabase = createClient();
      
      const { data: books } = await supabase
        .from("library_books")
        .select("total_copies, available_copies, status");

      const { data: transactions } = await supabase
        .from("library_transactions")
        .select("status");

      const totalBooks = (books || []).reduce((sum, b) => sum + b.total_copies, 0);
      const availableBooks = (books || []).reduce((sum, b) => sum + b.available_copies, 0);
      const issuedBooks = (transactions || []).filter(t => t.status === 'issued').length;
      const overdueBooks = (transactions || []).filter(t => t.status === 'overdue').length;

      return {
        data: {
          total_books: totalBooks,
          available_books: availableBooks,
          issued_books: issuedBooks,
          overdue_books: overdueBooks
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
