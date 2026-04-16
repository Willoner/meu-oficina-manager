import { useState, useEffect } from "react";
import { ClipboardList, Users, Car, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import ServiceOrdersTable from "@/components/ServiceOrdersTable";

const Index = () => {
  const [metrics, setMetrics] = useState({
    ordensAbertas: 0,
    clientesAtivos: 0,
    veiculos: 0,
    faturamentoMensal: 0,
  });


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
      });
    };

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <Header title="Dashboard" subtitle="Visão geral da sua oficina" showSearch />

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
          <div className="grid grid-cols-1 gap-6">
            <div className="w-full">
              <ServiceOrdersTable />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Index;
