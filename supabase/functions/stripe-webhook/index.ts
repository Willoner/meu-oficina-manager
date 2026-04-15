import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Tratar OPTIONS para CORS no frontend
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log(`✅ Webhook chamado! Método: ${req.method}`);
  
  return new Response(
    JSON.stringify({ 
      message: "Webhook (Debug) recebido com sucesso!", 
      status: "online" 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
});
