-- Fix RLS Policies for Form Builder
-- This script can be run multiple times safely
-- It will drop existing policies and recreate them
-- 
-- IMPORTANT: Make sure you have run migrate-safe.sql first to create tables
-- This script only fixes the policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active forms" ON forms;
DROP POLICY IF EXISTS "Authenticated users can manage forms" ON forms;
DROP POLICY IF EXISTS "Admin can manage forms" ON forms;

DROP POLICY IF EXISTS "Public can view fields of active forms" ON fields;
DROP POLICY IF EXISTS "Authenticated users can manage fields" ON fields;
DROP POLICY IF EXISTS "Admin can manage fields" ON fields;

DROP POLICY IF EXISTS "Public can create submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON submissions;
DROP POLICY IF EXISTS "Admin can view submissions" ON submissions;

DROP POLICY IF EXISTS "Public can create submission values" ON submission_values;
DROP POLICY IF EXISTS "Authenticated users can view submission values" ON submission_values;
DROP POLICY IF EXISTS "Admin can view submission values" ON submission_values;

-- Recreate policies for forms
CREATE POLICY "Public can view active forms" ON forms
  FOR SELECT USING (status = 'active');

-- Allow authenticated users to manage forms
CREATE POLICY "Authenticated users can manage forms" ON forms
  FOR ALL USING (auth.role() = 'authenticated');

-- Recreate policies for fields
CREATE POLICY "Public can view fields of active forms" ON fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = fields.form_id 
      AND forms.status = 'active'
    )
  );

-- Allow authenticated users to manage fields
CREATE POLICY "Authenticated users can manage fields" ON fields
  FOR ALL USING (auth.role() = 'authenticated');

-- Recreate policies for submissions
CREATE POLICY "Public can create submissions" ON submissions
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view all submissions
CREATE POLICY "Authenticated users can view submissions" ON submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Recreate policies for submission_values
CREATE POLICY "Public can create submission values" ON submission_values
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view all submission values
CREATE POLICY "Authenticated users can view submission values" ON submission_values
  FOR SELECT USING (auth.role() = 'authenticated');

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('forms', 'fields', 'submissions', 'submission_values')
ORDER BY tablename, policyname;

