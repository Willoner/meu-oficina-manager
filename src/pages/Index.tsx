import { ClipboardList, Users, Car, DollarSign, Bell, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import ServiceOrdersTable from "@/components/ServiceOrdersTable";
import QuickActions from "@/components/QuickActions";
import { Input } from "@/components/ui/input";

const Index = () => {
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
              value="12"
              subtitle="vs. mês anterior"
              icon={ClipboardList}
              trend={{ value: "8%", positive: true }}
              variant="accent"
              href="/ordens-servico"
            />
            <MetricCard
              title="Clientes Ativos"
              value="148"
              subtitle="últimos 30 dias"
              icon={Users}
              trend={{ value: "12%", positive: true }}
              href="/clientes"
            />
            <MetricCard
              title="Veículos em Serviço"
              value="7"
              subtitle="neste momento"
              icon={Car}
              href="/veiculos"
            />
            <MetricCard
              title="Faturamento Mensal"
              value="R$ 42.580"
              subtitle="vs. mês anterior"
              icon={DollarSign}
              trend={{ value: "15%", positive: true }}
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
