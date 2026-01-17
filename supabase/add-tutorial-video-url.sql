-- Add tutorial_video_url column to forms table
-- This field allows storing a link to a tutorial/instructional video for filling out the form

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'forms' 
        AND column_name = 'tutorial_video_url'
    ) THEN
        ALTER TABLE forms 
        ADD COLUMN tutorial_video_url TEXT;
        
        COMMENT ON COLUMN forms.tutorial_video_url IS 'رابط فيديو توضيحي يوضح كيفية ملء النموذج (YouTube, Vimeo, إلخ)';
    END IF;
END $$;

