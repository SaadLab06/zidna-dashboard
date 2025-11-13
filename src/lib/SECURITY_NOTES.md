# Security Implementation Notes

## ⚠️ CRITICAL: Token Storage Security

### Current State
Facebook and Instagram access tokens are currently stored in plain text in the database tables:
- `facebook_pages.access_token`
- `instagram_accounts.access_token`

### Security Risk
**HIGH SEVERITY**: Plain text token storage allows anyone with database access to:
- Access user's Facebook pages
- Read and send messages on behalf of users
- Manage Instagram accounts
- Potential account takeover

### Recommended Solution
Implement **Supabase Vault** for secure token storage:

```sql
-- 1. Enable Vault extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- 2. Store tokens in Vault (in Edge Function)
SELECT vault.create_secret(
  'facebook_token_' || user_id || '_' || page_id,
  actual_token_value,
  'Facebook page access token'
);

-- 3. Retrieve tokens (in Edge Function with SECURITY DEFINER)
SELECT decrypted_secret 
FROM vault.decrypted_secrets 
WHERE name = 'facebook_token_' || user_id || '_' || page_id;
```

### Implementation Steps
1. Create Edge Functions for token management
2. Migrate existing tokens to Vault
3. Update RLS policies to prevent direct token access
4. Remove plain text tokens from tables
5. Add token rotation mechanism
6. Implement audit logging for token access

### Alternative: Encryption at Application Level
If Vault is not available, implement encryption:
- Use server-side encryption keys stored as Supabase secrets
- Encrypt tokens before storing in database
- Only decrypt in Edge Functions (server-side)
- **Never** expose decrypted tokens to client

## Priority: IMMEDIATE
This should be addressed before production deployment.
