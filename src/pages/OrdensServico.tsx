import { useState, useEffect } from "react";
import { 
  ClipboardList, Plus, Search, Trash2, Eye, Pencil, AlertTriangle, RefreshCw,
  Activity, Wrench, CirclePlay, Zap, Cpu, Paintbrush, Sparkles, Wind, Disc, Settings2, History,
  Filter, X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateClientDialog } from "@/components/modals/CreateClientDialog";
import { CreateVehicleDialog } from "@/components/modals/CreateVehicleDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VehicleHistoryTimeline } from "@/components/VehicleHistoryTimeline";

type OS = {
  id: string;
  status: string | null;
  observacoes: string | null;
  data_abertura: string | null;
  data_conclusao: string | null;
  cliente_id: string;
  veiculo_id: string;
  tipo_servico: string | null;
  valor_total: number | null;
  prazo: string | null;
  assinatura_cliente_aceito: boolean;
  assinatura_mecanico_aceito: boolean;
};

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string; cliente_id: string };
type Peca = { id: string; nome: string; valor_venda: number | null; estoque: number | null };

type ItemOS = {
  id?: string;
  tipo: "peca" | "servico";
  item_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
};

const servicosDisponiveis = [
  { label: "Motor", icon: Activity },
  { label: "Suspensão", icon: Wrench },
  { label: "Freios", icon: Disc },
  { label: "Elétrica", icon: Zap },
  { label: "Eletrônica", icon: Cpu },
  { label: "Funilaria", icon: Paintbrush },
  { label: "Estética", icon: Sparkles },
  { label: "Ar-condicionado", icon: Wind },
  { label: "Pneus", icon: CirclePlay },
  { label: "Transmissão", icon: Settings2 }
];

