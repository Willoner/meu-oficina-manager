import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeOficina, setNomeOficina] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Limpa qualquer sessão que tenha ficado "presa" no navegador
    // para evitar logar acidentalmente em uma conta antiga.
    supabase.auth.signOut();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome_oficina: nomeOficina },
      },
    });

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      if (data.session) {
        // Se já retornou sessão, é porque a confirmação de e-mail está desligada no Supabase
        toast({ title: "Conta criada com sucesso!", description: "Bem-vindo ao Oficina em Ordem." });
        navigate("/dashboard");
      } else {
        // Se a sessão for null, é porque a confirmação de e-mail é obrigatória
        toast({ title: "Conta criada!", description: "Verifique sua caixa de e-mail para confirmar o cadastro e liberar o acesso." });
        navigate("/login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Logo className="w-[80px] h-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Oficina em Ordem</h1>
          <p className="text-muted-foreground">Crie sua conta</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeOficina">Nome da Oficina</Label>
            <Input id="nomeOficina" value={nomeOficina} onChange={(e) => setNomeOficina(e.target.value)} required placeholder="Ex: Auto Center Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="flex items-start bg-muted/30 p-4 rounded-lg border gap-3 group hover:bg-muted/50 transition-colors">
            <Checkbox 
              id="terms" 
              checked={agreed} 
              onCheckedChange={(checked) => setAgreed(checked === true)} 
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
              Li e concordo com os{" "}
              <Link to="/termos" target="_blank" className="text-primary hover:underline font-bold">Termos de Uso</Link>{" "}
              e a{" "}
              <Link to="/privacidade" target="_blank" className="text-primary hover:underline font-bold">Política de Privacidade</Link>{" "}
              do sistema Oficina em Ordem.
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !agreed}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
