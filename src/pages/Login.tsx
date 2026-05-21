import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery = hash.includes("recovery") || 
                       hash.includes("access_token=") || 
                       search.includes("recovery");

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !isRecovery) {
        localStorage.removeItem("recovery_active");
        navigate("/dashboard");
      }
    };
    checkUser();
    
    // Se o usuário chegou no login por vias normais (sem ser fluxo de recuperação)
    if (!isRecovery) {
      localStorage.removeItem("recovery_active");
    }

    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail && emailRef.current) {
      emailRef.current.value = savedEmail;
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Prioridade total para as Refs (Conexão Direta)
    const emailValue = (emailRef.current?.value || "").trim().toLowerCase();
    const passwordValue = (passwordRef.current?.value || "").trim();

    if (!emailValue || !passwordValue) {
      toast({ 
        title: "Erro de Leitura", 
        description: `Campos detectados como vazios (${!emailValue ? 'E-mail' : 'Senha'}). Tente digitar novamente.`, 
        variant: "destructive" 
      });
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
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", emailValue);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-6">
          <div className="bg-sidebar p-8 rounded-2xl shadow-xl w-fit mx-auto border border-sidebar-border/50">
            <Logo className="w-[180px] h-auto" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Acesso ao Gestor</h2>
            <p className="text-sm text-muted-foreground">Gerencie sua oficina com eficiência</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              ref={emailRef}
              name="email" 
              id="email" 
              type="email" 
              required 
              placeholder="seu@email.com" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input 
                ref={passwordRef}
                name="password"
                id="password" 
                type={showPassword ? "text" : "password"} 
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
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">Lembrar-me</Label>
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

      </div>
    </div>
  );
};

export default Login;
