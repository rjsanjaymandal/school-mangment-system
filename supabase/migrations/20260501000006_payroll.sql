-- Accounts & Payroll Module for Edu Maysan
-- Run this in Supabase SQL Editor

-- 1. Payroll History Table
CREATE TABLE IF NOT EXISTS payroll_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
  
  -- Salary Components
  base_salary NUMERIC(12, 2) NOT NULL,
  working_days INTEGER NOT NULL DEFAULT 26,
  days_present INTEGER NOT NULL DEFAULT 26,
  days_absent INTEGER NOT NULL DEFAULT 0,
  days_leave INTEGER DEFAULT 0,
  
  -- Deductions
  absence_deduction NUMERIC(12, 2) DEFAULT 0,
  leave_deduction NUMERIC(12, 2) DEFAULT 0,
  late_deduction NUMERIC(12, 2) DEFAULT 0,
  other_deductions NUMERIC(12, 2) DEFAULT 0,
  
  -- Additions
  bonus NUMERIC(12, 2) DEFAULT 0,
  allowances NUMERIC(12, 2) DEFAULT 0,
  other_additions NUMERIC(12, 2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid')),
  payment_date DATE,
  payment_mode VARCHAR(20) DEFAULT 'bank_transfer' CHECK (payment_mode IN ('cash', 'bank_transfer', 'cheque')),
  transaction_id VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

-- 2. Transactions Table (Day Book)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  voucher_no VARCHAR(50) UNIQUE,
  
  -- Transaction Type
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'fee_collection', 'salary', 'investment', 'refund')),
  category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(50),
  
  -- Amount
  amount NUMERIC(12, 2) NOT NULL,
  
  -- Payment Mode
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('cash', 'bank', 'upi', 'card', 'cheque')),
  
  -- Description
  description TEXT,
  reference_no VARCHAR(100),
  
  -- Related Records
  related_staff_id UUID REFERENCES staff(id),
  related_student_id UUID REFERENCES students(id),
  related_fee_id UUID REFERENCES fee_structures(id),
  related_payment_id UUID REFERENCES payments(id),
  
  -- Balance
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Salary Settings Table
CREATE TABLE IF NOT EXISTS salary_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value NUMERIC(12, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert default salary settings
INSERT INTO salary_settings (key, value, description) VALUES
  ('per_day_salary', 0, 'Calculated as base_salary / working_days'),
  ('per_day_leave_deduction', 1, 'Number of days deducted per leave'),
  ('per_day_absence_deduction', 1, 'Number of days deducted per absence'),
  ('late_coming_deduction', 50, 'Amount deducted per late coming incident'),
  ('provident_fund_rate', 12, 'PF deduction percentage'),
  ('professional_tax', 200, 'Monthly professional tax')
ON CONFLICT (key) DO NOTHING;

-- 5. Create Indexes
CREATE INDEX idx_payroll_staff ON payroll_history(staff_id, year, month);
CREATE INDEX idx_payroll_status ON payroll_history(status);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_mode ON transactions(mode);

-- 6. Create Real-time Balance View
CREATE OR REPLACE VIEW current_cash_balance AS
SELECT 
  COALESCE(SUM(CASE WHEN type IN ('income', 'fee_collection') AND mode = 'cash' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'expense' AND mode = 'cash' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'salary' AND mode = 'cash' THEN amount ELSE 0 END), 0) AS cash_in_hand,
  
  COALESCE(SUM(CASE WHEN type IN ('income', 'fee_collection') AND mode IN ('bank', 'upi', 'card', 'cheque') THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'expense' AND mode IN ('bank', 'upi', 'card', 'cheque') THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'salary' AND mode IN ('bank', 'upi', 'card', 'cheque') THEN amount ELSE 0 END), 0) AS bank_balance,
  
  NOW() AS updated_at
FROM transactions
WHERE date >= '2024-01-01';

-- 7. Create Monthly Summary View
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT 
  date_trunc('month', date)::date AS month,
  
  -- Income
  COALESCE(SUM(CASE WHEN type = 'fee_collection' THEN amount ELSE 0 END), 0) AS fee_collection,
  COALESCE(SUM(CASE WHEN type = 'income' AND category = 'admission' THEN amount ELSE 0 END), 0) AS admission_fees,
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS other_income,
  
  -- Expenses
  COALESCE(SUM(CASE WHEN type = 'salary' THEN amount ELSE 0 END), 0) AS salary_paid,
  COALESCE(SUM(CASE WHEN type = 'expense' AND category = 'infrastructure' THEN amount ELSE 0 END), 0) AS infrastructure,
  COALESCE(SUM(CASE WHEN type = 'expense' AND category = 'operations' THEN amount ELSE 0 END), 0) AS operations,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
  
  -- Balance
  COALESCE(SUM(CASE WHEN type IN ('income', 'fee_collection') THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type IN ('expense', 'salary') THEN amount ELSE 0 END), 0) AS net_balance
  
FROM transactions
WHERE date >= '2024-01-01'
GROUP BY date_trunc('month', date)
ORDER BY month DESC;

-- 8. Enable RLS
ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_settings ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
CREATE POLICY "Admin full access to payroll" ON payroll_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'principal') AND is_active = true)
  );

CREATE POLICY "Admin full access to transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'principal', 'clerk') AND is_active = true)
  );

CREATE POLICY "Admin access to salary settings" ON salary_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- 10. Function to generate voucher number
CREATE OR REPLACE FUNCTION generate_voucher_no(prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  sequence_no INTEGER;
  voucher_text TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(voucher_no FROM 7 FOR 4) AS INTEGER)), 0) + 1
  INTO sequence_no
  FROM transactions
  WHERE voucher_no LIKE prefix || current_year || '%';
  
  voucher_text := prefix || current_year || LPAD(sequence_no::TEXT, 4, '0');
  RETURN voucher_text;
END;
$$ LANGUAGE plpgsql;

-- 11. Function to process salary
CREATE OR REPLACE FUNCTION process_monthly_salary(p_month INTEGER, p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
  staff_record RECORD;
  per_day_salary NUMERIC(12, 2) := 0;
  per_day_deduction NUMERIC(12, 2) := 0;
  working_days INTEGER := 26;
  total_processed INTEGER := 0;
BEGIN
  -- Get salary settings
  SELECT COALESCE(value, 0) INTO per_day_salary FROM salary_settings WHERE key = 'per_day_salary' AND is_active = true;
  SELECT COALESCE(value, 1) INTO per_day_deduction FROM salary_settings WHERE key = 'per_day_absence_deduction' AND is_active = true;

  FOR staff_record IN 
    SELECT s.id, s.base_salary, s.designation, p.full_name
    FROM staff s
    JOIN profiles p ON s.profile_id = p.id
    WHERE s.status = 'active'
  LOOP
    -- Calculate per day salary
    per_day_salary := COALESCE(staff_record.base_salary / NULLIF(working_days, 0), 0);
    
    -- For now, assume all days present (staff attendance tracking is separate)
    INSERT INTO payroll_history (
      staff_id, month, year,
      base_salary, working_days, days_present, days_absent,
      absence_deduction, status
    ) VALUES (
      staff_record.id, p_month, p_year,
      COALESCE(staff_record.base_salary, 0), 
      working_days, 
      working_days, 
      0,
      0, 
      'calculated'
    );
    
    total_processed := total_processed + 1;
  END LOOP;
  
  RETURN total_processed;
END;
$$ LANGUAGE plpgsql;