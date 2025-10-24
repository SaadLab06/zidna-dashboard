-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policy for user_roles (admins can manage, users can view their own)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on tables without protection
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_dm_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks_config ENABLE ROW LEVEL SECURITY;

-- Fix overly permissive policies on comments
DROP POLICY IF EXISTS "Allow public read access to comments" ON public.comments;
CREATE POLICY "Authenticated users can read comments"
ON public.comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage comments"
ON public.comments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix overly permissive policies on messages
DROP POLICY IF EXISTS "Allow public read access to messages" ON public.messages;
CREATE POLICY "Authenticated users can read messages"
ON public.messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage messages"
ON public.messages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix overly permissive policies on threads
DROP POLICY IF EXISTS "Allow public read access to threads" ON public.threads;
CREATE POLICY "Authenticated users can read threads"
ON public.threads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage threads"
ON public.threads FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add policies for documents
CREATE POLICY "Authenticated users can read documents"
ON public.documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage documents"
ON public.documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add policies for instagram_dm_chat_history
CREATE POLICY "Authenticated users can read chat history"
ON public.instagram_dm_chat_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage chat history"
ON public.instagram_dm_chat_history FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add policies for webhooks_config
CREATE POLICY "Admins can manage webhooks"
ON public.webhooks_config FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add policies for ai_documents
CREATE POLICY "Authenticated users can read ai_documents"
ON public.ai_documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage ai_documents"
ON public.ai_documents FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add policies for ai_index
CREATE POLICY "Authenticated users can read ai_index"
ON public.ai_index FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage ai_index"
ON public.ai_index FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add policies for settings (admin only)
CREATE POLICY "Admins can manage settings"
ON public.settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update match_documents function to have fixed search_path
CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL, filter jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;