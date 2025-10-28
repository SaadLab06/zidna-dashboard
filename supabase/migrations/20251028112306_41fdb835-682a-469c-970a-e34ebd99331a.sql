-- Add owner_id to ai_documents table to track which user uploaded the document
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for ai_documents
DROP POLICY IF EXISTS "Authenticated users can read ai_documents" ON ai_documents;
DROP POLICY IF EXISTS "Authenticated users can manage ai_documents" ON ai_documents;

CREATE POLICY "Users can read their own documents"
  ON ai_documents FOR SELECT
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can insert their own documents"
  ON ai_documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON ai_documents FOR UPDATE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can delete their own documents"
  ON ai_documents FOR DELETE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'superadmin'));