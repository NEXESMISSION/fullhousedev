-- Safe Migration Script for Form Builder
-- This script can be run multiple times without errors
-- It handles existing types, tables, and policies

-- Create enum types only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_status') THEN
        CREATE TYPE form_status AS ENUM ('draft', 'active', 'disabled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'field_type') THEN
        CREATE TYPE field_type AS ENUM ('text', 'number', 'email', 'phone', 'textarea', 'select', 'checkbox', 'date', 'location');
    END IF;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status form_status NOT NULL DEFAULT 'draft',
  public_url VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  type field_type NOT NULL,
  required BOOLEAN DEFAULT false,
  placeholder VARCHAR(255),
  options JSONB,
  "order" INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_fields_form_id ON fields(form_id);
CREATE INDEX IF NOT EXISTS idx_fields_order ON fields(form_id, "order");
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submission_values_submission_id ON submission_values(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_values_field_id ON submission_values(field_id);
CREATE INDEX IF NOT EXISTS idx_forms_public_url ON forms(public_url);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop and recreate to ensure they're correct)
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fields_updated_at ON fields;
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_values ENABLE ROW LEVEL SECURITY;

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

