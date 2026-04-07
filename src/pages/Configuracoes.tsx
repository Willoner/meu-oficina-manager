import Sidebar from "@/components/Sidebar";
import { Settings } from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações da sua oficina</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">Página de configurações em construção.</p>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;