const statusColor: Record<string, string> = {
  aberta: "bg-chart-4/20 text-chart-4",
  em_andamento: "bg-chart-3/20 text-chart-3",
  concluida: "bg-chart-2/20 text-chart-2",
  cancelada: "bg-muted text-muted-foreground",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

const OrdensServico = () => {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCliente, setFilterCliente] = useState("todos");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("Gratuito");
  const [userEmail, setUserEmail] = useState<string>("");
  const [osCountMonth, setOsCountMonth] = useState(0);

  // Modal OS states
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [prazo, setPrazo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itensOS, setItensOS] = useState<ItemOS[]>([]);
  const [agendamentoIdParaConverter, setAgendamentoIdParaConverter] = useState<string | null>(null);

  // Modals for add items
  const [isPecaModalOpen, setIsPecaModalOpen] = useState(false);
  const [isServicoModalOpen, setIsServicoModalOpen] = useState(false);
  
  // Peca Form State
  const [selectedPecaId, setSelectedPecaId] = useState("");
  const [qtdPeca, setQtdPeca] = useState(1);

  // Servico Form State
  const [descServico, setDescServico] = useState("");
  const [valorServico, setValorServico] = useState<string>("");

  // Modals clients and vehicles
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Details Modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOSForDetails, setSelectedOSForDetails] = useState<OS | null>(null);
  const [osDetailsItems, setOsDetailsItems] = useState<ItemOS[]>([]);

  // Edit OS Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OS | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editObs, setEditObs] = useState("");

  // Delete OS State
  const [deleteOSId, setDeleteOSId] = useState<string | null>(null);
  
  // History Sheet state
  const [historyOpen, setHistoryOpen] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [resOrdens, resClientes, resVeiculos, resPecas, resUserPlan] = await Promise.all([
      supabase.from("ordens_servico").select("*").eq("usuario_id", user.id).order("data_abertura", { ascending: false }),
      supabase.from("clientes").select("id, nome").eq("usuario_id", user.id).order("nome"),
      supabase.from("veiculos").select("id, placa, modelo, cliente_id").eq("usuario_id", user.id).order("placa"),
      supabase.from("pecas").select("id, nome, valor_venda, estoque").eq("usuario_id", user.id).order("nome"),
      supabase.from("usuarios").select("plano").eq("id", user.id).single()
    ]);

    if (resOrdens.data) setOrdens(resOrdens.data);
    if (resClientes.data) setClientes(resClientes.data);
    if (resVeiculos.data) setVeiculos(resVeiculos.data);
    if (resPecas.data) setPecas(resPecas.data);
    if (resUserPlan.data) {
      setUserPlan(resUserPlan.data.plano || "Gratuito");
      setUserEmail(user.email || "");
    }

    // Count OS for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from("ordens_servico")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", user.id)
      .gte("created_at", firstDay);
    
    setOsCountMonth(count || 0);

    // Auto-check delays on load
    handleVerificarAtrasos(false);
  };

  const handleVerificarAtrasos = async (showToast = true) => {
    try {
      const { data, error } = await supabase.rpc('fn_verificar_atrasos_os');
      if (error) throw error;
      if (showToast && data) {
        toast({ 
          title: "Verificação de Atrasos", 
          description: data.notificacoes_enviadas > 0 
            ? `${data.notificacoes_enviadas} novas notificações de atraso geradas.` 
            : "Nenhum novo atraso detectado."
        });
      }
    } catch (err) {
      console.error("Erro ao verificar atrasos:", err);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchData();
    
    // Check for autoFill from Agenda
    const state = location.state as any;
    if (state?.autoFill) {
      const { autoFill } = state;
      setClienteId(autoFill.clienteId || "");
      setVeiculoId(autoFill.veiculoId || "");
      setTipoServico(autoFill.tipoServico || "");
      setObservacoes(autoFill.observacoes || "");
      setAgendamentoIdParaConverter(autoFill.agendamentoId || null);
      setOpen(true);
      
      // Clear location state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const veiculosFiltrados = clienteId ? veiculos.filter(v => v.cliente_id === clienteId) : [];

  const handleClienteChange = (value: string) => {
    setClienteId(value);
    setVeiculoId("");
  };

  const calcularTotalOS = () => {
    return itensOS.reduce((acc, item) => acc + item.valor_total, 0);
  };

  const handleCreateOS = () => {
    setClienteId("");
    setVeiculoId("");
    setTipoServico("");
    setPrazo("");
    setObservacoes("");
    setItensOS([]);
    setOpen(true);
  };

  const handleAddPeca = () => {
    if (!selectedPecaId) {
      toast({ title: "Erro", description: "Selecione uma peça.", variant: "destructive" });
      return;
    }
    const peca = pecas.find(p => p.id === selectedPecaId);
    if (!peca) return;

    if (qtdPeca > (peca.estoque || 0)) {
      toast({ title: "Estoque insuficiente", description: `Quantidade disponível: ${peca.estoque || 0}`, variant: "destructive" });
      return;
    }

    const valorUnitario = peca.valor_venda || 0;
    const item: ItemOS = {
      tipo: "peca",
      item_id: peca.id,
      descricao: peca.nome,
      quantidade: Number(qtdPeca),
      valor_unitario: valorUnitario,
      valor_total: valorUnitario * Number(qtdPeca)
    };

    setItensOS([...itensOS, item]);
    setIsPecaModalOpen(false);
    setSelectedPecaId("");
    setQtdPeca(1);
  };

  const handleAddServico = () => {
    if (!descServico.trim() || !valorServico) {
      toast({ title: "Erro", description: "Preencha a descrição e o valor do serviço.", variant: "destructive" });
      return;
    }
    
    const valorNum = parseFloat(valorServico.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      toast({ title: "Erro", description: "Valor inválido.", variant: "destructive" });
      return;
    }

    const item: ItemOS = {
      tipo: "servico",
      item_id: null,
      descricao: descServico.trim(),
      quantidade: 1,
      valor_unitario: valorNum,
      valor_total: valorNum
    };

    setItensOS([...itensOS, item]);
    setIsServicoModalOpen(false);
    setDescServico("");
    setValorServico("");
  };

  const handleRemoveItem = (index: number) => {
    setItensOS(itensOS.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!clienteId || !veiculoId || !tipoServico) {
      toast({ title: "Aviso", description: "Cliente, veículo e tipo de serviço são obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" }); 
      setLoading(false); 
      return; 
    }

    // Check plan limit
    const isTestUser = user.email === 'wilson.lisboa@oficinaemordem.com.br';
    if (userPlan === "Gratuito" && osCountMonth >= 10 && !isTestUser) {
      toast({ 
        title: "Limite atingido", 
        description: "Limite de OS do plano gratuito atingido. Faça upgrade para o Pro.", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    const totalOS = calcularTotalOS();

    // 1. Criar a Ordem de Serviço
    const { data: osData, error: osError } = await supabase.from("ordens_servico").insert({
      cliente_id: clienteId,
      veiculo_id: veiculoId,
      tipo_servico: tipoServico,
      prazo: prazo || null,
      observacoes: observacoes.trim() || null,
      usuario_id: user.id,
      status: "aberta",
      valor_total: totalOS
    }).select().single();

    if (osError || !osData) {
      toast({ title: "Erro ao criar OS", description: osError?.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // 2. Inserir os Itens
    if (itensOS.length > 0) {
      const itemsToInsert = itensOS.map(item => ({
        ordem_servico_id: osData.id,
        item_id: item.item_id || null,
        tipo: item.tipo,
        descricao: item.descricao, // Salva o nome exato (Ex: Pneu Aro 14)
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total
      }));

      const { error: itemsError } = await supabase.from("itens_os").insert(itemsToInsert);
      
      if (itemsError) {
        console.error("Erro ao salvar itens:", itemsError);
        toast({ 
          title: "Erro nos itens", 
          description: "A OS foi criada, mas as peças/serviços não foram salvos: " + itemsError.message, 
          variant: "destructive" 
        });
      }

      // 3. Atualizar o estoque
      for (const item of itensOS) {
        if (item.tipo === "peca" && item.item_id) {
          const peca = pecas.find(p => p.id === item.item_id);
          if (peca && peca.estoque !== null) {
             const novoEstoque = peca.estoque - item.quantidade;
             await supabase.from("pecas").update({ estoque: novoEstoque }).eq("id", item.item_id);
          }
        }
      }
    }

    // 4. Se veio de um agendamento, marcar como convertido
    if (agendamentoIdParaConverter) {
      await supabase
        .from("agendamentos")
        .update({ status: "convertido" })
        .eq("id", agendamentoIdParaConverter);
      setAgendamentoIdParaConverter(null);
    }

    toast({ title: "Sucesso", description: "Ordem de serviço criada com sucesso!" });
    setOpen(false);
    setLoading(false);
    fetchData();
  };

  const handleOpenDetails = async (os: OS) => {
    setSelectedOSForDetails(os);
    setOsDetailsItems([]);
    setDetailsOpen(true);
    
    // Fetch Items
    const { data } = await supabase.from('itens_os').select('*').eq('ordem_servico_id', os.id);
    if (data) {
      setOsDetailsItems(data as unknown as ItemOS[]);
    }
  };

  const handleEditOS = (os: OS) => {
    setEditingOS(os);
    setEditStatus(os.status || "aberta");
    setEditTipo(os.tipo_servico || "");
    setEditObs(os.observacoes || "");
    setEditOpen(true);
  };

  const handleUpdateOS = async () => {
    if (!editingOS) return;

    // Regra: Não permitir concluir sem assinaturas
    if (editStatus === "concluida" && (!editingOS.assinatura_cliente_aceito || !editingOS.assinatura_mecanico_aceito)) {
      toast({ 
        title: "Ação Bloqueada", 
        description: "A Ordem de Serviço só pode ser concluída após o aceite de ambas as assinaturas (Cliente e Mecânico) na página de visualização.", 
        variant: "destructive" 
      });
      return;
    }

    const hasSignatures = editingOS.assinatura_cliente_aceito || editingOS.assinatura_mecanico_aceito;

    setLoading(true);

    const updates: any = {
      status: editStatus,
      tipo_servico: editTipo,
      observacoes: editObs.trim() || null
    };

    // Resetar assinaturas se houver mudanças em OS já assinadas
    if (hasSignatures) {
      updates.assinatura_cliente_aceito = false;
      updates.assinatura_cliente_em = null;
      updates.assinatura_mecanico_aceito = false;
      updates.assinatura_mecanico_em = null;
    }

    const { error } = await supabase
      .from("ordens_servico")
      .update(updates)
      .eq("id", editingOS.id);

    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: "Falha ao atualizar OS: " + error.message, variant: "destructive" });
    } else {
      let msg = hasSignatures 
        ? "Alterações salvas. As assinaturas foram resetadas para segurança." 
        : "Ordem de serviço atualizada!";
        
      if (editStatus === "concluida") {
        msg = "Ordem concluída com sucesso!";
      }

      toast({ title: "Sucesso", description: msg });
      setEditOpen(false);
      fetchData();
    }
  };

  const handleDeleteOS = async () => {
    if (!deleteOSId) return;
    
    try {
      // Obter itens da OS primeiro para repor no estoque
      const { data: itens } = await supabase.from('itens_os').select('*').eq('ordem_servico_id', deleteOSId);
      if (itens && itens.length > 0) {
        for (const item of itens) {
          if (item.tipo === 'peca' && item.item_id) {
            const { data: p } = await supabase.from('pecas').select('estoque').eq('id', item.item_id).single();
            if (p && p.estoque !== null) {
              await supabase.from('pecas').update({ estoque: p.estoque + (item.quantidade || 1) }).eq('id', item.item_id);
            }
          }
        }
      }

      // Excluir OS
      const { error } = await supabase.from('ordens_servico').delete().eq('id', deleteOSId);
      if (error) throw error;

      toast({ title: "Sucesso", description: "Ordem excluída com sucesso." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao excluir. " + error.message, variant: "destructive" });
    } finally {
      setDeleteOSId(null);
    }
  };

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || "—";
  
  const filteredOrdens = ordens.filter(o => {
    const matchesSearch = !search || 
      getClienteNome(o.cliente_id).toLowerCase().includes(search.toLowerCase()) ||
      veiculos.find(v => v.id === o.veiculo_id)?.modelo.toLowerCase().includes(search.toLowerCase()) ||
      veiculos.find(v => v.id === o.veiculo_id)?.placa.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !filterStatus || filterStatus === "todos" || o.status === filterStatus;
    const matchesCliente = !filterCliente || filterCliente === "todos" || o.cliente_id === filterCliente;
    
    const osDate = o.data_abertura ? new Date(o.data_abertura) : null;
    const matchesDateStart = !filterDateStart || !osDate || osDate >= new Date(filterDateStart + "T00:00:00");
    const matchesDateEnd = !filterDateEnd || !osDate || osDate <= new Date(filterDateEnd + "T23:59:59");

    return matchesSearch && matchesStatus && matchesCliente && matchesDateStart && matchesDateEnd;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("todos");
    setFilterCliente("todos");
    setFilterDateStart("");
    setFilterDateEnd("");
  };

  const hasActiveFilters = search || filterStatus !== "todos" || filterCliente !== "todos" || filterDateStart || filterDateEnd;

  return (
    <DashboardLayout title="Ordens de Serviço" subtitle="Gerencie todas as ordens de serviço">
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar ordem..." className="pl-9 w-full sm:w-64" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant={showFilters ? "secondary" : "outline"} 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" /> 
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-[10px]">!</Badge>}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleVerificarAtrasos(true)} className="flex-1 sm:flex-none gap-2">
                <RefreshCw className="w-4 h-4" /> <span className="hidden md:inline">Verificar Atrasos</span>
              </Button>
              {userPlan === "Gratuito" && osCountMonth >= 10 && userEmail !== 'wilson.lisboa@oficinaemordem.com.br' ? (
                <Button onClick={() => navigate("/configuracoes")} className="flex-1 sm:flex-none gradient-primary animate-pulse">
                  Upgrade para Pro
                </Button>
              ) : (
                <Button onClick={() => setOpen(true)} className="flex-1 sm:flex-none gradient-primary">
                  <Plus className="w-4 h-4" /> Nova <span className="hidden sm:inline">Ordem</span>
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 mb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Todos Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos Status</SelectItem>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Cliente</Label>
                  <Select value={filterCliente} onValueChange={setFilterCliente}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Todos Clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos Clientes</SelectItem>
                      {clientes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">De (Data)</Label>
                  <Input 
                    type="date" 
                    className="h-9 text-sm" 
                    value={filterDateStart} 
                    onChange={e => setFilterDateStart(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Até (Data)</Label>
                  <Input 
                    type="date" 
                    className="h-9 text-sm" 
                    value={filterDateEnd} 
                    onChange={e => setFilterDateEnd(e.target.value)} 
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end border-t border-border/50 pt-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1">
                    <X className="w-3 h-3" /> Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {filteredOrdens.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              {hasActiveFilters 
                ? "Nenhuma ordem de serviço encontrada com os filtros selecionados." 
                : "Nenhuma ordem de serviço cadastrada ainda. Clique em \"Nova Ordem\" para começar."}
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdens.map(o => {
                    const isAtrasada = o.status !== 'concluida' && o.status !== 'cancelada' && o.prazo && new Date(o.prazo) < new Date(new Date().setHours(0,0,0,0));
                    
                    return (
                      <TableRow key={o.id} className={isAtrasada ? "bg-destructive/5 hover:bg-destructive/10 border-l-4 border-l-destructive" : ""}>
                        <TableCell>{o.data_abertura ? new Date(o.data_abertura).toLocaleDateString("pt-BR") : "—"}</TableCell>
                        <TableCell className="font-medium">{getClienteNome(o.cliente_id)}</TableCell>
                        <TableCell>{veiculos.find(v => v.id === o.veiculo_id)?.modelo || "—"}</TableCell>
                        <TableCell>
                          {o.prazo ? (
                            <span className={isAtrasada ? "text-destructive font-bold flex items-center gap-1" : ""}>
                              {isAtrasada && <AlertTriangle className="w-3 h-3" />}
                              {new Date(o.prazo).toLocaleDateString("pt-BR")}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{o.tipo_servico || "—"}</TableCell>
                        <TableCell>{o.valor_total ? formatCurrency(o.valor_total) : "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColor[o.status || "aberta"] || ""}>
                            {o.status || "aberta"}
                          </Badge>
                        </TableCell>
                      <TableCell className="text-right space-x-2 text-nowrap">
                        <Button variant="outline" size="icon" onClick={() => navigate(`/ordens-servico/${o.id}/visualizar`)} title="Visualizar e Imprimir OS">
                          <Eye className="w-4 h-4" />
                        </Button>
                         <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => navigate(`/ordens-servico/${o.id}/editar`)} 
                          title={o.status === "concluida" ? "OS concluída não pode ser editada" : "Editar OS"}
                          disabled={o.status === "concluida"}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteOSId(o.id)} title="Excluir OS">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova OS */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            <DialogDescription>Preencha os detalhes e insira os itens (peças ou serviços avulsos).</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {veiculoId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setHistoryOpen(true)} 
                      className="text-primary hover:text-primary/80 border-primary/20 hover:border-primary/40 bg-primary/5"
                      title="Ver Histórico deste Veículo"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Tipo de Serviço Principal *</Label>
                <Select value={tipoServico} onValueChange={setTipoServico}>
                  <SelectTrigger className="mt-1 text-sm h-10">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicosDisponiveis.map(s => (
                      <SelectItem key={s.label} value={s.label}>
                        <div className="flex items-center gap-2">
                          <s.icon className="w-4 h-4 text-muted-foreground" />
                          <span>{s.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prazo">Prazo de Entrega</Label>
                <Input id="prazo" type="date" className="mt-1" value={prazo} onChange={e => setPrazo(e.target.value)} />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea className="mt-1" value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Detalhes, problemas relatados, etc." />
              </div>
            </div>

            <div className="border rounded-md p-4 bg-muted/20 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Itens da OS</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setIsPecaModalOpen(true)}>+ Peça</Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsServicoModalOpen(true)}>+ Serviço</Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto mb-4 border rounded bg-card min-h-[200px]">
                {itensOS.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground mt-10">
                    Nenhum item adicionado.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Descrição</TableHead>
                        <TableHead className="text-xs">Qtd</TableHead>
                        <TableHead className="text-xs">Total</TableHead>
                        <TableHead className="text-xs w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensOS.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs py-2">
                            <span className="font-medium">{item.descricao}</span>
                            <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">{item.tipo}</Badge>
                          </TableCell>
                          <TableCell className="text-xs py-2">{item.quantidade}</TableCell>
                          <TableCell className="text-xs py-2">{formatCurrency(item.valor_total)}</TableCell>
                          <TableCell className="text-xs py-2 text-right">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(idx)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="mt-auto border-t pt-2 flex justify-between items-center font-bold text-lg">
                <span>Total Estimado:</span>
                <span className="text-primary">{formatCurrency(calcularTotalOS())}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar Ordem"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Peça */}
      <Dialog open={isPecaModalOpen} onOpenChange={setIsPecaModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Peça do Estoque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Selecione a Peça</Label>
              <Select value={selectedPecaId} onValueChange={setSelectedPecaId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Buscar peça..." />
                </SelectTrigger>
                <SelectContent>
                  {pecas.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} (Disp: {p.estoque || 0}) - {formatCurrency(p.valor_venda || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input type="number" min="1" className="mt-1" value={qtdPeca} onChange={e => setQtdPeca(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPecaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddPeca}>Adicionar à OS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Serviço */}
      <Dialog open={isServicoModalOpen} onOpenChange={setIsServicoModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Serviço Avulso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Descrição do Serviço</Label>
              <Input placeholder="Ex: Mão de obra troca de óleo" className="mt-1" value={descServico} onChange={e => setDescServico(e.target.value)} />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input placeholder="Ex: 150.00" type="number" step="0.01" className="mt-1" value={valorServico} onChange={e => setValorServico(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServicoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddServico}>Adicionar à OS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes OS */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {selectedOSForDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Cliente</span>
                  <span className="font-medium">{getClienteNome(selectedOSForDetails.cliente_id)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Veículo</span>
                  <span className="font-medium">{veiculos.find(v => v.id === selectedOSForDetails.veiculo_id)?.modelo || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Data de Abertura</span>
                  <span className="font-medium">{selectedOSForDetails.data_abertura ? new Date(selectedOSForDetails.data_abertura).toLocaleDateString("pt-BR") : "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status</span>
                  <Badge variant="secondary" className={statusColor[selectedOSForDetails.status || "aberta"] || ""}>
                    {selectedOSForDetails.status || "aberta"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Itens Inclusos</h4>
                {osDetailsItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Nenhum item lançado.</p>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>V. Unit</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {osDetailsItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {item.descricao}
                            <Badge variant="outline" className="ml-2 text-[10px] scale-90">{item.tipo}</Badge>
                          </TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{item.valor_unitario ? formatCurrency(item.valor_unitario) : "—"}</TableCell>
                          <TableCell>{item.valor_total ? formatCurrency(item.valor_total) : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                <span className="font-semibold text-lg">Total Geral:</span>
                <span className="font-bold text-xl text-primary">
                  {formatCurrency(selectedOSForDetails.valor_total || 0)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateClientDialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen} onSuccess={(id) => { fetchData(); setClienteId(id); setIsClientModalOpen(false); }} />
      <CreateVehicleDialog 
        open={isVehicleModalOpen} 
        onOpenChange={setIsVehicleModalOpen} 
        clienteId={clienteId} 
        onSuccess={(id, newClienteId) => { 
          fetchData(); 
          if (!clienteId && newClienteId) setClienteId(newClienteId);
          setVeiculoId(id); 
          setIsVehicleModalOpen(false); 
        }} 
      />

      {/* Modal Editar OS */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ordem de Serviço</DialogTitle>
            <DialogDescription>Altere o status, serviço principal ou observações.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {(editingOS?.assinatura_cliente_aceito || editingOS?.assinatura_mecanico_aceito) && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 text-orange-600 rounded-md text-xs border border-orange-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Esta OS já possui assinaturas. Salvar alterações resetará os aceites e exigirá nova assinatura.</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Serviço Principal</Label>
              <Select value={editTipo} onValueChange={setEditTipo}>
                <SelectTrigger className="text-sm h-10"><SelectValue placeholder="Selecione o tipo de serviço" /></SelectTrigger>
                <SelectContent>
                  {servicosDisponiveis.map(s => (
                    <SelectItem key={s.label} value={s.label}>
                      <div className="flex items-center gap-2">
                        <s.icon className="w-4 h-4 text-muted-foreground" />
                        <span>{s.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={editObs} onChange={e => setEditObs(e.target.value)} placeholder="Detalhes atualizados..." rows={4} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateOS} disabled={loading}>{loading ? "Salvando..." : "Salvar Alterações"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão OS */}
      <AlertDialog open={!!deleteOSId} onOpenChange={(isOpen) => !isOpen && setDeleteOSId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a OS e todos os seus itens lançados. Peças vinculadas retornarão automaticamente ao estoque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOS} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Histórico do Veículo
            </SheetTitle>
            <SheetDescription>
              Serviços anteriores realizados neste veículo para consulta rápida.
            </SheetDescription>
          </SheetHeader>
          {veiculoId && <VehicleHistoryTimeline vehicleId={veiculoId} />}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default OrdensServico;
