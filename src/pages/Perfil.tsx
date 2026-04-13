import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const Perfil = () => {
  const [nomeOficina, setNomeOficina] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
      if (data) {
        setNomeOficina(data.nome_oficina || "");
        setTelefone(data.telefone || "");
        setCnpj(data.cnpj || "");
        setEmail(data.email || "");
      }
    };
    fetchPerfil();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("usuarios").update({
      nome_oficina: nomeOficina.trim(),
      telefone: telefone.trim() || null,
      cnpj: cnpj.trim() || null,
    }).eq("id", user.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header title="Meu Perfil" subtitle="Edite os dados da sua oficina" />

        <div className="p-8 max-w-lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeOficina">Nome da Oficina *</Label>
              <Input id="nomeOficina" value={nomeOficina} onChange={(e) => setNomeOficina(e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={email} disabled className="bg-secondary/30" />
              <p className="text-[10px] text-muted-foreground italic">O e-mail é usado para login e notificações e não pode ser alterado aqui.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={20} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={18} placeholder="00.000.000/0000-00" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
