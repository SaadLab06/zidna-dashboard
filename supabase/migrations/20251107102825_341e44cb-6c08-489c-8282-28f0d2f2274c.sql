-- Restrict legal_documents editing to a single designated email
-- 1) Drop existing admin-only policies for INSERT/UPDATE
DROP POLICY IF EXISTS "Admins can insert legal documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Admins can update legal documents" ON public.legal_documents;

-- 2) Create precise policies allowing only the specified email to insert/update
CREATE POLICY "Designated user can insert legal documents"
ON public.legal_documents
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'saadlabri123@gmail.com');

CREATE POLICY "Designated user can update legal documents"
ON public.legal_documents
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'saadlabri123@gmail.com');

-- Keep existing SELECT policy (Anyone can read) untouched
