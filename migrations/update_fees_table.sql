-- Add missing columns to existing fees table (run in Supabase SQL)

-- Add columns if not exist
ALTER TABLE fees ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2026-27';
ALTER TABLE fees ADD COLUMN IF NOT EXISTS medium VARCHAR(50) DEFAULT 'English-CBSE';
ALTER TABLE fees ADD COLUMN IF NOT EXISTS section_id VARCHAR(10);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add payment columns if payments table exists but missing columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'cash';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_fees_year ON fees(academic_year);
CREATE INDEX IF NOT EXISTS idx_fees_class ON fees(class_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Insert sample fee structures if empty
INSERT INTO fees (name, amount, fee_type, class_id, academic_year, due_date)
SELECT 
  'Tuition Fee - ' || c.name,
  15000,
  'Tuition Fee',
  c.id,
  '2026-27',
  '2026-04-30'
FROM classes c
WHERE NOT EXISTS (SELECT 1 FROM fees WHERE class_id = c.id AND academic_year = '2026-27')
LIMIT 10;

SELECT 'Columns added successfully!' as message;