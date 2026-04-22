import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  Phone,
  Download
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
  const [exporting, setExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [osCount, setOsCount] = useState(0);
  const [userPlan, setUserPlan] = useState<string>("Gratuito");
  const [userEmail, setUserEmail] = useState<string>("");
  const [settings, setSettings] = useState({
    moeda: "BRL",
    formato_data: "DD/MM/YYYY",
    notificacoes_email: true,
  });

  const OS_LIMIT = (userPlan === "Pro" || userEmail === 'rafaelfaiad1@gmail.com') ? 999999 : 10;

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


  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const csvRows = data.map(row => {
      return Object.values(row)
        .map(value => {
          if (value === null || value === undefined) return '""';
          const stringVal = String(value);
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast({ title: "Iniciando backup", description: "Baixando seus arquivos CSV. Aguarde..." });

      const [clientes, veiculos, os, pecas] = await Promise.all([
        supabase.from("clientes").select("*").eq("usuario_id", user.id),
        supabase.from("veiculos").select("*").eq("usuario_id", user.id),
        supabase.from("ordens_servico").select("*").eq("usuario_id", user.id),
        supabase.from("pecas").select("*").eq("usuario_id", user.id),
      ]);

      let baixouAlgo = false;
      if (clientes.data?.length) { exportToCSV(clientes.data, "clientes"); baixouAlgo = true; }
      if (veiculos.data?.length) { exportToCSV(veiculos.data, "veiculos"); baixouAlgo = true; }
      if (os.data?.length) { exportToCSV(os.data, "ordens_servico"); baixouAlgo = true; }
      if (pecas.data?.length) { exportToCSV(pecas.data, "estoque_pecas"); baixouAlgo = true; }

      if (baixouAlgo) {
        toast({ title: "Backup Concluído", description: "Seus dados foram salvos no seu computador." });
      } else {
        toast({ title: "Nenhum dado encontrado.", description: "Não há registros no sistema para exportar." });
      }
    } catch (e: any) {
      toast({ title: "Erro na exportação", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      
      toast({
        title: "Conta Excluída com Sucesso",
        description: "Seus dados e registros foram removidos do servidor.",
      });
      navigate("/login");
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Não foi possível excluir a sua conta.",
        description: "Erro: " + error.message,
      });
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Configurações" subtitle="Carregando...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Configurações" subtitle="Gerencie o seu sistema e preferências">
      <div className="space-y-8 max-w-5xl">
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

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Download className="w-4 h-4 text-primary" />
                    Backup de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça o download de todos os seus dados do sistema (Clientes, OS, Veículos e Estoque) no formato CSV.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleExportData}
                    disabled={exporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting ? "Gerando arquivos..." : "Exportar tudo para Excel (.CSV)"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-destructive/20 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Zona de Perigo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ao excluir sua conta, todos os seus dados de clientes, veículos, estoque e ordens de serviço serão permanentemente removidos. Faça um backup antes!
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full md:w-auto"
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

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita e os dados não podem ser recuperados no futuro. 
            Garantimos que você fez o <b>Download</b> planilhado dos seus arquivos acima antes de prosseguir?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAccount} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {saving ? "Excluindo..." : "Sim, confirmar exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </DashboardLayout>
);
};

export default Configuracoes;

