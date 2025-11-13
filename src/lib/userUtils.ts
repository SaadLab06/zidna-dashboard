/**
 * User utility functions for consistent user display and handling
 */

/**
 * Gets a consistent display name for a user
 * Priority: full_name > email > "Unknown User"
 */
export const getUserDisplayName = (user: {
  full_name?: string | null;
  email?: string | null;
  user_name?: string | null;
  sender_name?: string | null;
}): string => {
  return (
    user.full_name ||
    user.user_name ||
    user.sender_name ||
    user.email ||
    "Unknown User"
  );
};

/**
 * Gets initials from a name for avatar display
 */
export const getUserInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Formats a user's role for display
 */
export const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};
