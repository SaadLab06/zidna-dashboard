-- Add profile_picture_url column to threads table
ALTER TABLE threads 
ADD COLUMN profile_picture_url TEXT;