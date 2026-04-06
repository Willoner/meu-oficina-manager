import { Users, Plus, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Clientes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus clientes ativos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar cliente..." className="pl-9 w-64" />
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Novo Cliente
              </Button>
            </div>
          </div>
        </header>
        <div className="p-8">
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Nenhum cliente cadastrado ainda. Clique em "Novo Cliente" para começar.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clientes;
