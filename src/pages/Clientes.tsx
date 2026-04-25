import { useState, useEffect } from "react";
import { Users, Plus, Search, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

type Cliente = {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  created_at: string | null;
};

const Clientes = () => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  
  const { toast } = useToast();

  const fetchClientes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) setClientes(data);
  };

  useEffect(() => { fetchClientes(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setNome("");
    setCpf("");
    setTelefone("");
    setEmail("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setNome(cliente.nome);
    setCpf(cliente.cpf || "");
    setTelefone(cliente.telefone || "");
    setEmail(cliente.email || "");
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      // Verificar se o cliente tem ordens de serviço
      const { count } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("cliente_id", deleteId);

      if (count && count > 0) {
        toast({
          variant: "destructive",
          title: "Não é possível excluir",
          description: "Este cliente possui ordens de serviço. Exclua as OS primeiro antes de excluir o cliente.",
        });
        return;
      }

      const { error } = await supabase.from("clientes").delete().eq("id", deleteId);
      if (error) throw error;

      toast({ title: "Sucesso", description: "Cliente removido com sucesso!" });
      fetchClientes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um problema ao tentar excluir o cliente.",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const clienteData = {
      nome: nome.trim(),
      cpf: cpf.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      usuario_id: user.id,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from("clientes")
        .update(clienteData)
        .eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("clientes")
        .insert(clienteData);
      error = insertError;
    }

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Cliente atualizado!" : "Cliente cadastrado com sucesso!" });
      handleOpenChange(false);
      fetchClientes();
    }
  };

  const filtered = clientes.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Clientes" subtitle="Gerencie seus clientes ativos">
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar cliente..." className="pl-9 w-full sm:w-64" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="w-full sm:w-auto gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Novo Cliente
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              {search ? "Nenhum cliente encontrado para sua busca." : "Nenhum cliente cadastrado ainda. Clique em \"Novo Cliente\" para começar."}
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id} className="group">
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell>{c.cpf || "—"}</TableCell>
                      <TableCell>{c.telefone || "—"}</TableCell>
                      <TableCell>{c.email || "—"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" type="email" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Cliente"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cliente será permanentemente removido do sistema.
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
    </DashboardLayout>
  );
};

export default Clientes;
