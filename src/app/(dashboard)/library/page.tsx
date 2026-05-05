export const revalidate = 30;
export const dynamic = 'force-static';

import { createClient } from "@/lib/supabase/server";
import { LibraryDashboard } from "@/components/library/LibraryDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

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

      const { data: allBooks } = await supabase
        .from("library_books")
        .select("*")
        .order("title");
      books = allBooks || [];

      inventoryItems = [];
    }
  } else {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-50 rounded-md">
            <Library className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Library</h1>
            <p className="text-sm text-slate-500">Manage books and borrowings</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      <ERPCard
        title="Library Management"
        description="Book inventory and transactions"
        icon={<Library className="h-5 w-5" />}
        color="blue"
      >
        <LibraryDashboard
          books={books || []}
          transactions={transactions || []}
          students={students || []}
          inventoryItems={inventoryItems || []}
          userRole={role}
        />
      </ERPCard>
    </div>
  );
}
