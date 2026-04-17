import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = String(formData.get("email") || "").trim().toLowerCase();
    const passwordValue = String(formData.get("password") || "").trim();

    if (!emailValue || !passwordValue) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email: emailValue, 
      password: passwordValue
    });

    if (error) {
      toast({ 
        title: "Erro ao entrar", 
        description: `Falha: ${error.message} (Status: ${error.status || '?'})`, 
        variant: "destructive" 
      });
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Logo className="w-[80px] h-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Oficina em Ordem</h1>
          <p className="text-muted-foreground">Entre na sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input name="email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input 
                name="password"
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <Link to="/forgot-password" className="text-primary hover:underline block">Esqueci minha senha</Link>
          <p>
            Não tem conta?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Cadastre-se</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-8 border-t text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">
          <Link to="/termos" className="hover:text-primary transition-colors">Termos</Link>
          <span className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
          <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
        </div>

        <div className="text-center pt-4">
          <span className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em] font-medium">
            Versão: 18:50 - Reforçada v5
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
