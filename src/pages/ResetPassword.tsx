import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // We might not have a session yet if redirecting from hash, 
        // but onAuthStateChange in App.tsx should handle the redirection.
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ 
        title: "Erro ao atualizar", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Senha atualizada com sucesso!", 
        description: "Sua conta está segura agora. Você será redirecionado." 
      });
      
      // Pequeno delay para o usuário ler a mensagem
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <Logo className="w-[120px] h-auto mx-auto mb-2" />
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Segurança da Conta</h1>
          <p className="text-muted-foreground">Defina sua nova senha de acesso com segurança.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl gradient-primary text-base font-bold shadow-lg" disabled={loading}>
              {loading ? "Salvando nova senha..." : "Salvar e Acessar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Sua senha deve conter pelo menos 6 caracteres para garantir a segurança dos seus dados.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
