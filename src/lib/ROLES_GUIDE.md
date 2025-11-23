# Role System Architecture

## Two-Tier Role System

This application implements a dual role system with both global (system-wide) and page-specific permissions.

### 1. Global App Roles (System-wide)

Stored in: `auth.users.raw_user_meta_data.app_role`

**Available Roles:**
- **super_admin**: Full system access, can manage all users and pages across the entire application
- **admin**: System administration capabilities, limited user management
- **moderator**: Content moderation across all pages
- **client**: Standard user access (default)

**Use Cases:**
- Accessing the SuperAdmin panel
- Managing system-wide settings
- Viewing all users' data
- System-level audit logs

### 2. Page-Specific Roles (Per-page)

Stored in: `user_pages_relations.user_roles`

**Available Roles:**
- **admin**: Full management of the assigned page
- **editor**: Content creation and editing for the page
- **moderator**: Comment and message moderation for the page
- **viewer**: Read-only access to page data
- **user**: Basic interaction with the page

**Use Cases:**
- Managing Facebook page connections
- Controlling who can post/edit content on specific pages
- Moderating comments/messages for individual pages
- Multi-tenant page management

---

## Permission Hierarchy

### Global Access Pattern
```
Super Admin → Bypasses all checks (full system access)
    ↓
Global Admin → Can manage page assignments and system settings
    ↓
Global Moderator → Can moderate content across all pages
    ↓
Client → Basic user, needs page-specific permissions
```

### Page-Specific Access Pattern
```
Page Owner → Full control (implicitly has all page roles)
    ↓
Page Admin → Full page management (can assign other page roles)
    ↓
Page Editor → Content management only
    ↓
Page Moderator → Comment/message moderation
    ↓
Page Viewer → Read-only access
    ↓
Page User → Basic interactions
```

---

## Implementation Examples

### Check Global Role (System-wide)
```typescript
import { useUserRole } from "@/hooks/useUserRole";

const MyComponent = () => {
  const { isSuperAdmin, isAdmin, isModerator } = useUserRole();
  
  if (isSuperAdmin) {
    // Full system access
  }
  
  if (isAdmin) {
    // System admin capabilities
  }
};
```

### Check Page-Specific Role
```typescript
import { usePageRole } from "@/hooks/usePageRole";

const MyPageComponent = () => {
  const { hasPageRole, isPageOwner, canManagePage } = usePageRole(pageId);
  
  if (hasPageRole(pageId, 'admin')) {
    // Page admin capabilities
  }
  
  if (isPageOwner(pageId)) {
    // Page owner capabilities
  }
  
  if (canManagePage(pageId)) {
    // Admin or owner
  }
};
```

### Combined Permission Check
```typescript
import { useUserRole } from "@/hooks/useUserRole";
import { usePageRole } from "@/hooks/usePageRole";

const MyFeature = () => {
  const { isSuperAdmin } = useUserRole();
  const { hasPageRole } = usePageRole();
  
  // Super admins OR page editors can edit
  const canEdit = isSuperAdmin || hasPageRole(pageId, 'editor');
  
  if (canEdit) {
    // Show edit functionality
  }
};
```

---

## Database Structure

### Global Roles
- Stored in: `auth.users.raw_user_meta_data->>'app_role'`
- Validated via: `has_role(user_id, role)` function
- Set during: User creation or by SuperAdmin

### Page Roles
- Stored in: `user_pages_relations` table
- Fields:
  - `user_id`: UUID reference to auth.users
  - `page_id`: UUID reference to facebook_pages
  - `owner_id`: UUID of the page owner
  - `user_roles`: Array of page_role_enum
  - `relation_status`: 'active' | 'pending' | 'banished'
  - `approval_status`: 'accepted' | 'pending' | 'rejected'
- Validated via: `has_page_role(user_id, page_id, role)` function

---

## Security Considerations

1. **Global roles** are checked server-side using `has_role()` SECURITY DEFINER function
2. **Page roles** use RLS policies with `has_page_role()` and `is_page_owner()` functions
3. **Super admins** bypass most RLS restrictions for administrative purposes
4. **Never** check roles on the client without server-side validation
5. All role checks in edge functions should validate against the database, not trust client input

---

## Common Patterns

### Dashboard Access
```typescript
// Global admins OR users with any page access can view dashboard
if (isSuperAdmin || isAdmin || pageRoles.length > 0) {
  // Show dashboard
}
```

### Page-Specific Actions
```typescript
// Check page-specific permission for actions
const canModerate = isSuperAdmin || hasPageRole(pageId, 'moderator') || hasPageRole(pageId, 'admin');
```

### Admin Panel Access
```typescript
// Only super admins can access SuperAdmin panel
if (isSuperAdmin) {
  // Show SuperAdmin panel link
}
```

---

## Adding New Roles

### To add a global role:
1. Update the `app_role` enum in the database
2. Update RLS policies that use `has_role()`
3. Update `useUserRole` hook to expose new role checks

### To add a page role:
1. Update the `page_role_enum` in the database
2. Update RLS policies for tables that check page permissions
3. Update `usePageRole` hook if needed for new helper functions
