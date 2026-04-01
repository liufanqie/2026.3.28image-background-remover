/**
 * Google OAuth Login - Cloudflare Pages Function
 * Initiates the OAuth flow
 */

interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NEXTAUTH_SECRET: string;
  DB: any;
}

function generateState(): string {
  return crypto.randomUUID();
}

async function signState(state: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(state));
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(signature))));
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  const { env, request } = context;
  const url = new URL(request.url);

  const state = generateState();
  const signature = await signState(state, env.NEXTAUTH_SECRET);
  const stateWithSig = `${state}.${signature}`;

  const redirectUri = `${url.origin}/api/auth/callback`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', stateWithSig);

  // Store state in a cookie
  const headers = new Headers();
  headers.set(
    'Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  headers.set('Location', googleAuthUrl.toString());

  return new Response(null, {
    status: 302,
    headers,
  });
}
