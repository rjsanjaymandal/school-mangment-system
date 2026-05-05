-- Fee Collection Module Schema for Edu Maysan ERP
-- Refactored to match Guru Nanak Fees Dashboard

-- 1. Create fee_structures table if not exists
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

-- 2. Add session column to fee_structures if not exists (redundant if just created, but safe for existing tables)
ALTER TABLE fee_structures ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2026-27';

-- 3. Create fee_assignments table (links students to fee structures)
CREATE TABLE IF NOT EXISTS fee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id),
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create parents table for family linking
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Link students to parents via guardian_students
ALTER TABLE guardian_students ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES parents(id);

-- 6. Create RPC function for dashboard stats (single call to minimize network waterfalls)
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
  ),
  class_wise AS (
    SELECT 
      c.name as class_name,
      COALESCE(SUM(fs.amount), 0) as assigned,
      (
        SELECT COALESCE(SUM(p.amount_paid), 0) 
        FROM payments p 
        JOIN students s ON s.id = p.student_id 
        WHERE s.class_id = c.id AND p.status = 'completed'
      ) as collected,
      (
        COALESCE(SUM(fs.amount), 0) - 
        (
          SELECT COALESCE(SUM(p.amount_paid), 0) 
          FROM payments p 
          JOIN students s ON s.id = p.student_id 
          WHERE s.class_id = c.id AND p.status = 'completed'
        )
      ) as pending
    FROM classes c
    LEFT JOIN fee_structures fs ON fs.class_id = c.name AND fs.academic_year = p_academic_year
    GROUP BY c.id, c.name
    ORDER BY c.name
  ),
  pending_families AS (
    SELECT 
      COALESCE(g.phone, 'N/A') as phone,
      COALESCE(g.first_name || ' ' || g.last_name, 'Unknown') as parent_name,
      COUNT(DISTINCT s.id) as student_count,
      COALESCE(SUM(fs.amount), 0) - COALESCE(SUM(p.amount_paid), 0) as total_pending
    FROM guardian_students gs
    JOIN students s ON s.id = gs.student_id
    LEFT JOIN profiles g ON g.id = gs.guardian_id
    LEFT JOIN fee_structures fs ON fs.class_id = (SELECT name FROM classes WHERE id = s.class_id) AND fs.academic_year = p_academic_year
    LEFT JOIN payments p ON p.student_id = s.id AND p.status = 'completed'
    GROUP BY gs.guardian_id, g.phone, g.first_name, g.last_name
    ORDER BY total_pending DESC
    LIMIT 10
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
    (SELECT jsonb_agg(row_to_json(t)) FROM class_wise t) as class_wise_data,
    (SELECT jsonb_agg(row_to_json(t)) FROM pending_families t) as top_pending_families;
END;
$$ LANGUAGE plpgsql;

-- 7. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_fee_structures_year ON fee_structures(academic_year);