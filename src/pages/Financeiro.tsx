import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Financeiro = () => {
  return (
    <DashboardLayout title="Financeiro" subtitle="Faturamento e controle financeiro">
      <div className="space-y-6">
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
    </DashboardLayout>
  );
};

export default Financeiro;
