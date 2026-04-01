/**
 * Google OAuth Callback Handler
 * Handles the OAuth callback from Google
 */

import { Env } from './shared';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle OAuth error
  if (error) {
    return Response.redirect(new URL('/?error=' + encodeURIComponent(error), request.url));
  }

  // Validate state
  const cookieHeader = request.headers.get('Cookie') || '';
  const stateCookie = cookieHeader.split(';').find(c => c.trim().startsWith('oauth_state='));
  const savedState = stateCookie?.split('=')[1];

  if (!state || state !== savedState) {
    return Response.redirect(new URL('/?error=invalid_state', request.url));
  }

  if (!code) {
    return Response.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${new URL(request.url).origin}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return Response.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      return Response.redirect(new URL('/?error=user_info_failed', request.url));
    }

    const userInfo: GoogleUserInfo = await userResponse.json();

    // Store user in D1 database
    const db = env.DB;

    // Check if user exists
    const existingUser = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(userInfo.email)
      .first();

    let userId: string;

    if (existingUser) {
      // Update existing user
      userId = (existingUser as any).id;
      await db
        .prepare('UPDATE users SET name = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(userInfo.name || userInfo.email, userInfo.picture, userId)
        .run();
    } else {
      // Create new user
      userId = crypto.randomUUID();
      await db
        .prepare('INSERT INTO users (id, name, email, image, emailVerified) VALUES (?, ?, ?, ?, ?)')
        .bind(userId, userInfo.name || userInfo.email, userInfo.email, userInfo.picture, new Date().toISOString())
        .run();
    }

    // Create session token (JWT-like, simplified)
    const sessionToken = btoa(JSON.stringify({
      userId,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }));

    // Redirect to home with session cookie
    const headers = new Headers();
    headers.set(
      'Set-Cookie',
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );
    headers.set('Location', '/');

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (err) {
    console.error('OAuth callback error:', err);
    return Response.redirect(new URL('/?error=oauth_failed', request.url));
  }
}
