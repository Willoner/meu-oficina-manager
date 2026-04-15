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
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para assinar.",
        });
        return;
      }

      // Chama a Edge Function para criar a sessão do Stripe
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session');

      if (error) {
        console.error("Erro ao invocar função:", error);
        throw new Error(error.message || "Falha ao iniciar checkout");
      }

      if (data?.url) {
        // Redireciona para o checkout do Stripe
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida");
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar assinatura",
        description: error.message || "Ocorreu um problema ao processar seu pedido.",
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
