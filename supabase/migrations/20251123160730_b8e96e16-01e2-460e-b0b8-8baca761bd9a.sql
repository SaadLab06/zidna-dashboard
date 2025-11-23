-- Insert page relations for super_admin users
-- For digitpart@gmail.com (super_admin)
INSERT INTO user_pages_relations (user_id, page_id, owner_id, user_roles, relation_status, approval_status)
VALUES 
  ('9318be95-8a82-499b-badd-80c2b7d0fc40', 'b05e7720-1cb8-4acc-bc0a-a78643a310f1', '9318be95-8a82-499b-badd-80c2b7d0fc40', ARRAY['admin']::page_role_enum[], 'active', 'accepted'),
  ('9318be95-8a82-499b-badd-80c2b7d0fc40', '106bad78-ec14-4418-89da-506f7bac625a', '9318be95-8a82-499b-badd-80c2b7d0fc40', ARRAY['admin']::page_role_enum[], 'active', 'accepted')
ON CONFLICT (id) DO NOTHING;

-- For saadlabri123@gmail.com (super_admin)
INSERT INTO user_pages_relations (user_id, page_id, owner_id, user_roles, relation_status, approval_status)
VALUES 
  ('068c7eef-45e4-4c93-8339-12e4d4c4b18f', 'b05e7720-1cb8-4acc-bc0a-a78643a310f1', '068c7eef-45e4-4c93-8339-12e4d4c4b18f', ARRAY['admin']::page_role_enum[], 'active', 'accepted'),
  ('068c7eef-45e4-4c93-8339-12e4d4c4b18f', '106bad78-ec14-4418-89da-506f7bac625a', '068c7eef-45e4-4c93-8339-12e4d4c4b18f', ARRAY['admin']::page_role_enum[], 'active', 'accepted')
ON CONFLICT (id) DO NOTHING;