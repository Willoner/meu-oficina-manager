import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata.userId;
        const subscriptionId = session.subscription;

        // 1. Atualizar o plano do usuário para 'Pro' na tabela usuarios
        await supabaseAdmin
          .from('usuarios')
          .update({ plano: 'Pro' })
          .eq('id', userId);

        // 2. Registrar na tabela de assinaturas
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        await supabaseAdmin
          .from('assinaturas')
          .upsert({
            usuario_id: userId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            plan_type: 'Pro',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }, { onConflict: 'stripe_subscription_id' });

        console.log(`Assinatura ativada para o usuário ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // Buscar o usuário pelo stripe_customer_id ou ID da assinatura
        const { data: userAssinatura } = await supabaseAdmin
          .from('assinaturas')
          .select('usuario_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (userAssinatura) {
          // Reverter plano para Gratuito
          await supabaseAdmin
            .from('usuarios')
            .update({ plano: 'Gratuito' })
            .eq('id', userAssinatura.usuario_id);

          await supabaseAdmin
            .from('assinaturas')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id);
            
          console.log(`Assinatura cancelada para o usuário ${userAssinatura.usuario_id}`);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await supabaseAdmin
          .from('assinaturas')
          .update({ 
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
