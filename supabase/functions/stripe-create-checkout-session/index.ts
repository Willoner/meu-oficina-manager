import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2025-02-24.acacia',
});

Deno.serve(async (req) => {
  // Log para debug
  console.log("Função chamada com método:", req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.text();
    console.log("Body raw:", body);
    
    if (!body || body.trim() === '') {
      console.log("❌ Body vazio!");
      return new Response(JSON.stringify({ error: "Empty body" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const { userId } = JSON.parse(body);
    console.log("userId recebido:", userId);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: 'price_1TMYkpGXblrqLqtki2TvA6rd', quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://www.oficinaemordem.com.br/checkout/success',
      cancel_url: 'https://www.oficinaemordem.com.br/checkout/cancel',
      metadata: { userId },
    });
    
    console.log("Sessão criada:", session.id);
    
    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error("Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
