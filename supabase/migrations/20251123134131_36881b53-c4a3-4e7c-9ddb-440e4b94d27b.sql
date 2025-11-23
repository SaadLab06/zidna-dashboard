-- Add super_admin policies for ai_documents
CREATE POLICY "Super admins can view all documents"
ON public.ai_documents
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all documents"
ON public.ai_documents
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all documents"
ON public.ai_documents
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own documents"
ON public.ai_documents
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own documents"
ON public.ai_documents
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON public.ai_documents
FOR DELETE
USING (owner_id = auth.uid());

-- Add super_admin policies for comments
CREATE POLICY "Super admins can view all comments"
ON public.comments
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all comments"
ON public.comments
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all comments"
ON public.comments
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own comments"
ON public.comments
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (owner_id = auth.uid());

-- Add super_admin policies for facebook_pages
CREATE POLICY "Super admins can view all facebook pages"
ON public.facebook_pages
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all facebook pages"
ON public.facebook_pages
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all facebook pages"
ON public.facebook_pages
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert facebook pages"
ON public.facebook_pages
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add super_admin policies for messages
CREATE POLICY "Super admins can view all messages"
ON public.messages
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all messages"
ON public.messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all messages"
ON public.messages
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (owner_id = auth.uid());

-- Add super_admin policies for social_media_accounts
CREATE POLICY "Super admins can view all social media accounts"
ON public.social_media_accounts
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all social media accounts"
ON public.social_media_accounts
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all social media accounts"
ON public.social_media_accounts
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert social media accounts"
ON public.social_media_accounts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add super_admin policies for threads
CREATE POLICY "Super admins can view all threads"
ON public.threads
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all threads"
ON public.threads
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all threads"
ON public.threads
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own threads"
ON public.threads
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own threads"
ON public.threads
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own threads"
ON public.threads
FOR DELETE
USING (owner_id = auth.uid());

-- Add super_admin policies for legal_documents
CREATE POLICY "Super admins can manage all legal documents"
ON public.legal_documents
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add super_admin policies for user_oauth_tokens (INSERT, UPDATE, DELETE)
CREATE POLICY "Super admins can insert all tokens"
ON public.user_oauth_tokens
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all tokens"
ON public.user_oauth_tokens
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all tokens"
ON public.user_oauth_tokens
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));