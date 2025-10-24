-- Allow authenticated users to read webhook configurations
CREATE POLICY "Authenticated users can read webhooks"
ON public.webhooks_config
FOR SELECT
TO authenticated
USING (true);