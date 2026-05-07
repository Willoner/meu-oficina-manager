import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Package,
  Wrench,
  Loader2,
  Pencil
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OS = {
  id: string;
  status: string | null;
  tipo_servico: string | null;
  observacoes: string | null;
  cliente_id: string;
  veiculo_id: string;
  valor_total: number | null;
  prazo: string | null;
  assinatura_cliente_aceito: boolean;
  assinatura_mecanico_aceito: boolean;
};

type ItemOS = {
  id?: string;
  tipo: "peca" | "servico";
  item_id: string | null;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
};

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string; cliente_id: string };
type Peca = { id: string; nome: string; valor_venda: number | null; estoque: number | null };

const servicosDisponiveis = [
  "Motor", "Suspensão", "Freios", "Elétrica", "Eletrônica", 
  "Funilaria", "Estética", "Ar-condicionado", "Pneus", "Transmissão"
];

const EditarOS = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // OS Data
  const [os, setOs] = useState<OS | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [status, setStatus] = useState("");
  const [prazo, setPrazo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itensOS, setItensOS] = useState<ItemOS[]>([]);
  const [originalItens, setOriginalItens] = useState<ItemOS[]>([]);

  // Master Data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);

  // Item Modals
  const [isPecaModalOpen, setIsPecaModalOpen] = useState(false);
  const [isServicoModalOpen, setIsServicoModalOpen] = useState(false);
  
  // Peca Form State
  const [selectedPecaId, setSelectedPecaId] = useState("");
  const [qtdPeca, setQtdPeca] = useState(1);

  // Servico Form State
  const [descServico, setDescServico] = useState("");
  const [valorServico, setValorServico] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: osData, error: osError } = await supabase
        .from("ordens_servico")
        .select("*")
        .eq("id", id)
        .single();
        
      if (osError || !osData) {
        toast({ title: "Erro", description: "Ordem de serviço não encontrada.", variant: "destructive" });
        navigate("/ordens-servico");
        return;
      }

      setOs(osData as OS);
      setClienteId(osData.cliente_id);
      setVeiculoId(osData.veiculo_id);
      setTipoServico(osData.tipo_servico || "");
      setStatus(osData.status || "aberta");
      setPrazo(osData.prazo || "");
      setObservacoes(osData.observacoes || "");

      // Fetch Items
      const { data: itemsData } = await supabase
        .from("itens_os")
        .select("*")
        .eq("ordem_servico_id", id);
      
      if (itemsData) {
        const mappedItems = itemsData.map(item => ({
          ...item,
          // Descrição is stored in the table, so we use it directly
        })) as ItemOS[];
        setItensOS(mappedItems);
        setOriginalItens(JSON.parse(JSON.stringify(mappedItems)));
      }

      // Fetch Master Data
      const [resClientes, resVeiculos, resPecas] = await Promise.all([
        supabase.from("clientes").select("id, nome").order("nome"),
        supabase.from("veiculos").select("id, placa, modelo, cliente_id").order("placa"),
        supabase.from("pecas").select("id, nome, valor_venda, estoque").order("nome")
      ]);

      if (resClientes.data) setClientes(resClientes.data);
      if (resVeiculos.data) setVeiculos(resVeiculos.data);
      if (resPecas.data) setPecas(resPecas.data);
      
      setLoading(false);
    };

    fetchData();
  }, [id, navigate, toast]);

  const veiculosFiltrados = clienteId ? veiculos.filter(v => v.cliente_id === clienteId) : [];

  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const handleAddPeca = () => {
    if (!selectedPecaId) return;
    const peca = pecas.find(p => p.id === selectedPecaId);
    if (!peca) return;

    // Verificar se já temos essa peça na lista para somar ou se verificamos estoque total
    const itemExistente = itensOS.find(i => i.item_id === peca.id && i.tipo === 'peca');
    const totalQtd = (itemExistente?.quantidade || 0) + Number(qtdPeca);

    if (totalQtd > (peca.estoque || 0)) {
      toast({ 
        title: "Estoque insuficiente", 
        description: `Quantidade disponível: ${peca.estoque || 0}. Você já tem ${itemExistente?.quantidade || 0} na lista.`, 
        variant: "destructive" 
      });
      return;
    }

    if (editingItemIndex !== null) {
      const updatedItens = [...itensOS];
      updatedItens[editingItemIndex] = {
        tipo: "peca",
        item_id: peca.id,
        descricao: peca.nome,
        quantidade: Number(qtdPeca),
        valor_unitario: valorUnitario,
        valor_total: valorUnitario * Number(qtdPeca)
      };
      setItensOS(updatedItens);
      setEditingItemIndex(null);
    } else if (itemExistente) {
      setItensOS(itensOS.map(i => i.item_id === peca.id && i.tipo === 'peca' 
        ? { ...i, quantidade: totalQtd, valor_total: i.valor_unitario * totalQtd }
        : i
      ));
    } else {
      const item: ItemOS = {
        tipo: "peca",
        item_id: peca.id,
        descricao: peca.nome,
        quantidade: Number(qtdPeca),
        valor_unitario: peca.valor_venda || 0,
        valor_total: (peca.valor_venda || 0) * Number(qtdPeca)
      };
      setItensOS([...itensOS, item]);
    }

    setIsPecaModalOpen(false);
    setSelectedPecaId("");
    setQtdPeca(1);
  };

  const handleAddServico = () => {
    const valorNum = parseFloat(valorServico.replace(',', '.'));
    if (!descServico.trim() || isNaN(valorNum)) return;

    const item: ItemOS = {
      tipo: "servico",
      item_id: null,
      descricao: descServico.trim(),
      quantidade: 1,
      valor_unitario: valorNum,
      valor_total: valorNum
    };

    if (editingItemIndex !== null) {
      const updatedItens = [...itensOS];
      updatedItens[editingItemIndex] = item;
      setItensOS(updatedItens);
      setEditingItemIndex(null);
    } else {
      setItensOS([...itensOS, item]);
    }

    setIsServicoModalOpen(false);
    setDescServico("");
    setValorServico("");
  };

  const handleEditItem = (index: number) => {
    const item = itensOS[index];
    setEditingItemIndex(index);
    
    if (item.tipo === "peca") {
      setSelectedPecaId(item.item_id || "");
      setQtdPeca(item.quantidade);
      setIsPecaModalOpen(true);
    } else {
      setDescServico(item.descricao);
      setValorServico(item.valor_unitario.toString().replace('.', ','));
      setIsServicoModalOpen(true);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItensOS(itensOS.filter((_, i) => i !== index));
  };

  const totalOS = itensOS.reduce((acc, item) => acc + item.valor_total, 0);

  const handleSave = async () => {
    if (!os || !clienteId || !veiculoId || !tipoServico) {
      toast({ title: "Erro", description: "Campos obrigatórios faltando.", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      // 1. Reposição de Estoque dos itens ANTIGOS
      for (const item of originalItens) {
        if (item.tipo === "peca" && item.item_id) {
          const { data: p } = await supabase.from("pecas").select("estoque").eq("id", item.item_id).single();
          if (p && p.estoque !== null) {
            await supabase.from("pecas").update({ estoque: p.estoque + item.quantidade }).eq("id", item.item_id);
          }
        }
      }

      // 2. Dedução de Estoque dos novos itens
      for (const item of itensOS) {
        if (item.tipo === "peca" && item.item_id) {
          const { data: p } = await supabase.from("pecas").select("estoque").eq("id", item.item_id).single();
          if (p && p.estoque !== null) {
            const novoEstoque = p.estoque - item.quantidade;
            if (novoEstoque < 0) {
              throw new Error(`Estoque insuficiente para a peça: ${item.descricao}`);
            }
            await supabase.from("pecas").update({ estoque: novoEstoque }).eq("id", item.item_id);
          }
        }
      }

      // 3. Limpar e Reinserir Itens na itens_os
      await supabase.from("itens_os").delete().eq("ordem_servico_id", os.id);
      
      const itemsToInsert = itensOS.map(item => ({
        ordem_servico_id: os.id,
        item_id: item.item_id,
        tipo: item.tipo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total
      }));

      const { error: itemsError } = await supabase.from("itens_os").insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // 4. Atualizar Ordem de Serviço (incluindo Reset de Assinaturas se houver)
      const hasSignatures = os.assinatura_cliente_aceito || os.assinatura_mecanico_aceito;
      
      const updates: any = {
        cliente_id: clienteId,
        veiculo_id: veiculoId,
        tipo_servico: tipoServico,
        status: status,
        prazo: prazo || null,
        observacoes: observacoes.trim() || null,
        valor_total: totalOS
      };

      if (hasSignatures) {
        updates.assinatura_cliente_aceito = false;
        updates.assinatura_cliente_em = null;
        updates.assinatura_mecanico_aceito = false;
        updates.assinatura_mecanico_em = null;
      }

      const { error: osUpdateError } = await supabase
        .from("ordens_servico")
        .update(updates)
        .eq("id", os.id);

      if (osUpdateError) throw osUpdateError;

      toast({ 
        title: "Sucesso", 
        description: hasSignatures ? "Alterações salvas e assinaturas resetadas." : "Ordem de serviço atualizada!" 
      });
      navigate("/ordens-servico");

    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Editar OS" subtitle="Carregando...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Editar OS" 
      subtitle={`Editando Ordem de Serviço #${id?.substring(0, 8).toUpperCase()}`}
    >
      <div className="space-y-6 pb-24 max-w-5xl mx-auto">
            
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate("/ordens-servico")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/ordens-servico")}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alterações
                </Button>
              </div>
            </div>

            {/* General Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={clienteId} onValueChange={(val) => { setClienteId(val); setVeiculoId(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Veículo</Label>
                  <Select value={veiculoId} onValueChange={setVeiculoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {veiculosFiltrados.map(v => <SelectItem key={v.id} value={v.id}>{v.modelo} ({v.placa})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Serviço Principal</Label>
                  <Select value={tipoServico} onValueChange={setTipoServico}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de Serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicosDisponiveis.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida" disabled={!os?.assinatura_cliente_aceito || !os?.assinatura_mecanico_aceito}>Concluída (Requer Assinaturas)</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prazo de Entrega</Label>
                  <Input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Observações Internas</Label>
                  <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Detalhes técnicos adicionais..." className="min-h-[100px]" />
                </div>
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Peças e Serviços</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsServicoModalOpen(true)} className="gap-2">
                    <Wrench className="w-4 h-4" /> Add Serviço
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsPecaModalOpen(true)} className="gap-2">
                    <Package className="w-4 h-4" /> Add Peça
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Unitário</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensOS.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="capitalize">{item.tipo}</TableCell>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="text-center">{item.quantidade}</TableCell>
                        <TableCell className="text-right">R$ {item.valor_unitario.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold">R$ {item.valor_total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(idx)} className="text-primary">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)} className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {itensOS.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                          Nenhum item adicionado à esta ordem.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

                <div className="mt-6 flex justify-end">
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Valor Total da Ordem</p>
                    <p className="text-3xl font-black text-primary">R$ {totalOS.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signature Advisory */}
            {(os?.assinatura_cliente_aceito || os?.assinatura_mecanico_aceito) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Aviso de Assinaturas</p>
                  <p>Esta Ordem de Serviço já foi aceita digitalmente. Ao salvar qualquer alteração nos itens ou valores, as assinaturas serão resetadas para garantir a integridade do acordo com o cliente.</p>
                </div>
              </div>
            )}

          </div>
        {/* Modals */}
        <Dialog open={isPecaModalOpen} onOpenChange={(open) => { setIsPecaModalOpen(open); if (!open) setEditingItemIndex(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItemIndex !== null ? "Editar Peça" : "Adicionar Peça do Estoque"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Selecione a Peça</Label>
                <Select value={selectedPecaId} onValueChange={setSelectedPecaId}>
                  <SelectTrigger><SelectValue placeholder="Buscar peça..." /></SelectTrigger>
                  <SelectContent>
                    {pecas.map(p => (
                      <SelectItem key={p.id} value={p.id} disabled={(p.estoque || 0) <= 0}>
                        {p.nome} ({p.estoque || 0} em estoque) - R$ {p.valor_venda?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input type="number" value={qtdPeca} onChange={e => setQtdPeca(Number(e.target.value))} min={1} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPecaModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddPeca}>{editingItemIndex !== null ? "Salvar Alteração" : "Adicionar à OS"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isServicoModalOpen} onOpenChange={(open) => { setIsServicoModalOpen(open); if (!open) setEditingItemIndex(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItemIndex !== null ? "Editar Serviço" : "Adicionar Mão de Obra / Serviço"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Descrição do Serviço</Label>
                <Input value={descServico} onChange={e => setDescServico(e.target.value)} placeholder="Ex: Troca de óleo e filtro" />
              </div>
              <div className="space-y-2">
                <Label>Valor do Serviço (R$)</Label>
                <Input value={valorServico} onChange={e => setValorServico(e.target.value)} placeholder="0,00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsServicoModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddServico}>{editingItemIndex !== null ? "Salvar Alteração" : "Adicionar à OS"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  };

export default EditarOS;
