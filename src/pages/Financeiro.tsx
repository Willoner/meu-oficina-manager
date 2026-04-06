import { DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Financeiro = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
              <p className="text-sm text-muted-foreground">Faturamento e controle financeiro</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          Em breve: relatórios financeiros e faturamento
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
