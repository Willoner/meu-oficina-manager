import { useState, useEffect } from "react";
import { TrendingUp, Package, Wrench, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialBreakdownChart } from "@/components/FinancialBreakdownChart";

interface FinanceMetrics {
  receitaTotal: number;
  totalPecas: number;
  totalServicos: number;
}

const Financeiro = () => {
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    receitaTotal: 0,
    totalPecas: 0,
    totalServicos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Período: mês atual
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // 1. Buscar OS concluídas no mês
      const { data: ordens, error: ordensError } = await supabase
        .from("ordens_servico")
        .select("id, valor_total")
        .eq("usuario_id", user.id)
        .eq("status", "concluida")
        .gte("data_conclusao", firstDay)
        .lte("data_conclusao", lastDay);

      if (ordensError) {
        console.error("Erro ao buscar ordens:", ordensError);
        setLoading(false);
        return;
      }

      const receitaTotal = ordens?.reduce((acc, os) => acc + (os.valor_total || 0), 0) || 0;

      if (!ordens || ordens.length === 0) {
        setMetrics({ receitaTotal: 0, totalPecas: 0, totalServicos: 0 });
        setLoading(false);
        return;
      }

      // 2. Buscar itens dessas OS para separar peças vs serviços
      const osIds = ordens.map((o) => o.id);
      const { data: itens, error: itensError } = await supabase
        .from("itens_os")
        .select("tipo, valor_total")
        .in("ordem_servico_id", osIds);

      if (itensError) {
        console.error("Erro ao buscar itens:", itensError);
      }

      let totalPecas = 0;
      let totalServicos = 0;

      itens?.forEach((item) => {
        const tipoNorm = item.tipo?.toLowerCase() || "";
        if (tipoNorm === "peca") {
          totalPecas += item.valor_total || 0;
        } else {
          totalServicos += item.valor_total || 0;
        }
      });

      setMetrics({ receitaTotal, totalPecas, totalServicos });
      setLoading(false);
    };

    fetchFinancialData();
  }, []);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cards = [
    {
      title: "Receita Total",
      subtitle: "OS concluídas no mês",
      value: formatCurrency(metrics.receitaTotal),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Peças",
      subtitle: "Faturamento em peças no mês",
      value: formatCurrency(metrics.totalPecas),
      icon: Package,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Mão de Obra",
      subtitle: "Faturamento em serviços no mês",
      value: formatCurrency(metrics.totalServicos),
      icon: Wrench,
      color: "text-slate-700",
      bgColor: "bg-slate-100",
    },
  ];

  return (
    <DashboardLayout title="Financeiro" subtitle="Faturamento e controle financeiro">
      <div className="space-y-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card key={card.title} className="shadow-sm border-muted/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </span>
                      <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                        <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico Principal */}
        <FinancialBreakdownChart />
      </div>
    </DashboardLayout>
  );
};

export default Financeiro;
