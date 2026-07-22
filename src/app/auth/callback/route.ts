import { createClient } from '@/lib/supabase/server';
import { storeRefreshToken } from '@/lib/google-tokens';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Store Google refresh token if provided (for Calendar API access)
      const providerRefreshToken = data.session.provider_refresh_token;
      if (providerRefreshToken) {
        try {
          await storeRefreshToken(data.session.user.id, providerRefreshToken);
        } catch (err) {
          // Non-blocking: log but don't prevent login
          console.error('[auth/callback] Failed to store refresh token:', err);
        }
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
