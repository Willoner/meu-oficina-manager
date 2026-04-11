import { useState, useEffect } from "react";
import { ClipboardList, Plus, Search, Filter } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateClientDialog } from "@/components/modals/CreateClientDialog";
import { CreateVehicleDialog } from "@/components/modals/CreateVehicleDialog";

type OS = {
  id: string;
  status: string | null;
  observacoes: string | null;
  data_abertura: string | null;
  cliente_id: string;
  veiculo_id: string;
};

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string; cliente_id: string };

const servicosDisponiveis = [
  "Motor", "Suspensão", "Freios", "Elétrica", "Eletrônica", 
  "Funilaria", "Estética", "Ar-condicionado", "Pneus", "Transmissão"
];

const statusColor: Record<string, string> = {
  aberta: "bg-chart-4/20 text-chart-4",
  em_andamento: "bg-chart-3/20 text-chart-3",
  concluida: "bg-chart-2/20 text-chart-2",
};

const OrdensServico = () => {
  const [open, setOpen] = useState(false);
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrdens = async () => {
    const { data } = await supabase.from("ordens_servico").select("*").order("data_abertura", { ascending: false });
    if (data) setOrdens(data);
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome").order("nome");
    if (data) setClientes(data);
  };

  const fetchVeiculos = async () => {
    const { data } = await supabase.from("veiculos").select("id, placa, modelo, cliente_id").order("placa");
    if (data) setVeiculos(data);
  };

  useEffect(() => { fetchOrdens(); fetchClientes(); fetchVeiculos(); }, []);

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

  const handleVehicleCreated = (id: string) => {
    fetchVeiculos();
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
    if (!user) { toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); setLoading(false); return; }
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
      setOpen(false);
      setClienteId(""); setVeiculoId(""); setTipoServico(""); setObservacoes("");
      fetchOrdens();
    }
  };

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || "—";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
                <p className="text-sm text-muted-foreground">Gerencie todas as ordens de serviço</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar ordem..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button className="gap-2" onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4" /> Nova Ordem
              </Button>
            </div>
          </div>
        </header>
        <div className="p-8">
          {ordens.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Nenhuma ordem de serviço cadastrada ainda. Clique em "Nova Ordem" para começar.
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordens.map(o => (
                    <TableRow key={o.id}>
                      <TableCell>{o.data_abertura ? new Date(o.data_abertura).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell className="font-medium">{getClienteNome(o.cliente_id)}</TableCell>
                      <TableCell>{veiculos.find(v => v.id === o.veiculo_id)?.modelo || "—"}</TableCell>
                      <TableCell>{(o as any).tipo_servico || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColor[o.status || "aberta"] || ""}>
                          {o.status || "aberta"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
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
                  <SelectTrigger className="flex-1"><SelectValue placeholder={clienteId ? "Selecione o veículo" : "Selecione um cliente primeiro"} /></SelectTrigger>
                  <SelectContent>
                    {veiculosFiltrados.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setIsVehicleModalOpen(true)} disabled={!clienteId} title="Cadastrar Novo Veículo">
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
              <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Cole links de imagens ou digite detalhes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CreateClientDialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen} onSuccess={handleClientCreated} />
      <CreateVehicleDialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen} clienteId={clienteId} onSuccess={handleVehicleCreated} />
    </div>
  );
};

export default OrdensServico;
