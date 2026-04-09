import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Veiculo = { id: string; placa: string; modelo: string; clientes: { nome: string } | null };

export function SearchVehicleDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  useEffect(() => {
    if (open) {
      searchVeiculos("");
    } else {
      setSearchTerm("");
    }
  }, [open]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchVeiculos(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchVeiculos = async (term: string) => {
    let query = supabase.from("veiculos").select("id, placa, modelo, clientes(nome)").limit(10);
    
    if (term) {
      query = query.or(`placa.ilike.%${term}%,modelo.ilike.%${term}%`);
    }

    const { data } = await query;
    if (data) setVeiculos(data as unknown as Veiculo[]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buscar Veículo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Digite a placa ou modelo..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            autoFocus
          />
          
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {veiculos.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground pt-4">Nenhum veículo encontrado.</p>
            ) : (
              veiculos.map((v) => (
                <div key={v.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="font-semibold text-primary">{v.placa} <span className="text-foreground font-normal">- {v.modelo}</span></div>
                  <div className="text-sm text-muted-foreground text-card-foreground mt-1">Cliente: {v.clientes?.nome || "—"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
