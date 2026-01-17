-- Safe script to add 'location' field type
-- This script checks if the value exists before adding it

-- First, check if 'location' already exists in field_type enum
DO $$ 
BEGIN
    -- Check if 'location' value exists in field_type enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'location' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'field_type')
    ) THEN
        -- Add 'location' to field_type enum
        ALTER TYPE field_type ADD VALUE 'location';
        RAISE NOTICE 'Added location to field_type enum';
    ELSE
        RAISE NOTICE 'location already exists in field_type enum';
    END IF;
END $$;

