import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { 
  Settings, 
  CreditCard, 
  Settings2, 
  Monitor, 
  CheckCircle2, 
  AlertTriangle, 
  LifeBuoy, 
  ExternalLink,
  Trash2,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import AssinarPro from "@/components/AssinarPro";

const Configuracoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [osCount, setOsCount] = useState(0);
  const [userPlan, setUserPlan] = useState<string>("Gratuito");
  const [userEmail, setUserEmail] = useState<string>("");
  const [settings, setSettings] = useState({
    moeda: "BRL",
    formato_data: "DD/MM/YYYY",
    notificacoes_email: true,
  });

  const OS_LIMIT = userPlan === "Pro" ? 999999 : 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch User Data (Plan and Email)
      const { data: userData } = await supabase
        .from("usuarios")
        .select("plano, email")
        .eq("id", user.id)
        .single();
      
      if (userData?.plano) {
        setUserPlan(userData.plano);
      }
      if (userData?.email) {
        setUserEmail(userData.email);
      }

      // 2. Fetch OS usage this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from("ordens_servico")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", user.id)
        .gte("created_at", firstDayOfMonth);
      
      setOsCount(count || 0);

      // 3. Fetch Settings
      const { data: configData } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();
      
      if (configData) {
        setSettings({
          moeda: configData.moeda || "BRL",
          formato_data: configData.formato_data || "DD/MM/YYYY",
          notificacoes_email: configData.notificacoes_email ?? true,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("configuracoes")
        .upsert({
          usuario_id: user.id,
          moeda: settings.moeda,
          formato_data: settings.formato_data,
          notificacoes_email: settings.notificacoes_email,
        }, { onConflict: 'usuario_id' });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Suas configurações foram salvas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar as alterações.",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteAccount = async () => {
    toast({
      variant: "destructive",
      title: "Solicitação enviada",
      description: "Nossa equipe entrará em contato para processar a exclusão da sua conta.",
    });
    setIsDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <Header title="Configurações" subtitle="Gerencie o seu sistema e preferências" />
        
        <div className="p-8 max-w-5xl">
          {/* Seção Plano e Limites */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Plano e Limites</h2>
            </div>
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-background">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Plano Atual: <span className="text-primary">{userPlan}</span></CardTitle>
                    <CardDescription>Você está utilizando a versão {userPlan === "Pro" ? "profissional" : "básica"} do sistema.</CardDescription>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {userPlan}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Uso de Ordens de Serviço (este mês)</span>
                    <span>{osCount} / {OS_LIMIT}</span>
                  </div>
                  <Progress value={(osCount / OS_LIMIT) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Sua cota renova automaticamente no dia 1 de cada mês.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/20 border-t py-4">
                {userPlan === "Pro" ? (
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plano Pro Ativo</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    <AssinarPro className="w-full sm:w-auto" />
                    <p className="text-[10px] text-muted-foreground">
                      * O plano Pro remove todos os limites de Ordens de Serviço.
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </section>

          {/* Seção Preferências */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Preferências</h2>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="moeda">Moeda</Label>
                    <Select 
                      value={settings.moeda} 
                      onValueChange={(val) => setSettings({...settings, moeda: val})}
                    >
                      <SelectTrigger id="moeda">
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD" disabled>Dólar ($) - Em breve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formato_data">Formato de Data</Label>
                    <Select 
                      value={settings.formato_data} 
                      onValueChange={(val) => setSettings({...settings, formato_data: val})}
                    >
                      <SelectTrigger id="formato_data">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações por e-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba avisos sobre ordens de serviço e novos agendamentos.
                    </p>
                    {userEmail && (
                      <div className="mt-2 flex flex-col gap-1">
                        <p className="text-xs font-medium text-primary">
                          As notificações serão enviadas para: <span className="underline italic">{userEmail}</span>
                        </p>
                        <button 
                          onClick={() => navigate("/perfil")}
                          className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit"
                        >
                          Alterar no Perfil <ExternalLink className="w-2 h-2" />
                        </button>
                      </div>
                    )}
                  </div>
                  <Switch 
                    checked={settings.notificacoes_email}
                    onCheckedChange={(checked) => setSettings({...settings, notificacoes_email: checked})}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Seção Sistema */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Sistema</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-muted-foreground" />
                    Suporte e Ajuda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Precisa de ajuda com o sistema ou encontrou um problema? Nossa equipe está pronta para ajudar.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <a href="mailto:suporte@oficinaemordem.com">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        suporte@oficinaemordem.com
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <a href="https://wa.me/5516981974355" target="_blank" rel="noreferrer">
                        <Phone className="w-4 h-4 mr-2" />
                        Falar via WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Zona de Perigo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ao excluir sua conta, todos os seus dados de clientes, veículos e ordens de serviço serão permanentemente removidos.
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Conta
                  </Button>
                </CardContent>
                <CardFooter className="py-2 border-t flex justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    Versão MVP v1.0
                  </span>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
              da oficina e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Configuracoes;

