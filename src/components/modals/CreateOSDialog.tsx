import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { CreateClientDialog } from "@/components/modals/CreateClientDialog";
import { CreateVehicleDialog } from "@/components/modals/CreateVehicleDialog";
import { PlanLimitModal } from "@/components/modals/PlanLimitModal";

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string; cliente_id: string };

const servicosDisponiveis = [
  "Motor", "Suspensão", "Freios", "Elétrica", "Eletrônica", 
  "Funilaria", "Estética", "Ar-condicionado", "Pneus", "Transmissão"
];

export function CreateOSDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState("Gratuito");
  const [osCountMonth, setOsCountMonth] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchVeiculos();
      fetchUserPlan();
    }
  }, [open]);

  const fetchUserPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email || "");

    const { data: userData } = await supabase
      .from("usuarios")
      .select("plano")
      .eq("id", user.id)
      .single();
    
    if (userData?.plano) {
      setUserPlan(userData.plano);
    }

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from("ordens_servico")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", user.id)
      .gte("created_at", firstDay);
    
    setOsCountMonth(count || 0);
  };

  const fetchClientes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("clientes")
      .select("id, nome")
      .eq("usuario_id", user.id)
      .order("nome");
    if (data) setClientes(data);
  };

  const fetchVeiculos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("veiculos")
      .select("id, placa, modelo, cliente_id")
      .eq("usuario_id", user.id)
      .order("placa");
    if (data) setVeiculos(data);
  };

  const veiculosFiltrados = clienteId ? veiculos.filter(v => v.cliente_id === clienteId) : [];

  const handleClienteChange = (value: string) => {
    setClienteId(value);
    setVeiculoId("");
  };

  const handleClientCreated = (id: string) => {
    fetchClientes();
    setClienteId(id);
    setIsClientModalOpen(false);
  };

  const handleVehicleCreated = (id: string, newClienteId: string) => {
    fetchVeiculos();
    if (!clienteId && newClienteId) {
      setClienteId(newClienteId);
    }
    setVeiculoId(id);
    setIsVehicleModalOpen(false);
  };

  const handleSave = async () => {
    if (!clienteId || !veiculoId || !tipoServico) {
      toast({ title: "Erro", description: "Cliente, veículo e tipo de serviço são obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); 
      setLoading(false); 
      return; 
    }

    // Check plan limit
    const isTestUser = user.email === 'wilson.lisboa@oficinaemordem.com.br';
    if (userPlan !== "Pro" && osCountMonth >= 10 && !isTestUser) {
      setIsLimitModalOpen(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("ordens_servico").insert({
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      tipo_servico: tipoServico,
      observacoes: observacoes.trim() || null,
      usuario_id: user.id,
      status: "aberta",
    });

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ordem de serviço criada!" });
      setClienteId(""); setVeiculoId(""); setTipoServico(""); setObservacoes("");
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cliente *</Label>
            <div className="flex gap-2 mt-1">
              <Select value={clienteId} onValueChange={handleClienteChange}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setIsClientModalOpen(true)} title="Cadastrar Novo Cliente">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Veículo *</Label>
            <div className="flex gap-2 mt-1">
              <Select value={veiculoId} onValueChange={setVeiculoId} disabled={!clienteId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={clienteId ? (veiculosFiltrados.length > 0 ? "Selecione o veículo" : "Nenhum veículo encontrado") : "Selecione um cliente primeiro"} /></SelectTrigger>
                <SelectContent>
                  {veiculosFiltrados.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setIsVehicleModalOpen(true)} title="Cadastrar Novo Veículo">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Tipo de Serviço *</Label>
            <Select value={tipoServico} onValueChange={setTipoServico}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo de serviço" /></SelectTrigger>
              <SelectContent>
                {servicosDisponiveis.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
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
    <CreateClientDialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen} onSuccess={handleClientCreated} />
    <CreateVehicleDialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen} clienteId={clienteId} onSuccess={handleVehicleCreated} />
      <PlanLimitModal 
        open={isLimitModalOpen} 
        onOpenChange={setIsLimitModalOpen} 
        limit={10} 
        usage={osCountMonth} 
      />
    </>
  );
}
