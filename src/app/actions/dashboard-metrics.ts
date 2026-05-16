"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  // Parallelize all aggregation queries
  const [
    studentAttRes,
    staffAttRes,
    collectionsRes,
    expensesRes,
    payrollRes,
    academicRes,
    transportRes,
    demographicsRes
  ] = await Promise.all([
    // 1. Student Attendance (Today)
    supabase.from("attendance").select("status").eq("date", today),
    
    // 2. Staff Attendance (Today)
    supabase.from("staff_attendance").select("status").eq("date", today),
    
    // 3. Today's Fee Collection
    supabase.from("payments").select("amount_paid").eq("payment_date", today).eq("status", "completed"),
    
    // 4. Today's Operational Expenses
    supabase.from("transactions").select("amount").eq("date", today).eq("type", "expense"),
    
    // 5. Staff Payroll Tracker (Current Month)
    supabase.from("staff_payrolls").select("base_salary, net_pay, status"),
    
    // 6. Academic Footprint
    Promise.all([
      supabase.from("classes").select("*", { count: "exact", head: true }),
      supabase.from("departments").select("*", { count: "exact", head: true })
    ]),
    
    // 7. Transport Fleet Status
    Promise.all([
      supabase.from("transport_vehicles").select("*", { count: "exact", head: true }),
      supabase.from("transport_routes").select("*", { count: "exact", head: true }),
      supabase.from("student_transport").select("*", { count: "exact", head: true })
    ]),
    
    // 8. Advanced Demographics
    supabase.from("students").select("mother_tongue, category, gender")
  ]);

  // Process data
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
  const motherTongueDist = demoData.reduce((acc: any, s) => {
    const mt = s.mother_tongue || "Other";
    acc[mt] = (acc[mt] || 0) + 1;
    return acc;
  }, {});

  const categoryDist = demoData.reduce((acc: any, s) => {
    const cat = s.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return {
    attendance: {
      student: {
        present: studentAtt.filter(a => a.status === "present").length,
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
      motherTongue: Object.entries(motherTongueDist).map(([name, value]) => ({ name, value })),
      category: Object.entries(categoryDist).map(([name, value]) => ({ name, value }))
    }
  };
}
