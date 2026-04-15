import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Crown } from "lucide-react";

interface AssinarProProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const AssinarPro = ({ className, variant = "default", size = "default" }: AssinarProProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // Obtém a sessão atual para pegar o token e o userId
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para assinar.",
        });
        return;
      }

      // Chamada direta via fetch para a Edge Function (conforme seu código testado)
      const response = await fetch(
        'https://nvmzhjybjwprtupogumd.supabase.co/functions/v1/stripe-create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ userId: session.user.id })
        }
      );

      const data = await response.json();
      
      if (data.sessionId) {
        // Redireciona para o Stripe Checkout (ID da sessão)
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else if (data.url) {
        // Redireciona para a URL direta (Fallback)
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento.');
      }
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      toast({
        variant: "destructive",
        title: "Erro na assinatura",
        description: error.message || "Erro de conexão. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      disabled={loading}
      variant={variant}
      size={size}
      className={`${className} gradient-primary text-white font-bold gap-2`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Crown className="h-4 w-4" />
      )}
      Assinar Pro
    </Button>
  );
};

export default AssinarPro;
