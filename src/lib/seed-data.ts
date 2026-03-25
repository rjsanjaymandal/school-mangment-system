import { createAdminClient } from "./supabase/admin";

export async function runAllSeeding() {
  const supabase = createAdminClient();

  // 1. Fetch some real students and teachers to link data
  const { data: students } = await supabase.from("students").select("id").limit(5);
  const { data: teachers } = await supabase.from("teachers").select("id").limit(3);

  if (!students || students.length === 0) {
    throw new Error("No students found in database. Cannot seed behavior/health records.");
  }

  const results = [];

  // 2. Seed Library Books
  const books = [
    { title: "Principia Mathematica", author: "Isaac Newton", isbn: "978-1607962403", category: "Science", total_copies: 5, available_copies: 5, shelf_location: "A-101" },
    { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", isbn: "978-0060883287", category: "Literature", total_copies: 3, available_copies: 3, shelf_location: "B-202" },
    { title: "The Selfish Gene", author: "Richard Dawkins", isbn: "978-0198788607", category: "Biology", total_copies: 4, available_copies: 4, shelf_location: "A-303" },
    { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", category: "Physics", total_copies: 6, available_copies: 6, shelf_location: "A-104" },
    { title: "War and Peace", author: "Leo Tolstoy", isbn: "978-0140447934", category: "Literature", total_copies: 2, available_copies: 2, shelf_location: "B-505" }
  ];

  const { error: libErr } = await supabase.from("library_books").upsert(books, { onConflict: 'isbn' });
  results.push({ module: "Library", success: !libErr, error: libErr });

  // 3. Seed Conduct Records
  const conductRecords = students.flatMap((s, i) => [
    { 
      student_id: s.id, 
      teacher_id: teachers?.[i % (teachers?.length || 1)]?.id, 
      type: "merit", 
      points: 10, 
      category: "Leadership", 
      description: "Exceptional assistance during the institutional annual meet.", 
      incident_date: new Date().toISOString().split('T')[0] 
    },
    { 
      student_id: s.id, 
      teacher_id: teachers?.[(i + 1) % (teachers?.length || 1)]?.id, 
      type: "demerit", 
      points: 5, 
      category: "Discipline", 
      description: "Protocol violation: Late arrival to the assembly hall.", 
      incident_date: new Date().toISOString().split('T')[0] 
    }
  ]);

  const { error: condErr } = await supabase.from("student_conduct").insert(conductRecords);
  results.push({ module: "Conduct", success: !condErr, error: condErr });

  // 4. Seed Health/Infirmary Logs
  const healthLogs = students.map((s, i) => ({
    student_id: s.id,
    visit_reason: i % 2 === 0 ? "Seasonal Fever" : "Sports Injury",
    symptoms: i % 2 === 0 ? "Elevated temperature, headache" : "Minor ankle sprain",
    temperature: i % 2 === 0 ? 101.2 : 98.6,
    treatment_provided: i % 2 === 0 ? "Rest and hydration protocol" : "Ice pack applied and bandaged",
    status: i % 2 === 0 ? "under_observation" : "discharged"
  }));

  const { error: healthErr } = await supabase.from("infirmary_logs").insert(healthLogs);
  results.push({ module: "Health", success: !healthErr, error: healthErr });

  return results;
}
