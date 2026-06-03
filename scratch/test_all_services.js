const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Import PayrollService logic manually to run it in node
const PayrollService = {
  async getAllPayrolls(filters) {
    let query = supabase
      .from("staff_payrolls")
      .select(`
        *,
        staff:profiles(full_name, phone, email, role)
      `)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
    if (filters?.month) query = query.eq("month", filters.month);
    if (filters?.year) query = query.eq("year", filters.year);
    if (filters?.status) query = query.eq("status", filters.status);

    return await query;
  },

  async getLeaveRequests(filters) {
    let query = supabase
      .from("leave_requests")
      .select(`
        id, staff_id, leave_type, start_date, end_date, reason, status, created_at,
        staff:profiles!leave_requests_staff_id_fkey(full_name, phone, role)
      `)
      .order("created_at", { ascending: false });

    if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
    if (filters?.status) query = query.eq("status", filters.status);

    return await query;
  },

  async getPayrollSummary(year) {
    return await supabase
      .from("staff_payrolls")
      .select("base_salary, bonuses, deductions, status")
      .eq("year", year);
  }
};

async function main() {
  console.log('Testing getAllPayrolls...');
  const res1 = await PayrollService.getAllPayrolls({ month: 6, year: 2026 });
  if (res1.error) console.error('getAllPayrolls Error:', res1.error.message);
  else console.log('getAllPayrolls Success! Row count:', res1.data.length);

  console.log('\nTesting getLeaveRequests...');
  const res2 = await PayrollService.getLeaveRequests({ status: 'pending' });
  if (res2.error) console.error('getLeaveRequests Error:', res2.error.message);
  else console.log('getLeaveRequests Success! Row count:', res2.data.length);

  console.log('\nTesting getPayrollSummary...');
  const res3 = await PayrollService.getPayrollSummary(2026);
  if (res3.error) console.error('getPayrollSummary Error:', res3.error.message);
  else console.log('getPayrollSummary Success! Row count:', res3.data.length);
}

main().catch(console.error);
