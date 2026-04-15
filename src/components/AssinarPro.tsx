import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

export default function AssinarPro() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // Obtém a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        alert('Usuário não está logado');
        return;
      }

      console.log('Enviando userId:', session.user.id);

      // Chamada direta para a Edge Function
      const response = await fetch(
        'https://nvmzhjybjwprtupogumd.supabase.co/functions/v1/stripe-create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: session.user.id })
        }
      );

      const data = await response.json();
      console.log('Resposta da função:', data);

      if (data.sessionId) {
        // Redireciona para o Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else if (data.url) {
        // Fallback se retornar URL direta
        window.location.href = data.url;
      } else {
        alert('Erro ao criar sessão de pagamento: ' + (data.error || 'Tente novamente'));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="gap-2 gradient-primary text-white font-bold">
      <Crown className="h-4 w-4" />
      {loading ? 'Processando...' : 'Assinar Pro'}
    </Button>
  );
}
