import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-11-20',
});

// Headers CORS para permitir chamadas do navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. Tratar Preflight de CORS (método OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("1. Função iniciada");
    
    // 2. Extrair dados do corpo da requisição
    const { userId } = await req.json();
    console.log("2. userId recebido:", userId);
    
    if (!userId) {
      console.log("3. Erro: userId não fornecido");
      return new Response(JSON.stringify({ error: "userId required" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log("4. Criando sessão no Stripe...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1TMYkpGXblrqLqtki2TvA6rd',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://www.oficinaemordem.com.br/checkout/success',
      cancel_url: 'https://www.oficinaemordem.com.br/checkout/cancel',
      metadata: { userId },
    });
    
    console.log("5. Sessão criada:", session.id);
    
    // Retornamos tanto a URL quanto o ID para máxima compatibilidade
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("❌ Erro detalhado:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
