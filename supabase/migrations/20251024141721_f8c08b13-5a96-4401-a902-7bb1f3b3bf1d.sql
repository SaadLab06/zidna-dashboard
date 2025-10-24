-- Grant admin role to the current user
INSERT INTO public.user_roles (user_id, role)
VALUES ('8ceec6b6-3260-478a-9df5-ec43f2b64367', 'admin')
ON CONFLICT DO NOTHING;