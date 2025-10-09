-- Fix Security Issue 1: Restrict profile visibility to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Fix Security Issue 2: Restrict user_roles visibility (CRITICAL - admin exposure)
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

-- Allow users to see only their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to see all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix Security Issue 3: Add SECURITY DEFINER to update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix Security Issue 4: Add database constraints for username validation
ALTER TABLE public.profiles
ADD CONSTRAINT username_length_check 
CHECK (char_length(username) >= 3 AND char_length(username) <= 20);

ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check
CHECK (username ~ '^[a-zA-Z0-9_-]+$');