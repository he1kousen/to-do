import { createClient } from '@/lib/supabase/server';

/**
 * Store a Google refresh token for the authenticated user.
 * Called during the OAuth callback when a new refresh token is received.
 */
export async function storeRefreshToken(userId: string, refreshToken: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_google_tokens')
    .upsert(
      { user_id: userId, refresh_token: refreshToken },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[google-tokens] Failed to store refresh token:', error.message);
    throw new Error('Failed to store Google refresh token');
  }
}

/**
 * Get a short-lived Google access token by exchanging the stored refresh token.
 * Used by Calendar API proxy routes.
 */
export async function getAccessToken(userId: string): Promise<string> {
  const supabase = await createClient();

  // Get the stored refresh token
  const { data: tokenRow, error: fetchError } = await supabase
    .from('user_google_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (fetchError || !tokenRow) {
    throw new Error('NO_REFRESH_TOKEN');
  }

  // Exchange refresh token for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[google-tokens] Token exchange failed:', errorText);

    // If refresh token is revoked, delete it from our DB
    if (response.status === 400 || response.status === 401) {
      await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', userId);
      throw new Error('TOKEN_REVOKED');
    }

    throw new Error('TOKEN_EXCHANGE_FAILED');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Check if a user has a stored Google refresh token.
 */
export async function hasRefreshToken(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_google_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !!data;
}
