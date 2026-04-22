import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Car, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

type Agendamento = {
  id: string;
  cliente_id: string;
  veiculo_id: string | null;
  tipo_servico: string;
  data_agendamento: string;
  status: string;
  observacoes: string | null;
  clientes: { nome: string };
  veiculos: { modelo: string; placa: string } | null;
};

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string; cliente_id: string };

const statusMap: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
  convertido: { label: "Convertido em OS", color: "bg-success/10 text-success border-success/20" },
};

const Agenda = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [horario, setHorario] = useState("08:00");
  const [observacoes, setObservacoes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [resAgendamentos, resClientes, resVeiculos] = await Promise.all([
        supabase
          .from("agendamentos")
          .select(`
            *,
            clientes(nome),
            veiculos(modelo, placa)
          `)
          .eq("usuario_id", user.id)
          .order("data_agendamento", { ascending: true }),
        supabase.from("clientes").select("id, nome").eq("usuario_id", user.id).order("nome"),
        supabase.from("veiculos").select("id, placa, modelo, cliente_id").eq("usuario_id", user.id).order("placa"),
      ]);

      if (resAgendamentos.data) setAgendamentos(resAgendamentos.data as any);
      if (resClientes.data) setClientes(resClientes.data);
      if (resVeiculos.data) setVeiculos(resVeiculos.data);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const agendamentosNoDia = agendamentos.filter(a => {
    if (!date) return false;
    const d = new Date(a.data_agendamento);
    return (
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  });

  const handleSaveAgendamento = async () => {
    if (!clienteId || !tipoServico || !date || !horario) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      setFormLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [hours, minutes] = horario.split(":").map(Number);
      const dataAgendamento = new Date(date);
      dataAgendamento.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from("agendamentos").insert({
        usuario_id: user.id,
        cliente_id: clienteId,
        veiculo_id: veiculoId || null,
        tipo_servico: tipoServico,
        data_agendamento: dataAgendamento.toISOString(),
        observacoes: observacoes.trim() || null,
        status: "pendente"
      });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Agendamento realizado com sucesso!" });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Status atualizado", description: `Agendamento marcado como ${newStatus}.` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const convertToOS = (agendamento: Agendamento) => {
    // Navigate to OS page with state to auto-fill the form
    navigate("/ordens-servico", { 
      state: { 
        autoFill: {
          clienteId: agendamento.cliente_id,
          veiculoId: agendamento.veiculo_id,
          tipoServico: agendamento.tipo_servico,
          observacoes: agendamento.observacoes,
          agendamentoId: agendamento.id
        } 
      } 
    });
  };

  const resetForm = () => {
    setClienteId("");
    setVeiculoId("");
    setTipoServico("");
    setHorario("08:00");
    setObservacoes("");
  };

  const veiculosDoCliente = clienteId ? veiculos.filter(v => v.cliente_id === clienteId) : [];

  return (
    <DashboardLayout title="Agenda" subtitle="Gerencie seus agendamentos e horários">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Calendário */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                locale={ptBR}
              />
            </CardContent>
          </Card>

          <Button 
            className="w-full gradient-primary py-6 text-lg font-semibold"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" /> Novo Agendamento
          </Button>
        </div>

        {/* Lado Direito: Listagem do Dia */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-card min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
                </CardTitle>
                <CardDescription>
                  {agendamentosNoDia.length} agendamento(s) para este dia
                </CardDescription>
              </div>
              <CalendarIcon className="w-6 h-6 text-primary opacity-40" />
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : agendamentosNoDia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="bg-muted/30 p-4 rounded-full">
                    <Clock className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground font-medium">Nenhum agendamento para este dia.</p>
                    <p className="text-sm text-muted-foreground/60">Clique no botão abaixo do calendário para cadastrar.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {agendamentosNoDia.map((item) => (
                    <div 
                      key={item.id} 
                      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-sidebar-border bg-sidebar hover:border-primary/30 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center bg-primary/10 text-primary w-16 h-16 rounded-lg font-bold text-lg">
                          {format(new Date(item.data_agendamento), "HH:mm")}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-card-foreground flex items-center gap-2">
                             {item.clientes?.nome}
                             <Badge variant="outline" className={statusMap[item.status]?.color + " text-[10px] uppercase font-bold px-2 py-0"}>
                               {statusMap[item.status]?.label}
                             </Badge>
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {item.veiculos?.modelo || "Sem veículo"}</span>
                            <span className="flex items-center gap-1 font-medium text-primary/80"><FileText className="w-3 h-3" /> {item.tipo_servico}</span>
                          </div>
                          {item.observacoes && (
                            <p className="text-xs text-muted-foreground italic mt-2 line-clamp-1">"{item.observacoes}"</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                        {item.status === 'pendente' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 sm:flex-none text-success border-success/20 hover:bg-success/10"
                              onClick={() => convertToOS(item)}
                            >
                              <FileText className="w-4 h-4 mr-2" /> Abrir OS
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 sm:flex-none text-destructive border-destructive/20 hover:bg-destructive/10"
                              onClick={() => handleStatusChange(item.id, 'cancelado')}
                            >
                              <XCircle className="w-4 h-4 mr-2" /> Declinar
                            </Button>
                          </>
                        )}
                        {item.status === 'convertido' && (
                          <div className="flex items-center gap-2 text-success font-medium text-sm pr-2">
                            <CheckCircle2 className="w-4 h-4" /> Convertido
                          </div>
                        )}
                        {item.status === 'cancelado' && (
                          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm pr-2">
                            <XCircle className="w-4 h-4" /> Cancelado
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Marque um horário para um serviço futuro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Veículo (Opcional)</Label>
              <Select value={veiculoId} onValueChange={setVeiculoId} disabled={!clienteId}>
                <SelectTrigger>
                  <SelectValue placeholder={clienteId ? "Selecione o veículo" : "Selecione um cliente primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {veiculosDoCliente.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Escolhida</Label>
                <Input value={date ? format(date, "dd/MM/yyyy") : ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Input type="time" value={horario} onChange={e => setHorario(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Serviço *</Label>
              <Select value={tipoServico} onValueChange={setTipoServico}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revisão Geral">Revisão Geral</SelectItem>
                  <SelectItem value="Troca de Óleo">Troca de Óleo</SelectItem>
                  <SelectItem value="Freios">Freios</SelectItem>
                  <SelectItem value="Suspensão">Suspensão</SelectItem>
                  <SelectItem value="Diferencial/Câmbio">Diferencial/Câmbio</SelectItem>
                  <SelectItem value="Elétrica">Elétrica</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea 
                placeholder="Notas adicionais..." 
                value={observacoes} 
                onChange={e => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveAgendamento} disabled={formLoading} className="gradient-primary">
              {formLoading ? "Salvando..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Agenda;
