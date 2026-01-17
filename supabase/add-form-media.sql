-- Add media fields to forms table
-- This script adds support for logo, image, or video for each form

-- Add media_url column for image/video URL
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'logo'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_media_type ON forms(media_type);

-- Update existing forms to have 'none' as default media_type
UPDATE forms SET media_type = 'none' WHERE media_type IS NULL;

