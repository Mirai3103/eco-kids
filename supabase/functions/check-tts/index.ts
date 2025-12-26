// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
import * as hash from 'object-hash';

type Language = 'vi' | 'en';
type Gender = 'female' | 'male';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  console.log('Request origin', req.headers.get('host'));
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  const text = params.get('text');
  const gender = (params.get('gender') as Gender) ?? 'female';
  const lang = (params.get('lang') as Language) ?? 'vi';

  if (!text) {
    return new Response(JSON.stringify({ error: 'Text parameter is required', isHit: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const requestHash = hash.MD5({ text, gender, lang });
  console.log('Request hash', requestHash);

  try {
    // Check storage for existing audio file
    const { data } = supabase.storage.from('audio').getPublicUrl(`${requestHash}.mp3`);

    if (data) {
      console.log('Checking if audio file exists in storage', data.publicUrl);
      const storageRes = await fetch(data.publicUrl);
      
      if (storageRes.ok) {
        console.log('Audio file found in storage - cache hit');
        return new Response(JSON.stringify({ 
          isHit: true,
          url: data.publicUrl 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Audio file not found in storage - cache miss');
    return new Response(JSON.stringify({ isHit: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('error', { error });
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      isHit: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});