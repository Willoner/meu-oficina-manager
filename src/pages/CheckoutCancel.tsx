import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-12 h-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-black mb-2">Checkout Cancelado</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Sua assinatura não foi finalizada e nenhuma cobrança foi realizada. Se tiver alguma dúvida, nossa equipe de suporte está à disposição.
      </p>
      <Button variant="outline" onClick={() => navigate("/configuracoes")} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar para Configurações
      </Button>
    </div>
  );
};

export default CheckoutCancel;
