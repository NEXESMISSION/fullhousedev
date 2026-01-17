-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE form_status AS ENUM ('draft', 'active', 'disabled');
CREATE TYPE field_type AS ENUM ('text', 'number', 'email', 'phone', 'textarea', 'select', 'checkbox', 'date');

-- Forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status form_status NOT NULL DEFAULT 'draft',
  public_url VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fields table
CREATE TABLE fields (
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

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submission values table
CREATE TABLE submission_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fields_form_id ON fields(form_id);
CREATE INDEX idx_fields_order ON fields(form_id, "order");
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submission_values_submission_id ON submission_values(submission_id);
CREATE INDEX idx_submission_values_field_id ON submission_values(field_id);
CREATE INDEX idx_forms_public_url ON forms(public_url);
CREATE INDEX idx_forms_status ON forms(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_values ENABLE ROW LEVEL SECURITY;

-- Policies for forms (public read for active forms, full access for authenticated users)
CREATE POLICY "Public can view active forms" ON forms
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can manage forms" ON forms
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for fields (public read for active forms, full access for authenticated users)
CREATE POLICY "Public can view fields of active forms" ON fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = fields.form_id 
      AND forms.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can manage fields" ON fields
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for submissions (public insert, authenticated read)
CREATE POLICY "Public can create submissions" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions" ON submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for submission_values (public insert, authenticated read)
CREATE POLICY "Public can create submission values" ON submission_values
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view submission values" ON submission_values
  FOR SELECT USING (auth.role() = 'authenticated');

