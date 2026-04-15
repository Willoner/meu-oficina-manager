import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2025-02-24.acacia',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("1. Iniciando criação de sessão real no Stripe...");
    
    const { userId } = await req.json();
    console.log("2. userId capturado:", userId);
    
    if (!userId) {
      console.log("❌ Erro: userId ausente no corpo da requisição.");
      return new Response(JSON.stringify({ error: "userId required" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log("3. Solicitando sessão ao Stripe Checkout...");
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
    
    console.log("4. ✅ Sessão criada com sucesso ID:", session.id);
    
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("❌ Erro no Stripe:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
