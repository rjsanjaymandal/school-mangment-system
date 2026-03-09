import { createClient } from "@/lib/supabase/server";
import { LibraryDashboard } from "@/components/library/LibraryDashboard";

export default async function LibraryPage() {
  const supabase = await createClient();

  const { data: books } = await supabase
    .from("library_books")
    .select("*")
    .order("title");

  const { data: transactions } = await supabase
    .from("library_transactions")
    .select("*, book:library_books(*), student:students(*, profile:profiles(*))")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .order("admission_number");

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name");

  return (
    <LibraryDashboard
      books={books || []}
      transactions={transactions || []}
      students={students || []}
      inventoryItems={inventoryItems || []}
    />
  );
}
