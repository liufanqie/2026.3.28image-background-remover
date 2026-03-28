/**
 * Cloudflare Worker for Image Background Remover
 * Proxies requests to remove.bg API
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // Only accept POST requests to /api/remove
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);

    if (url.pathname !== '/api/remove') {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    try {
      // Parse multipart form data
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return jsonResponse({ error: 'No file provided' }, 400);
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return jsonResponse({ error: 'File size exceeds 10MB limit' }, 400);
      }

      // Prepare request to remove.bg API
      const apiFormData = new FormData();
      apiFormData.append('image_file', file);
      apiFormData.append('size', 'auto');

      const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': env.REMOVE_BG_API_KEY
        },
        body: apiFormData
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        return jsonResponse({
          error: 'remove.bg API error',
          details: errorText
        }, apiResponse.status);
      }

      // Return the processed image
      const imageData = await apiResponse.arrayBuffer();
      return new Response(imageData, {
        headers: {
          ...corsHeaders(),
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="removed-bg.png"'
        }
      });

    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json'
    }
  });
}
