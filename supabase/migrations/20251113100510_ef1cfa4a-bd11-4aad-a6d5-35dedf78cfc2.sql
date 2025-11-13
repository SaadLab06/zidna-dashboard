-- Fix database security warnings: Add search_path to functions that are missing it

-- Fix update_thread_last_message function (use CASCADE to drop dependent triggers)
DROP FUNCTION IF EXISTS public.update_thread_last_message() CASCADE;
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE threads
  SET last_message = COALESCE(NEW.ai_dm_reply, NEW.message),
      last_message_time = NEW.created_at
  WHERE thread_id = NEW.thread_id;
  RETURN NEW;
END;
$$;

-- Recreate the trigger that was dropped by CASCADE
CREATE TRIGGER trg_update_thread_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();

-- Fix match_documents function
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, jsonb);
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector,
  match_count integer DEFAULT NULL,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents AS d
  WHERE d.metadata @> filter
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;