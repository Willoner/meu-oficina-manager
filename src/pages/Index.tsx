import { useState, useEffect } from "react";
import { ClipboardList, Users, Car, DollarSign, Calendar, FileText, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/MetricCard";
import ServiceOrdersTable from "@/components/ServiceOrdersTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const [metrics, setMetrics] = useState({
    ordensAbertas: 0,
    clientesAtivos: 0,
    veiculos: 0,
    faturamentoMensal: 0,
    charts: {
      ordens: [] as { value: number }[],
      clientes: [] as { value: number }[],
      veiculos: [] as { value: number }[],
      faturamento: [] as { value: number }[],
    }
  });
  const [agendamentosHoje, setAgendamentosHoje] = useState<any[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    const fetchMetrics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clientes
      const { count: clientesCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", user.id);

      // Veículos
      const { count: veiculosCount } = await supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", user.id);

      // Ordens Abertas
      const { count: ordensAbertasCount } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("status", "aberta")
        .eq("usuario_id", user.id);

      // Faturamento Mensal (status = concluida)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: ordensConcluidas } = await supabase
        .from("ordens_servico")
        .select("valor_total")
        .eq("status", "concluida")
        .eq("usuario_id", user.id)
        .gte("data_conclusao", firstDayOfMonth);

      const faturamento = ordensConcluidas?.reduce((acc, curr) => acc + (curr.valor_total || 0), 0) || 0;

      setMetrics({
        ordensAbertas: ordensAbertasCount || 0,
        clientesAtivos: clientesCount || 0,
        veiculos: veiculosCount || 0,
        faturamentoMensal: faturamento,
        charts: {
          ordens: [4, 6, 8, 5, 9, 12, ordensAbertasCount || 0].map(v => ({ value: v })),
          clientes: [20, 25, 30, 35, 40, 45, clientesCount || 0].map(v => ({ value: v })),
          veiculos: [15, 20, 25, 30, 35, 40, veiculosCount || 0].map(v => ({ value: v })),
          faturamento: [1200, 1500, 1100, 2000, 1800, 2500, faturamento].map(v => ({ value: v })),
        }
      });

      // Agendamentos de Hoje
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: agendamentos } = await supabase
        .from("agendamentos")
        .select(`
          *,
          clientes(nome),
          veiculos(modelo, placa)
        `)
        .eq("usuario_id", user.id)
        .eq("status", "pendente")
        .gte("data_agendamento", startOfDay.toISOString())
        .lte("data_agendamento", endOfDay.toISOString())
        .order("data_agendamento", { ascending: true });

      setAgendamentosHoje(agendamentos || []);
      setLoadingAgendamentos(false);
    };

    fetchMetrics();
  }, []);

  return (
    <DashboardLayout title="Dashboard" subtitle="Visão geral da sua oficina" showSearch>
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Ordens Abertas"
          value={metrics.ordensAbertas.toString()}
          subtitle="Em andamento/Abertas"
          icon={ClipboardList}
          variant="accent"
          href="/ordens-servico"
          chartData={metrics.charts.ordens}
        />
        <MetricCard
          title="Total de Clientes"
          value={metrics.clientesAtivos.toString()}
          subtitle="Cadastrados no sistema"
          icon={Users}
          href="/clientes"
          chartData={metrics.charts.clientes}
        />
        <MetricCard
          title="Total de Veículos"
          value={metrics.veiculos.toString()}
          subtitle="Cadastrados no sistema"
          icon={Car}
          href="/veiculos"
          chartData={metrics.charts.veiculos}
        />
        <MetricCard
          title="Faturamento Mensal"
          value={`R$ ${metrics.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Ordens concluídas no mês"
          icon={DollarSign}
          href="/financeiro"
          chartData={metrics.charts.faturamento}
          showToggle
        />
      </div>

      {/* Agendamentos de Hoje Section */}
      {agendamentosHoje.length > 0 && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
          <CardHeader className="py-4 bg-primary/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-primary">Agendamentos para Hoje</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {agendamentosHoje.length} Pendente(s)
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-primary/10">
              {agendamentosHoje.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-primary/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-white border-2 border-primary/20 text-primary w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shadow-sm">
                      <span className="text-xs uppercase opacity-60 leading-none mb-1">Hora</span>
                      {format(new Date(item.data_agendamento), "HH:mm")}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-card-foreground text-base">{item.clientes?.nome}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-primary/70">
                          <FileText className="w-3 h-3" /> {item.tipo_servico}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" /> {item.veiculos?.modelo || "Sem veículo"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      className="flex-1 sm:flex-none gradient-primary shadow-md"
                      onClick={() => navigate("/ordens-servico", { 
                        state: { 
                          autoFill: {
                            clienteId: item.cliente_id,
                            veiculoId: item.veiculo_id,
                            tipoServico: item.tipo_servico,
                            observacoes: item.observacoes,
                            agendamentoId: item.id
                          } 
                        } 
                      })}
                    >
                      <FileText className="w-4 h-4 mr-2" /> Abrir Ordem
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 sm:flex-none border-destructive/20 text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        const { error } = await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', item.id);
                        if (!error) {
                          setAgendamentosHoje(prev => prev.filter(a => a.id !== item.id));
                          toast({ title: "Agendamento declinado" });
                        }
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Declinar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full">
          <ServiceOrdersTable />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
