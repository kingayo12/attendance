/*
  # Create handle_new_user trigger function

  1. Functions
    - `handle_new_user()` - Automatically creates a profile when a new user signs up
    
  2. Triggers  
    - Trigger on `auth.users` table to call `handle_new_user()` on INSERT
    
  This ensures that whenever a user signs up through Supabase Auth, 
  a corresponding profile record is automatically created in the profiles table.
*/

-- Create the function to handle new user signups
-- Safer function for Supabase Auth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Try to insert into profiles, but don’t block signup if it fails
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, school_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'school_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')::user_role
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but still allow the signup to succeed
    RAISE LOG 'Profile creation failed for user % with error: %',
      NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is set on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
