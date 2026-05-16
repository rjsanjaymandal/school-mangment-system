-- Migration: Fee Collection RPC for Advanced Checkout Workflow
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_fee_collection_data(
    p_search TEXT DEFAULT '',
    p_limit INT DEFAULT 10,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    student_id UUID,
    admission_number TEXT,
    student_name TEXT,
    father_name TEXT,
    class_name TEXT,
    total_due DECIMAL,
    total_paid DECIMAL,
    outstanding_balance DECIMAL,
    total_count BIGINT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH raw_data AS (
        SELECT 
            s.id AS student_id,
            s.admission_number,
            pr.full_name AS student_name,
            COALESCE(p.father_name, 'N/A') AS father_name,
            c.name AS class_name,
            COALESCE((
                SELECT SUM(fs.amount)
                FROM fees fs
                WHERE fs.class_id = c.id
            ), 0) AS total_due,
            COALESCE((
                SELECT SUM(pay.amount_paid)
                FROM payments pay
                WHERE pay.student_id = s.id AND pay.status = 'completed'
            ), 0) AS total_paid
        FROM students s
        LEFT JOIN profiles pr ON pr.id = s.id
        LEFT JOIN classes c ON c.id = s.class_id
        LEFT JOIN guardian_students gs ON gs.student_id = s.id
        LEFT JOIN parents p ON p.id = gs.parent_id
        WHERE 
            (p_search = '' OR 
             s.admission_number ILIKE '%' || p_search || '%' OR
             pr.full_name ILIKE '%' || p_search || '%' OR
             p.father_name ILIKE '%' || p_search || '%')
    ),
    counted_data AS (
        SELECT COUNT(*) AS exact_count FROM raw_data
    )
    SELECT 
        r.student_id::UUID,
        r.admission_number::TEXT,
        r.student_name::TEXT,
        r.father_name::TEXT,
        r.class_name::TEXT,
        r.total_due::DECIMAL,
        r.total_paid::DECIMAL,
        (r.total_due - r.total_paid)::DECIMAL AS outstanding_balance,
        c.exact_count::BIGINT AS total_count
    FROM raw_data r
    CROSS JOIN counted_data c
    ORDER BY r.student_name ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
