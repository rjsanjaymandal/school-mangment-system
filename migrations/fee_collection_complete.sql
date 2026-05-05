-- Complete Fee Collection Module Schema
-- Run this SQL in your Supabase SQL Editor

-- 1. Create fee_structures table
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_type VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  class_id VARCHAR(50),
  section_id VARCHAR(10),
  medium VARCHAR(50) DEFAULT 'English-CBSE',
  academic_year VARCHAR(20) DEFAULT '2026-27',
  due_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create payments table (if not exists)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  fee_structure_id UUID REFERENCES fee_structures(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_mode VARCHAR(50) DEFAULT 'cash',
  payment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  transaction_id VARCHAR(100),
  received_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create fee_assignments table
CREATE TABLE IF NOT EXISTS fee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  fee_structure_id UUID REFERENCES fee_structures(id),
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create fee_heads table
CREATE TABLE IF NOT EXISTS fee_heads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Insert default fee heads
INSERT INTO fee_heads (name) VALUES 
  ('Tuition Fee'),
  ('Admission Fee'),
  ('Transport Fee'),
  ('Exam Fee'),
  ('Library Fee'),
  ('Lab Fee'),
  ('Sports Fee'),
  ('Annual Fee'),
  ('Uniform Fee'),
  ('Books Fee')
ON CONFLICT (name) DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_year ON fee_structures(academic_year);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON fee_structures(class_id);

-- 7. Create RPC function for dashboard stats
CREATE OR REPLACE FUNCTION get_fee_dashboard_stats(p_academic_year TEXT DEFAULT '2026-27')
RETURNS TABLE (
  total_students INTEGER,
  total_assigned DECIMAL,
  total_collected DECIMAL,
  total_pending DECIMAL,
  collected_today DECIMAL,
  collected_week DECIMAL,
  collected_month DECIMAL,
  recovery_percentage DECIMAL,
  class_wise_data JSONB,
  top_pending_families JSONB
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_week_start DATE := CURRENT_DATE - INTERVAL '7 days';
  v_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
  RETURN QUERY
  WITH student_counts AS (
    SELECT COUNT(*) as cnt FROM profiles WHERE role = 'student'
  ),
  fee_totals AS (
    SELECT 
      COALESCE(SUM(fs.amount * (SELECT cnt FROM student_counts)), 0) as total_assigned
    FROM fee_structures fs
    WHERE fs.academic_year = p_academic_year
  ),
  payment_totals AS (
    SELECT 
      COALESCE(SUM(amount_paid), 0) as total_collected,
      COALESCE(SUM(CASE WHEN payment_date::DATE = v_today THEN amount_paid ELSE 0 END), 0) as today,
      COALESCE(SUM(CASE WHEN payment_date >= v_week_start THEN amount_paid ELSE 0 END), 0) as week,
      COALESCE(SUM(CASE WHEN payment_date >= v_month_start THEN amount_paid ELSE 0 END), 0) as month
    FROM payments
    WHERE status = 'completed'
  )
  SELECT 
    (SELECT cnt FROM student_counts) as total_students,
    (SELECT total_assigned FROM fee_totals) as total_assigned,
    (SELECT total_collected FROM payment_totals) as total_collected,
    ((SELECT total_assigned FROM fee_totals) - (SELECT total_collected FROM payment_totals))::DECIMAL as total_pending,
    (SELECT today FROM payment_totals) as collected_today,
    (SELECT week FROM payment_totals) as collected_week,
    (SELECT month FROM payment_totals) as collected_month,
    CASE 
      WHEN (SELECT total_assigned FROM fee_totals) > 0 
      THEN ((SELECT total_collected FROM payment_totals) / (SELECT total_assigned FROM fee_totals) * 100)::DECIMAL 
      ELSE 0 
    END as recovery_percentage,
    '[]'::jsonb as class_wise_data,
    '[]'::jsonb as top_pending_families;
END;
$$ LANGUAGE plpgsql;

-- 8. Enable RLS (optional - disable for development)
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_heads ENABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust as needed for your app)
GRANT ALL ON fee_structures TO authenticated;
GRANT ALL ON payments TO authenticated;
GRANT ALL ON fee_assignments TO authenticated;
GRANT ALL ON fee_heads TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_fee_dashboard_stats TO authenticated;

-- Insert sample data for testing
INSERT INTO fee_structures (fee_type, amount, class_id, academic_year, due_date)
SELECT 
  'Tuition Fee',
  15000 + (random() * 5000)::int,
  c.name,
  '2026-27',
  '2026-04-30'
FROM classes c
ON CONFLICT DO NOTHING;

SELECT 'Schema created successfully!' as message;