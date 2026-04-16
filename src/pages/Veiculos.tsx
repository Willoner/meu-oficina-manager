import { useState, useEffect } from "react";
import { Car, Plus, Search, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type Veiculo = {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number | null;
  km_atual: number | null;
  cliente_id: string;
};

type Cliente = { id: string; nome: string };

const Veiculos = () => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState("");
  const [km, setKm] = useState("");
  const [clienteId, setClienteId] = useState("");
  
  const { toast } = useToast();

  const fetchVeiculos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("veiculos")
      .select("*")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setVeiculos(data);
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

  useEffect(() => { fetchVeiculos(); fetchClientes(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setPlaca("");
    setModelo("");
    setMarca("");
    setAno("");
    setKm("");
    setClienteId("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleEdit = (veiculo: Veiculo) => {
    setEditingId(veiculo.id);
    setPlaca(veiculo.placa);
    setModelo(veiculo.modelo);
    setMarca(veiculo.marca);
    setAno(veiculo.ano?.toString() || "");
    setKm(veiculo.km_atual?.toString() || "");
    setClienteId(veiculo.cliente_id);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Verificar se o veículo tem ordens de serviço
      const { count } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("veiculo_id", deleteId);

      if (count && count > 0) {
        toast({
          variant: "destructive",
          title: "Não é possível excluir",
          description: "Este veículo possui ordens de serviço vinculadas. Exclua as OS primeiro.",
        });
        return;
      }

      const { error } = await supabase.from("veiculos").delete().eq("id", deleteId);
      if (error) throw error;

      toast({ title: "Sucesso", description: "Veículo removido com sucesso!" });
      fetchVeiculos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um problema ao tentar excluir o veículo.",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSave = async () => {
    if (!placa.trim() || !modelo.trim() || !marca.trim() || !clienteId) {
      toast({ title: "Erro", description: "Placa, modelo, marca e cliente são obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); setLoading(false); return; }
    
    const veiculoData = {
      placa: placa.trim(),
      modelo: modelo.trim(),
      marca: marca.trim(),
      ano: ano ? parseInt(ano) : null,
      km_atual: km ? parseInt(km) : null,
      cliente_id: clienteId,
      usuario_id: user.id,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from("veiculos")
        .update(veiculoData)
        .eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("veiculos")
        .insert(veiculoData);
      error = insertError;
    }

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Veículo atualizado!" : "Veículo cadastrado com sucesso!" });
      handleOpenChange(false);
      fetchVeiculos();
    }
  };

  const getClienteNome = (id: string) => {
    return clientes.find(c => c.id === id)?.nome || "—";
  };

  const filtered = veiculos.filter(v => 
    v.placa.toLowerCase().includes(search.toLowerCase()) || 
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    getClienteNome(v.cliente_id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header title="Veículos" subtitle="Veículos cadastrados na oficina" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por placa, modelo ou cliente..." className="pl-9 w-80" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Novo Veículo
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              {search ? "Nenhum veículo encontrado para sua busca." : "Nenhum veículo cadastrado ainda. Clique em \"Novo Veículo\" para começar."}
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id} className="group">
                      <TableCell className="font-medium">{v.placa}</TableCell>
                      <TableCell>{v.marca} {v.modelo}</TableCell>
                      <TableCell>{v.ano || "—"}</TableCell>
                      <TableCell>{v.km_atual?.toLocaleString() || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{getClienteNome(v.cliente_id)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(v)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input id="placa" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-1234" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input id="marca" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Fiat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input id="modelo" value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: Uno" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input id="ano" value={ano} onChange={e => setAno(e.target.value)} placeholder="2024" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km">KM Atual</Label>
                <Input id="km" value={km} onChange={e => setKm(e.target.value)} placeholder="0" type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger id="cliente"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Veículo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O veículo será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Veiculos;
