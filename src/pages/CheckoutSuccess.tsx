import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Pagamento confirmado!",
      description: "Parabéns! Você agora é um usuário Pro.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-black mb-2">Assinatura Ativada!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Sua conta foi atualizada com sucesso. Agora você tem acesso ilimitado a todas as ferramentas do Oficina em Ordem Pro.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate("/")} className="gap-2">
          Ir para o Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
