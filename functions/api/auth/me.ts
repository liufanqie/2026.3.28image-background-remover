/**
 * Get current user info
 */

import { Env, getSessionUser } from './shared';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request } = context;

  const user = getSessionUser(request);

  if (!user) {
    return Response.json({ authenticated: false, user: null });
  }

  return Response.json({
    authenticated: true,
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
      image: user.picture,
    },
  });
}
