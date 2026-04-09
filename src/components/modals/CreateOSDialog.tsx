import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string; cliente_id: string };

export function CreateOSDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchVeiculos();
    }
  }, [open]);

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome").order("nome");
    if (data) setClientes(data);
  };

  const fetchVeiculos = async () => {
    const { data } = await supabase.from("veiculos").select("id, placa, modelo, cliente_id").order("placa");
    if (data) setVeiculos(data);
  };

  const veiculosFiltrados = clienteId ? veiculos.filter(v => v.cliente_id === clienteId) : [];

  const handleClienteChange = (value: string) => {
    setClienteId(value);
    setVeiculoId("");
  };

  const handleSave = async () => {
    if (!clienteId || !veiculoId) {
      toast({ title: "Erro", description: "Cliente e veículo são obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); 
      setLoading(false); 
      return; 
    }

    const { error } = await supabase.from("ordens_servico").insert({
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      observacoes: observacoes.trim() || null,
      usuario_id: user.id,
      status: "aberta",
    });

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ordem de serviço criada!" });
      setClienteId(""); setVeiculoId(""); setObservacoes("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cliente *</Label>
            <Select value={clienteId} onValueChange={handleClienteChange}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Veículo *</Label>
            <Select value={veiculoId} onValueChange={setVeiculoId} disabled={!clienteId}>
              <SelectTrigger><SelectValue placeholder={clienteId ? "Selecione o veículo" : "Selecione um cliente primeiro"} /></SelectTrigger>
              <SelectContent>
                {veiculosFiltrados.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Detalhes do serviço..." />
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
