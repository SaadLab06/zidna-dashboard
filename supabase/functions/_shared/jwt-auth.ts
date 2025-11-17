import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ACCESS_TOKEN_SECRET = Deno.env.get("ACCESS_TOKEN_SECRET")!;  
const REFRESH_TOKEN_SECRET = Deno.env.get("REFRESH_TOKEN_SECRET")!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// CORS configuration
export const allowedOrigins = ['http://localhost:8080', 'https://zidna-sociahub.lovable.app'];

export const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
});

// Create a JWT token for the user
export async function createToken(payload: Record<string, any>, type: 'access' | 'refresh'): Promise<string> {
  const secret = new TextEncoder().encode(type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET);
  const expiresIn = type === 'access' ? '15m' : '30d';
  
  const jwt = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
  
  return jwt;
}

// Verify and decode a JWT token
export async function verifyToken(token: string, type: 'access' | 'refresh') {
  const secret = new TextEncoder().encode(type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET);
  
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Store the refresh token in the user_oauth_tokens table
export async function storeRefreshToken(userId: string, provider: string, token: string, email?: string) {
  const { error } = await supabase.from('user_oauth_tokens').insert({
    user_id: userId,
    provider,
    refresh_token: token,
    access_token: token, // Using same token for both in this implementation
    created_at: new Date().toISOString()
  });
  
  if (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
}

// Create an HttpOnly cookie (optional)
export function createHttpOnlyCookie(name: string, value: string, maxAge: number) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

// Verify password (placeholder - should use bcrypt in production)
export async function verifyPassword(password: string, hash: string) {
  // TODO: Implement proper bcrypt verification
  return true;
}

// Verify custom token
export async function verifyAccessToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { error: "Missing authorization header" };

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await verifyToken(token, 'access');
    return { user: decoded };
  } catch (err) {
    return { error: "Invalid or expired token" };
  }
}

// Verify Google OAuth token
export async function verifyGoogleToken(token: string) {
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

// Verify Facebook OAuth token
export async function verifyFacebookToken(token: string) {
  try {
    const appToken = `${Deno.env.get('FACEBOOK_APP_ID')}|${Deno.env.get('FACEBOOK_APP_SECRET')}`;
    const res = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appToken}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data || !data.data.is_valid) return null;
    return data.data;
  } catch (error) {
    console.error('Error verifying Facebook token:', error);
    return null;
  }
}
