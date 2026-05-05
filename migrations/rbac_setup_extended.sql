-- RBAC (Role-Based Access Control) Setup for Edu Maysan
-- Run this in Supabase SQL Editor

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'principal', 'teacher', 'clerk', 'receptionist', 'student', 'parent', 'guardian')),
  department VARCHAR(100),
  designation VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;

-- 3. Create permissions reference table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{
    "view": false,
    "create": false,
    "edit": false,
    "delete": false,
    "export": false,
    "approve": false
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, module)
);

-- 4. Insert default permissions
INSERT INTO role_permissions (role, module, permissions) VALUES
-- Admin - Full access to everything
('admin', 'students', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'staff', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'finance', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'attendance', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'exams', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'settings', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'reports', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),
('admin', 'audit', '{"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}'),

-- Principal - Full access but no delete
('principal', 'students', '{"view":true,"create":true,"edit":true,"delete":false,"export":true,"approve":true}'),
('principal', 'staff', '{"view":true,"create":false,"edit":true,"delete":false,"export":true,"approve":true}'),
('principal', 'finance', '{"view":true,"create":false,"edit":false,"delete":false,"export":true,"approve":true}'),
('principal', 'attendance', '{"view":true,"create":true,"edit":true,"delete":false,"export":true,"approve":true}'),
('principal', 'exams', '{"view":true,"create":true,"edit":true,"delete":false,"export":true,"approve":true}'),
('principal', 'reports', '{"view":true,"create":false,"edit":false,"delete":false,"export":true,"approve":false}'),

-- Teacher - Limited access
('teacher', 'students', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('teacher', 'attendance', '{"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false}'),
('teacher', 'exams', '{"view":true,"create":false,"edit":true,"delete":false,"export":false,"approve":false}'),
('teacher', 'reports', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),

-- Clerk - Finance and basic student info
('clerk', 'students', '{"view":true,"create":true,"edit":false,"delete":false,"export":true,"approve":false}'),
('clerk', 'finance', '{"view":true,"create":true,"edit":true,"delete":false,"export":true,"approve":false}'),
('clerk', 'attendance', '{"view":true,"create":true,"edit":false,"delete":false,"export":true,"approve":false}'),

-- Receptionist - Minimal access
('receptionist', 'students', '{"view":true,"create":true,"edit":false,"delete":false,"export":false,"approve":false}'),
('receptionist', 'attendance', '{"view":true,"create":true,"edit":false,"delete":false,"export":false,"approve":false}'),

-- Student - Own data only
('student', 'students', '{"view":false,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('student', 'attendance', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('student', 'exams', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('student', 'finance', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),

-- Parent - Child data only
('parent', 'students', '{"view":false,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('parent', 'attendance', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('parent', 'exams', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}'),
('parent', 'finance', '{"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}')
ON CONFLICT (role, module) DO NOTHING;

-- 5. Create RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Admin can manage all roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- Users can view their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- 6. Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(role VARCHAR(50), module VARCHAR(50), permissions JSONB) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.role,
    rp.module,
    rp.permissions
  FROM user_roles ur
  LEFT JOIN role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = user_uuid AND ur.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to check specific permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, module VARCHAR(50), permission VARCHAR(20))
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(50);
  perms JSONB;
BEGIN
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = user_uuid AND ur.is_active = true
  LIMIT 1;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;

  SELECT rp.permissions INTO perms
  FROM role_permissions rp
  WHERE rp.role = user_role AND rp.module = module;

  IF perms IS NULL THEN
    RETURN false;
  END IF;

  RETURN (perms ->> permission)::boolean;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to auto-create user role on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default role based on user metadata
  INSERT INTO user_roles (user_id, role, created_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger needs auth.users trigger setup
-- Run after enabling auth