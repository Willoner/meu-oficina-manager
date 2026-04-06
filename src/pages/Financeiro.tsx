import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";

const Financeiro = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
              <p className="text-sm text-muted-foreground">Faturamento e controle financeiro</p>
            </div>
          </div>
        </header>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" /> Receitas (mês)
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 0,00</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingDown className="w-4 h-4" /> Despesas (mês)
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 0,00</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <BarChart3 className="w-4 h-4" /> Lucro (mês)
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 0,00</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Em breve: gráficos e relatórios financeiros detalhados
          </div>
        </div>
      </main>
    </div>
  );
};

export default Financeiro;
