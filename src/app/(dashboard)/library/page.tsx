import { createClient } from "@/lib/supabase/server";
import { LibraryDashboard } from "@/components/library/LibraryDashboard";
import { getSessionRole } from "@/lib/auth-utils";

export default async function LibraryPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let books: any[] = [];
  let transactions: any[] = [];
  let students: any[] = [];
  let inventoryItems: any[] = [];
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      const { data: studentTransactions } = await supabase
        .from("library_transactions")
        .select("*, book:library_books(*), student:students(*, profile:profiles(*))")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });
      
      transactions = studentTransactions || [];
      students = [student];

      // Students can still see all books to browse
      const { data: allBooks } = await supabase
        .from("library_books")
        .select("*")
        .order("title");
      books = allBooks || [];

      // Students potentially shouldn't see full inventory management
      inventoryItems = [];
    }
  } else {
    // Admin/Teacher: All data
    const { data: allBooks } = await supabase
      .from("library_books")
      .select("*")
      .order("title");
    books = allBooks || [];

    const { data: allTransactions } = await supabase
      .from("library_transactions")
      .select("*, book:library_books(*), student:students(*, profile:profiles(*))")
      .order("created_at", { ascending: false })
      .limit(50);
    transactions = allTransactions || [];

    const { data: allStudents } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .order("admission_number");
    students = allStudents || [];

    const { data: allInventory } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name");
    inventoryItems = allInventory || [];
  }

  return (
    <LibraryDashboard
      books={books || []}
      transactions={transactions || []}
      students={students || []}
      inventoryItems={inventoryItems || []}
      userRole={role}
    />
  );
}
