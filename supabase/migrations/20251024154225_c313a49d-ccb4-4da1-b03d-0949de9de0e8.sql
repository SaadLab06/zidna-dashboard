-- Drop trigger and function, then recreate with proper security settings
DROP TRIGGER IF EXISTS trg_update_thread_last_message ON messages;
DROP FUNCTION IF EXISTS update_thread_last_message();

-- Recreate function with search_path security setting
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET last_message = COALESCE(NEW.ai_dm_reply, NEW.message),
      last_message_time = NEW.created_at
  WHERE thread_id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate trigger
CREATE TRIGGER trg_update_thread_last_message
AFTER INSERT OR UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_message();