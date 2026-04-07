/**
 * Get current user info
 */

import { Env, getSessionUser } from './shared';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const user = getSessionUser(request);

  if (!user) {
    return Response.json({ authenticated: false, user: null });
  }

  // Query free_credits from D1
  let freeCredits = 0;
  try {
    const row = await env.DB
      .prepare('SELECT free_credits FROM users WHERE id = ?')
      .bind(user.userId)
      .first();
    freeCredits = row?.free_credits ?? 0;
  } catch {
    // Column may not exist yet for old users
    freeCredits = 5;
  }

  return Response.json({
    authenticated: true,
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
      image: user.picture,
      freeCredits,
    },
  });
}
