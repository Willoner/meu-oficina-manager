import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreatePartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (id: string) => void;
}

export function CreatePartDialog({ open, onOpenChange, onSuccess }: CreatePartDialogProps) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [estoque, setEstoque] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    const { data, error } = await supabase.from("pecas").insert({
      nome: nome.trim(),
      codigo: codigo.trim() || null,
      valor_venda: valorVenda ? parseFloat(valorVenda) : null,
      estoque: estoque ? parseInt(estoque) : 0,
      usuario_id: user.id,
    }).select().single();

    setLoading(false);
    
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else if (data) {
      toast({ title: "Sucesso", description: "Peça cadastrada com sucesso!" });
      setNome("");
      setCodigo("");
      setValorVenda("");
      setEstoque("");
      onSuccess(data.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Peça no Estoque</DialogTitle>
          <DialogDescription>Cadastre uma nova peça para usá-la na Ordem de Serviço.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pastilha de Freio Cobreq" />
          </div>
          <div>
            <Label>Código</Label>
            <Input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ex: N-1234" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor de Venda (R$)</Label>
              <Input value={valorVenda} onChange={e => setValorVenda(e.target.value)} placeholder="0.00" type="number" step="0.01" />
            </div>
            <div>
              <Label>Estoque Inicial</Label>
              <Input value={estoque} onChange={e => setEstoque(e.target.value)} placeholder="Ex: 10" type="number" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar Peça"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
