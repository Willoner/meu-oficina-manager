import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: number;
  usage: number;
}

export function PlanLimitModal({ open, onOpenChange, limit, usage }: PlanLimitModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-primary/20 bg-gradient-to-b from-card to-background shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">Limite Atingido!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Você atingiu sua cota mensal de <span className="font-bold text-foreground">{limit} Ordens de Serviço</span> do plano gratuito.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 my-4 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-muted-foreground">Uso Atual</span>
            <span className="text-lg font-bold text-primary">{usage} / {limit}</span>
          </div>
          <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-center text-muted-foreground italic">
            Sua cota renova automaticamente no dia 1 do próximo mês.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full h-12 gradient-primary text-base font-bold shadow-lg hover:shadow-primary/20 transition-all group"
            onClick={() => navigate("/configuracoes")}
          >
            <Zap className="w-5 h-5 mr-2 fill-white animate-bounce" />
            Migrar para o Plano Pro
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-11" 
            onClick={() => onOpenChange(false)}
          >
            Talvez mais tarde
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-4">
          O plano Pro oferece <span className="text-primary font-bold">O.S. Ilimitadas</span>, suporte prioritário e muito mais.
        </p>
      </DialogContent>
    </Dialog>
  );
}
