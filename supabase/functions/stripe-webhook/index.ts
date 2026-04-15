import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2025-02-24.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('Stripe-Signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )

    console.log(`🔔 Evento recebido: ${event.id} [${event.type}]`)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata.userId;
      const subscriptionId = session.subscription;

      console.log(`Ativando Plano Pro para o usuário: ${userId}`);

      // 1. Atualizar plano na tabela usuários
      const { error: userError } = await supabaseAdmin
        .from('usuarios')
        .update({ plano: 'Pro' })
        .eq('id', userId);
      
      if (userError) throw userError;

      // 2. Registrar na tabela de assinaturas
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const { error: signatureError } = await supabaseAdmin
        .from('assinaturas')
        .upsert({
          usuario_id: userId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          plan_type: 'Pro',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }, { onConflict: 'stripe_subscription_id' });

      if (signatureError) throw signatureError;

      console.log(`✅ Sucesso: Plano Pro ativado para ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error(`❌ Erro no Webhook: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }
})
