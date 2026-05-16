"use server";

import { createClient } from "@/lib/supabase/server";

export type DashboardAlert = {
  id: string;
  type: 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  action?: string;
};

export type DashboardMetrics = {
  counts: {
    students: number;
    teachers: number;
    books: number;
    loans: number;
  };
  attendance: {
    student: {
      present: number;
      absent: number;
      leave: number;
      total: number;
    };
    staff: {
      present: number;
      absent: number;
      leave: number;
      total: number;
    };
  };
  finance: {
    todayCollection: number;
    todayExpenses: number;
    payroll: {
      generated: number;
      paid: number;
      pending: number;
    };
  };
  footprint: {
    classes: number;
    departments: number;
    transport: {
      vehicles: number;
      routes: number;
      students: number;
    };
  };
  demographics: {
    motherTongue: { name: string; value: number }[];
    category: { name: string; value: number }[];
  };
  alerts: DashboardAlert[];
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Parallelize all aggregation queries
  const [
    studentAttRes,
    staffAttRes,
    collectionsRes,
    expensesRes,
    payrollRes,
    academicRes,
    transportRes,
    demographicsRes,
    studentCountRes,
    teacherCountRes,
    totalBooksRes,
    activeLoansRes,
    // New queries for Smart Alerts
    lowInventoryRes,
    overdueBooksRes
  ] = await Promise.all([
    supabase.from("attendance").select("status").eq("date", today),
    supabase.from("staff_attendance").select("status").eq("date", today),
    supabase.from("payments").select("amount_paid").eq("payment_date", today).eq("status", "completed"),
    supabase.from("transactions").select("amount").eq("date", today).eq("type", "expense"),
    supabase.from("staff_payrolls").select("base_salary, net_pay, status"),
    Promise.all([
      supabase.from("classes").select("*", { count: "exact", head: true }),
      supabase.from("departments").select("*", { count: "exact", head: true })
    ]),
    Promise.all([
      supabase.from("transport_vehicles").select("*", { count: "exact", head: true }),
      supabase.from("transport_routes").select("*", { count: "exact", head: true }),
      supabase.from("student_transport").select("*", { count: "exact", head: true })
    ]),
    supabase.from("students").select("mother_tongue, category, gender"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("library_books").select("*", { count: "exact", head: true }),
    supabase.from("library_transactions").select("*", { count: "exact", head: true }).eq("status", "issued"),
    
    // Alert specific data
    supabase.from("inventory_items").select("name, quantity_in_stock, min_stock_level").filter("quantity_in_stock", "lt", "min_stock_level"),
    supabase.from("library_transactions").select("*", { count: "exact", head: true }).eq("status", "issued").lt("due_date", today)
  ]);

  // Process core data
  const studentAtt = studentAttRes.data || [];
  const staffAtt = staffAttRes.data || [];
  const collections = (collectionsRes.data || []).reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);
  const expenses = (expensesRes.data || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  const payrollData = payrollRes.data || [];
  const salaryGenerated = payrollData.reduce((sum, p) => sum + (Number(p.net_pay) || 0), 0);
  const salaryPaid = payrollData.filter(p => p.status === "paid").reduce((sum, p) => sum + (Number(p.net_pay) || 0), 0);
  
  const [classesCount, departmentsCount] = academicRes.map(r => r.count || 0);
  const [vehiclesCount, routesCount, studentTransportCount] = transportRes.map(r => r.count || 0);

  // Demographics processing
  const demoData = demographicsRes.data || [];
  const motherTongueDist = demoData.reduce((acc: Record<string, number>, s) => {
    const mt = s.mother_tongue || "Other";
    acc[mt] = (acc[mt] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryDist = demoData.reduce((acc: Record<string, number>, s) => {
    const cat = s.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- SMART ALERT LOGIC ---
  const alerts: DashboardAlert[] = [];

  // 1. Attendance Alert
  const studentPresentCount = studentAtt.filter(a => a.status === "present").length;
  const attendanceRate = studentAtt.length > 0 ? (studentPresentCount / studentAtt.length) * 100 : 100;
  if (attendanceRate < 80 && studentAtt.length > 0) {
    alerts.push({
      id: 'low-attendance',
      type: 'warning',
      title: 'Low Student Attendance',
      description: `Only ${attendanceRate.toFixed(1)}% of students are present today. Consider checking for local issues.`,
      action: 'View Attendance'
    });
  }

  // 2. Payroll Alert
  const pendingSalary = salaryGenerated - salaryPaid;
  if (pendingSalary > 0) {
    alerts.push({
      id: 'pending-payroll',
      type: 'critical',
      title: 'Unpaid Staff Salaries',
      description: `₹${pendingSalary.toLocaleString()} is pending for staff payroll this month.`,
      action: 'Manage Payroll'
    });
  }

  // 3. Inventory Alert
  const lowStockItems = lowInventoryRes.data || [];
  if (lowStockItems.length > 0) {
    alerts.push({
      id: 'low-inventory',
      type: 'critical',
      title: 'Low Inventory Stock',
      description: `${lowStockItems.length} items (including ${lowStockItems[0].name}) are below minimum stock levels.`,
      action: 'Restock'
    });
  }

  // 4. Library Alert
  const overdueCount = overdueBooksRes.count || 0;
  if (overdueCount > 0) {
    alerts.push({
      id: 'overdue-books',
      type: 'info',
      title: 'Overdue Library Books',
      description: `${overdueCount} books are currently past their return deadline.`,
      action: 'View Loans'
    });
  }

  return {
    counts: {
      students: studentCountRes.count || 0,
      teachers: teacherCountRes.count || 0,
      books: totalBooksRes.count || 0,
      loans: activeLoansRes.count || 0,
    },
    attendance: {
      student: {
        present: studentPresentCount,
        absent: studentAtt.filter(a => a.status === "absent").length,
        leave: studentAtt.filter(a => a.status === "leave").length,
        total: studentAtt.length
      },
      staff: {
        present: staffAtt.filter(a => a.status === "present").length,
        absent: staffAtt.filter(a => a.status === "absent").length,
        leave: staffAtt.filter(a => a.status === "leave" || a.status === "on leave").length,
        total: staffAtt.length
      }
    },
    finance: {
      todayCollection: collections,
      todayExpenses: expenses,
      payroll: {
        generated: salaryGenerated,
        paid: salaryPaid,
        pending: salaryGenerated - salaryPaid
      }
    },
    footprint: {
      classes: classesCount,
      departments: departmentsCount,
      transport: {
        vehicles: vehiclesCount,
        routes: routesCount,
        students: studentTransportCount
      }
    },
    demographics: {
      motherTongue: Object.entries(motherTongueDist).map(([name, value]) => ({ name, value: Number(value) })),
      category: Object.entries(categoryDist).map(([name, value]) => ({ name, value: Number(value) }))
    },
    alerts
  };
}
