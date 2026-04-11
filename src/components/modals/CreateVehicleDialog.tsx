import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CreateVehicleDialog({ 
  open, 
  onOpenChange, 
  clienteId,
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  clienteId: string;
  onSuccess?: (veiculoId: string) => void;
}) {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState<string>("");
  const [km, setKm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!placa) {
      toast({ title: "Erro", description: "A placa do veículo é obrigatória.", variant: "destructive" });
      return;
    }
    if (!clienteId) {
      toast({ title: "Erro", description: "É necessário selecionar um cliente antes de cadastrar um veículo.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from("veiculos").insert({
      placa: placa.toUpperCase(),
      modelo,
      marca,
      ano: ano ? parseInt(ano) : null,
      km_atual: km ? parseInt(km) : null,
      cliente_id: clienteId,
      usuario_id: user.id
    }).select().single();

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Veículo cadastrado com sucesso!" });
      setPlaca(""); setModelo(""); setMarca(""); setAno(""); setKm("");
      onOpenChange(false);
      if (onSuccess && data) {
        onSuccess(data.id);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Placa *</Label>
            <Input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-1234" maxLength={8} />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex: Corolla" />
          </div>
          <div>
            <Label>Marca</Label>
            <Input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ex: Toyota" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ano</Label>
              <Input type="number" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="Ex: 2020" />
            </div>
            <div>
              <Label>KM Atual</Label>
              <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="Ex: 50000" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
