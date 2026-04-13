import { useState, useEffect } from "react";
import { Car, Plus, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState("");
  const [km, setKm] = useState("");
  const [clienteId, setClienteId] = useState("");
  const { toast } = useToast();

  const fetchVeiculos = async () => {
    const { data } = await supabase.from("veiculos").select("*").order("created_at", { ascending: false });
    if (data) setVeiculos(data);
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome").order("nome");
    if (data) setClientes(data);
  };

  useEffect(() => { fetchVeiculos(); fetchClientes(); }, []);

  const handleSave = async () => {
    if (!placa.trim() || !modelo.trim() || !marca.trim() || !clienteId) {
      toast({ title: "Erro", description: "Placa, modelo, marca e cliente são obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" }); setLoading(false); return; }
    const { error } = await supabase.from("veiculos").insert({
      placa: placa.trim(),
      modelo: modelo.trim(),
      marca: marca.trim(),
      ano: ano ? parseInt(ano) : null,
      km_atual: km ? parseInt(km) : null,
      cliente_id: clienteId,
      usuario_id: user.id,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Veículo cadastrado com sucesso!" });
      setOpen(false);
      setPlaca(""); setModelo(""); setMarca(""); setAno(""); setKm(""); setClienteId("");
      fetchVeiculos();
    }
  };

  const filtered = veiculos.filter(v => v.placa.toLowerCase().includes(search.toLowerCase()) || v.modelo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header title="Veículos" subtitle="Veículos cadastrados na oficina" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar veículo..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Novo Veículo
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Nenhum veículo cadastrado ainda. Clique em "Novo Veículo" para começar.
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>KM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.placa}</TableCell>
                      <TableCell>{v.marca}</TableCell>
                      <TableCell>{v.modelo}</TableCell>
                      <TableCell>{v.ano || "—"}</TableCell>
                      <TableCell>{v.km_atual?.toLocaleString() || "—"}</TableCell>
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
            <DialogTitle>Novo Veículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Placa *</Label>
              <Input value={placa} onChange={e => setPlaca(e.target.value)} placeholder="ABC-1234" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Marca *</Label>
                <Input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Fiat" />
              </div>
              <div>
                <Label>Modelo *</Label>
                <Input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: Uno" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ano</Label>
                <Input value={ano} onChange={e => setAno(e.target.value)} placeholder="2024" type="number" />
              </div>
              <div>
                <Label>KM Atual</Label>
                <Input value={km} onChange={e => setKm(e.target.value)} placeholder="0" type="number" />
              </div>
            </div>
            <div>
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Veiculos;
