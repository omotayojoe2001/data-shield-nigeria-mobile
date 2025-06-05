
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true);

-- Set up storage policies for profile images
CREATE POLICY "Users can upload their own profile image" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Users can update their own profile image" ON storage.objects
FOR UPDATE USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile image" ON storage.objects
FOR DELETE USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
