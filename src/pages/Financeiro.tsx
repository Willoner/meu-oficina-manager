import { useState, useEffect } from "react";
import { TrendingUp, Package, Wrench, DollarSign, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialBreakdownChart } from "@/components/FinancialBreakdownChart";
import { Button } from "@/components/ui/button";
import { ExportReportDialog } from "@/components/modals/ExportReportDialog";

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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Período: mês selecionado
      const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
      const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

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
        .select("tipo, valor_total, ordem_servico_id")
        .in("ordem_servico_id", osIds);

      if (itensError) {
        console.error("Erro ao buscar itens:", itensError);
      }

      let totalPecas = 0;
      let totalServicos = 0;

      // 1. Somar itens detalhados
      itens?.forEach((item) => {
        const tipoNorm = item.tipo?.toLowerCase() || "";
        if (tipoNorm === "peca") {
          totalPecas += item.valor_total || 0;
        } else {
          totalServicos += item.valor_total || 0;
        }
      });

      // 2. Tratar O.S. sem itens detalhados (evitar buraco financeiro)
      ordens.forEach(o => {
        const osTotal = o.valor_total || 0;
        const totalItensOS = itens?.filter(i => i.ordem_servico_id === o.id)
                                  .reduce((sum, i) => sum + (i.valor_total || 0), 0) || 0;
        
        // Se a OS tem um valor total mas os itens não somam esse valor (ou não existem),
        // a diferença é considerada "Serviço/Mão de Obra" não detalhada.
        const diferenca = osTotal - totalItensOS;
        if (diferenca > 0.01) {
          totalServicos += diferenca;
        }
      });

      setMetrics({ receitaTotal, totalPecas, totalServicos });
      setLoading(false);
    };

    fetchFinancialData();
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const monthLabel = selectedDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

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
    <DashboardLayout title="Financeiro" subtitle={`Faturamento de ${monthLabel}`}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center capitalize">
              {monthLabel}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8" disabled={selectedDate >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setIsExportDialogOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto shadow-sm">
            <FileDown className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </div>

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
      <ExportReportDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />
    </DashboardLayout>
  );
};

export default Financeiro;
