export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  capacity?: number;
  room_number?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  created_at: string;
}

export interface Student {
  id: string;
  admission_number: string;
  roll_number?: string;
  class_id?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  parent_id?: string;
  created_at: string;
  profile?: Profile;
  class?: Class;
}

export interface Teacher {
  id: string;
  employee_id: string;
  specialization?: string[];
  qualification?: string;
  joining_date?: string;
  status: "active" | "inactive";
  profile?: Profile;
}

export interface Exam {
  id: string;
  name: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  academic_year?: AcademicYear;
}

export interface Mark {
  id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  marks_obtained: number;
  max_marks: number;
  grade?: string;
  remarks?: string;
  created_at: string;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  due_date?: string;
  class_id?: string;
  description?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  status: "available" | "issued" | "lost";
  created_at: string;
}

export interface SchoolAsset {
  id: string;
  name: string;
  asset_tag: string;
  assigned_to_id?: string;
  status: "active" | "repair" | "decommissioned";
  location?: string;
  created_at: string;
  assigned_to?: Profile;
}

export interface BusRoute {
  id: string;
  name: string;
  driver_id?: string;
  plate_number?: string;
  created_at: string;
  driver?: Teacher;
}

export interface BusTelemetry {
  id: string;
  bus_route_id: string;
  latitude: number;
  longitude: number;
  speed: string;
  status: "moving" | "stopped" | "alert";
  last_updated: string;
}

export interface PerformancePrediction {
  id: string;
  student_id: string;
  predicted_grade?: string;
  predicted_score: number;
  confidence_level: number;
  insights: string[];
  created_at: string;
  student?: Student;
}

export interface Timetable {
  id: string;
  class_id: string;
  academic_year_id: string;
  day_of_week: string;
  created_at: string;
  class?: Class;
}

export interface TimetableSlot {
  id: string;
  timetable_id: string;
  subject_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  subject?: Subject;
  teacher?: Teacher;
}

export interface StaffPayroll {
  id: string;
  staff_id: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  month: number;
  year: number;
  status: "pending" | "paid";
  payment_date?: string;
  created_at: string;
  staff?: Profile;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string;
  created_at: string;
  staff?: Profile;
}

export interface InventoryItem {
  id: string;
  name: string;
  category_id?: string;
  quantity_in_stock: number;
  unit_price: number;
  sku?: string;
  created_at: string;
}

export interface LibraryTransaction {
  id: string;
  book_id: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: "issued" | "returned" | "overdue";
  created_at: string;
  book?: LibraryBook;
  student?: Student;
}

export interface StudentConduct {
  id: string;
  student_id: string;
  teacher_id?: string;
  type: "merit" | "demerit";
  points: number;
  category: "Discipline" | "Academics" | "Sports" | "Leadership";
  description?: string;
  incident_date: string;
  created_at: string;
  student?: Student;
  teacher?: Teacher;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  actor?: Profile;
}

export interface DocumentArchive {
  id: string;
  title: string;
  category: "Legal" | "Academic" | "HR" | "Financial";
  file_path: string;
  uploaded_by?: string;
  expiry_date?: string;
  version: number;
  is_encrypted: boolean;
  created_at: string;
  author?: Profile;
}

export interface HealthProfile {
  id: string;
  blood_group?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  vaccinations?: { name: string; date: string; status: string }[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface InfirmaryLog {
  id: string;
  student_id: string;
  recorded_by?: string;
  visit_reason: string;
  symptoms?: string;
  treatment_provided?: string;
  medication_given?: string;
  temperature?: number;
  check_in_time: string;
  check_out_time?: string;
  status: "under_observation" | "discharged" | "referral";
  student?: Student;
  recorder?: Profile;
}
