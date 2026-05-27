/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Redis } from '@upstash/redis/cloudflare'

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ADMIN_SECRET_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const redis = Redis.fromEnv(env);
    const url = new URL(request.url);
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- PUBLIC ROUTE: Get Full Menu ---
    if (url.pathname === '/api/menu' && method === 'GET') {
      try {
        const rawMenu = await redis.hgetall<Record<string, string>>('cafe:menu');
        if (!rawMenu) {
          return new Response(JSON.stringify([]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const menuItems = Object.entries(rawMenu).map(([id, data]) => ({
          id,
          ...JSON.parse(data),
        }));
        return new Response(JSON.stringify(menuItems), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch menu' }), { status: 500, headers: corsHeaders });
      }
    }

    // --- ADMIN ROUTES ---
    if (url.pathname.startsWith('/api/admin/menu')) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.ADMIN_SECRET_KEY}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      }

      // Add or Update Item
      if (method === 'POST' || method === 'PUT') {
        try {
          const body = await request.json() as { id?: string; name: string; price: number; available: boolean; description?: string };
          const itemId = body.id || `item_${crypto.randomUUID().slice(0, 8)}`;
          
          const itemData = {
            name: body.name,
            price: body.price,
            available: body.available ?? true,
            description: body.description || '',
          };

          await redis.hset('cafe:menu', { [itemId]: JSON.stringify(itemData) });
          return new Response(JSON.stringify({ message: 'Success', id: itemId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400, headers: corsHeaders });
        }
      }

      // Delete Item
      if (method === 'DELETE') {
        try {
          const itemId = url.searchParams.get('id');
          if (!itemId) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: corsHeaders });
          
          const deleted = await redis.hdel('cafe:menu', itemId);
          if (deleted === 0) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });

          return new Response(JSON.stringify({ message: 'Deleted' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500, headers: corsHeaders });
        }
      }
    }

    return new Response('Route Not Found', { status: 404 });
  },
};
