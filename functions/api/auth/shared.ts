/**
 * Shared types for Cloudflare Pages Functions
 */

export interface Env {
  DB: any;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  REMOVE_BG_API_KEY: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  picture: string | null;
}

/**
 * Get current user from session cookie
 */
export function getSessionUser(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get('Cookie') || '';
  const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('session='));

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionValue = sessionCookie.split('=')[1];
    const decoded = atob(sessionValue);
    const session = JSON.parse(decoded) as SessionUser & { exp: number };

    // Check expiration
    if (session.exp && session.exp < Date.now()) {
      return null;
    }

    return {
      userId: session.userId,
      email: session.email,
      name: session.name,
      picture: session.picture,
    };
  } catch {
    return null;
  }
}
