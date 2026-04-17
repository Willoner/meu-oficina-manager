import { useState, useEffect } from "react";
import { Package, Plus, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Peca = {
  id: string;
  nome: string;
  codigo: string | null;
  valor_venda: number | null;
  estoque: number | null;
};

const Estoque = () => {
  const [open, setOpen] = useState(false);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [estoque, setEstoque] = useState("");
  const { toast } = useToast();

  const fetchPecas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pecas")
      .select("*")
      .eq("usuario_id", user.id)
      .order("nome");
    
    if (data) setPecas(data);
  };

  useEffect(() => { fetchPecas(); }, []);

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); setLoading(false); return; }
    const { error } = await supabase.from("pecas").insert({
      nome: nome.trim(),
      codigo: codigo.trim() || null,
      valor_venda: valorVenda ? parseFloat(valorVenda) : null,
      estoque: estoque ? parseInt(estoque) : 0,
      usuario_id: user.id,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Peça cadastrada com sucesso!" });
      setOpen(false);
      setNome(""); setCodigo(""); setValorVenda(""); setEstoque("");
      fetchPecas();
    }
  };

  const filtered = pecas.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Estoque de Peças" subtitle="Gerencie suas peças e produtos">
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar peça..." className="pl-9 w-full sm:w-64" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="w-full sm:w-auto gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Novo Peça
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Nenhuma peça cadastrada ainda. Clique em "Nova Peça" para começar.
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Valor Venda</TableHead>
                    <TableHead>Estoque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.codigo || "—"}</TableCell>
                      <TableCell>{p.valor_venda ? `R$ ${p.valor_venda.toFixed(2)}` : "—"}</TableCell>
                      <TableCell>{p.estoque ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Peça</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da peça" />
            </div>
            <div>
              <Label>Código</Label>
              <Input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código da peça" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor de Venda</Label>
                <Input value={valorVenda} onChange={e => setValorVenda(e.target.value)} placeholder="0.00" type="number" step="0.01" />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input value={estoque} onChange={e => setEstoque(e.target.value)} placeholder="0" type="number" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Estoque;
