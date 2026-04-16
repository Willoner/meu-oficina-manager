import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@12.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2025-02-24.acacia',
});

// Avoid caching connection client if possible or instance it
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    const body = await req.text();
    // Verificar assinatura do Stripe
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extrair userId do metadata
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      
      if (userId) {
        // Atualizar plano na tabela usuários
        const { error: userError } = await supabaseAdmin
          .from('usuarios')
          .update({ plano: 'Pro' })
          .eq('id', userId);
          
        if (userError) {
          console.error('Erro ao atualizar usuário:', userError.message);
        }

        // Opcional: registrar a assinatura na tabela assinaturas
        const { error: subError } = await supabaseAdmin
          .from('assinaturas')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            plano: 'Pro',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (subError) {
           console.error('Erro ao registrar assinatura:', subError.message);
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Buscar a assinatura para encontrar o user_id
      const { data: subData } = await supabaseAdmin
        .from('assinaturas')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (subData?.user_id) {
         // Atualizar status e plano
         await supabaseAdmin.from('assinaturas').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('user_id', subData.user_id);
         await supabaseAdmin.from('usuarios').update({ plano: 'Gratuito' }).eq('id', subData.user_id);
      }
    } else if (event.type === 'invoice.payment_succeeded') {
       // Possibilidade de tratar renovações aqui se necessário
    }

    // Responder com 200 OK
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('Erro no Webhook:', err.message);
    return new Response(err.message, { status: 400 });
  }
});
