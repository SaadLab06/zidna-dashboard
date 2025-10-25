/**
 * Masks a token/secret by showing only the last 4 characters
 * @param token - The token to mask
 * @returns Masked token (e.g., "****abcd")
 */
export const maskToken = (token: string | null | undefined): string => {
  if (!token || token.length === 0) return '';
  if (token.length <= 4) return '****';
  
  const lastFour = token.slice(-4);
  return `${'*'.repeat(Math.min(8, token.length - 4))}${lastFour}`;
};

/**
 * Checks if a token is masked
 * @param token - The token to check
 * @returns true if the token appears to be masked
 */
export const isMaskedToken = (token: string): boolean => {
  return token.includes('*');
};
