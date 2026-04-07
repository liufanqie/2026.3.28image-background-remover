/**
 * Cloudflare Pages Function for remove.bg API proxy
 * This function runs on Cloudflare edge when deployed
 */

import { Env, getSessionUser } from './auth/shared';

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Check authentication
  const sessionUser = getSessionUser(request);
  if (!sessionUser) {
    return new Response(JSON.stringify({ error: '请先登录后再使用', code: 'NOT_AUTHENTICATED' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check free credits
  let freeCredits = 0;
  try {
    const row = await env.DB
      .prepare('SELECT free_credits FROM users WHERE id = ?')
      .bind(sessionUser.userId)
      .first();
    freeCredits = row?.free_credits ?? 0;
  } catch {
    freeCredits = 0;
  }

  if (freeCredits <= 0) {
    return new Response(JSON.stringify({ error: '免费次数已用完', code: 'NO_CREDITS', freeCredits: 0 }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare request to remove.bg API
    const apiFormData = new FormData();
    apiFormData.append('image_file', file);
    apiFormData.append('size', 'auto');

    const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': env.REMOVE_BG_API_KEY,
      },
      body: apiFormData,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return new Response(
        JSON.stringify({ error: 'remove.bg API error', details: errorText }),
        { status: apiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct credit after successful processing
    await env.DB
      .prepare('UPDATE users SET free_credits = free_credits - 1 WHERE id = ?')
      .bind(sessionUser.userId)
      .run();

    // Return the processed image
    const imageData = await apiResponse.arrayBuffer();
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="removed-bg.png"',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
