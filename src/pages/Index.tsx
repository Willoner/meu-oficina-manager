import { useState, useEffect } from "react";
import { ClipboardList, Users, Car, DollarSign, Bell, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import ServiceOrdersTable from "@/components/ServiceOrdersTable";
import QuickActions from "@/components/QuickActions";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [metrics, setMetrics] = useState({
    ordensAbertas: 0,
    clientesAtivos: 0,
    veiculos: 0,
    faturamentoMensal: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      // Clientes
      const { count: clientesCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      // Veículos
      const { count: veiculosCount } = await supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true });

      // Ordens Abertas
      const { count: ordensAbertasCount } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("status", "aberta");

      // Faturamento Mensal (status = concluida)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: ordensConcluidas } = await supabase
        .from("ordens_servico")
        .select("valor_total")
        .eq("status", "concluida")
        .gte("data_conclusao", firstDayOfMonth);

      const faturamento = ordensConcluidas?.reduce((acc, curr) => acc + (curr.valor_total || 0), 0) || 0;

      setMetrics({
        ordensAbertas: ordensAbertasCount || 0,
        clientesAtivos: clientesCount || 0,
        veiculos: veiculosCount || 0,
        faturamentoMensal: faturamento,
      });
    };

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Visão geral da sua oficina</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9 w-64" />
              </div>
              <button className="relative w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Bell className="w-5 h-5 text-secondary-foreground" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                OF
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              title="Ordens Abertas"
              value={metrics.ordensAbertas.toString()}
              subtitle="Em andamento/Abertas"
              icon={ClipboardList}
              variant="accent"
              href="/ordens-servico"
            />
            <MetricCard
              title="Total de Clientes"
              value={metrics.clientesAtivos.toString()}
              subtitle="Cadastrados no sistema"
              icon={Users}
              href="/clientes"
            />
            <MetricCard
              title="Total de Veículos"
              value={metrics.veiculos.toString()}
              subtitle="Cadastrados no sistema"
              icon={Car}
              href="/veiculos"
            />
            <MetricCard
              title="Faturamento Mensal"
              value={`R$ ${metrics.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Ordens concluídas no mês"
              icon={DollarSign}
              href="/financeiro"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ServiceOrdersTable />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
