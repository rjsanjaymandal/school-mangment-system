export type UserRole = "admin" | "teacher" | "student" | "parent" | "staff";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  profile?: Profile;
  profile_id: string;
  admission_number: string;
  roll_number?: string;
  class_id?: string;
  section?: string;
  admission_date?: string;
  status: "active" | "dropped" | "alumni" | "transferred";
  category?: string;
  religion?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  mother_tongue?: string;
  rte_status?: boolean;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  grade_level?: number;
  class_teacher_id?: string;
  academic_year?: string;
  room_number?: string;
  capacity?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  class_id: string;
  teacher_id?: string;
  description?: string;
  max_marks: number;
  pass_marks: number;
}

export interface Staff {
  id: string;
  profile?: Profile;
  profile_id: string;
  staff_id: string;
  department_id?: string;
  designation_id?: string;
  join_date?: string;
  salary?: number;
  status: "active" | "inactive" | "on_leave" | "terminated";
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  head_id?: string;
}

export interface Designation {
  id: string;
  name: string;
  department_id?: string;
  level?: number;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  period_id?: string;
  notes?: string;
  marked_by?: string;
  marked_at?: string;
}

export interface Exam {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  max_marks: number;
  passing_marks: number;
  type: "terminal" | "midterm" | "unit" | "final";
  academic_year?: string;
}

export interface Marks {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade?: string;
  remarks?: string;
  entered_by?: string;
  entered_at?: string;
}

export interface FeeStructure {
  id: string;
  class_id: string;
  fee_type: string;
  amount: number;
  academic_year: string;
  due_date?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_structure_id?: string;
  amount_paid: number;
  payment_date: string;
  payment_mode: "cash" | "card" | "bank_transfer" | "upi" | "cheque";
  transaction_id?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  received_by?: string;
  notes?: string;
}

export interface LibraryBook {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  category?: string;
  total_copies: number;
  available_copies: number;
  shelf_location?: string;
}

export interface LibraryTransaction {
  id: string;
  book_id: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: "issued" | "returned" | "overdue";
  issued_by?: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  stops: TransportStop[];
}

export interface TransportStop {
  id: string;
  name: string;
  arrival_time?: string;
  distance_km?: number;
  fee?: number;
}

export interface TransportAssignment {
  id: string;
  student_id: string;
  route_id: string;
  stop_id: string;
  status: "active" | "inactive";
}

export interface StudentDocument {
  id: string;
  student_id: string;
  document_type: string;
  file_path?: string;
  file_name?: string;
  uploaded_at?: string;
  verified?: boolean;
  verified_by?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  posted_by: string;
  posted_at: string;
  expires_at?: string;
  priority: "low" | "medium" | "high";
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject?: string;
  content: string;
  sent_at: string;
  read_at?: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  academic_year: string;
  term: string;
  grade: string;
  points: number;
}

export interface StudentConduct {
  id: string;
  student_id: string;
  type: "merit" | "demerit";
  points: number;
  reason: string;
  recorded_by: string;
  recorded_at: string;
}

export interface HealthRecord {
  id: string;
  student_id: string;
  type: "checkup" | "vaccination" | "illness" | "injury";
  description: string;
  date: string;
  doctor_name?: string;
  follow_up_date?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity_in_stock: number;
  min_stock_level: number;
  unit_price?: number;
  supplier?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  start_date: string;
  end_date?: string;
  location?: string;
}

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};