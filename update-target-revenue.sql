-- Add target_revenue setting
INSERT INTO school_settings (key, value, category) 
VALUES ('target_revenue', '5000000', 'financial') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
