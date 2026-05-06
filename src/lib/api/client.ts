import { createClient } from "@/lib/supabase/client";

function getSupabase() {
  return createClient();
}

export const students = {
  async list(classId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("students")
      .select(`*, profile:profiles(*), class:classes(name)`)
      .order("roll_number", { ascending: true });
    
    if (classId) query = query.eq("class_id", classId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async get(id: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("students")
      .select(`*, profile:profiles(*), class:classes(name)`)
      .eq("id", id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as any;
  },

  async create(student: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("students")
      .insert(student)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, student: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("students")
      .update(student)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
};

export const classes = {
  async list() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async get(id: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async create(classData: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("classes")
      .insert(classData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, classData: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("classes")
      .update(classData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
};

export const subjects = {
  async list(classId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("subjects")
      .select(`*, class:classes(name), teacher:profiles(full_name)`)
      .order("name", { ascending: true });
    
    if (classId) query = query.eq("class_id", classId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async create(subject: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("subjects")
      .insert(subject)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, subject: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("subjects")
      .update(subject)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
};

export const staff = {
  async list() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select(`*, profile:profiles(*), department:departments(name), designation:designations(name)`)
      .order("created_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async get(id: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select(`*, profile:profiles(*), department:departments(name), designation:designations(name)`)
      .eq("id", id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as any;
  },

  async create(staffData: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .insert(staffData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, staffData: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .update(staffData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const attendance = {
  async getByDate(date: string, classId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("attendance")
      .select(`*, student:students(id, roll_number, profile:profiles(full_name))`)
      .eq("date", date);
    
    if (classId) query = query.eq("student.class_id", classId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async mark(records: { student_id: string; date: string; status: string }[]) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("attendance")
      .upsert(records, { onConflict: "student_id,date" })
      .select();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const exams = {
  async list(classId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("exams")
      .select(`*, class:classes(name), subject:subjects(name)`)
      .order("exam_date", { ascending: false });
    
    if (classId) query = query.eq("class_id", classId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async get(id: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("exams")
      .select(`*, class:classes(name), subject:subjects(name)`)
      .eq("id", id)
      .single();
    
    if (error) throw new Error(error.message);
    return data as any;
  },

  async create(exam: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("exams")
      .insert(exam)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const marks = {
  async getByExam(examId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("marks")
      .select(`*, student:students(id, roll_number, profile:profiles(full_name))`)
      .eq("exam_id", examId);
    
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async upsert(records: any[]) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("marks")
      .upsert(records, { onConflict: "exam_id,student_id" })
      .select();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const fees = {
  async list(studentId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("fee_structures")
      .select(`*, class:classes(name)`)
      .order("due_date", { ascending: true });
    
    if (studentId) query = query.eq("student_id", studentId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async create(fee: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("fee_structures")
      .insert(fee)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const payments = {
  async list(studentId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("payments")
      .select(`*, student:students(id, admission_number, profile:profiles(full_name))`)
      .order("payment_date", { ascending: false });
    
    if (studentId) query = query.eq("student_id", studentId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async create(payment: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const library = {
  async books() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("library_books")
      .select("*")
      .order("title", { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async transactions(studentId?: string) {
    const supabase = await getSupabase();
    let query = supabase
      .from("library_transactions")
      .select(`*, book:library_books(title), student:students(id, profile:profiles(full_name))`)
      .order("issue_date", { ascending: false });
    
    if (studentId) query = query.eq("student_id", studentId);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as any[];
  }
};

export const documents = {
  async list(studentId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", studentId)
      .order("uploaded_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async create(doc: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("student_documents")
      .insert(doc)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const supabase = await getSupabase();
    const { error } = await supabase.from("student_documents").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
};

export const departments = {
  async list() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async create(dept: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("departments")
      .insert(dept)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const designations = {
  async list() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("designations")
      .select(`*, department:departments(name)`)
      .order("level", { ascending: true });
    
    if (error) throw new Error(error.message);
    return data as any[];
  },

  async create(desig: any) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("designations")
      .insert(desig)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
};

export const counts = {
  async students() {
    const supabase = await getSupabase();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");
    
    if (error) throw new Error(error.message);
    return count || 0;
  },

  async teachers() {
    const supabase = await getSupabase();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher");
    
    if (error) throw new Error(error.message);
    return count || 0;
  },

  async staff() {
    const supabase = await getSupabase();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "staff");
    
    if (error) throw new Error(error.message);
    return count || 0;
  }
};