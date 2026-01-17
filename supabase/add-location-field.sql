-- Add location field type support
-- This script adds 'location' as a new field type

-- Update the enum type to include 'location'
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'location';

-- Note: If the above doesn't work, you may need to drop and recreate the type
-- But first check if location already exists:
-- SELECT unnest(enum_range(NULL::field_type));

