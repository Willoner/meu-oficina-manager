import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardList, BellRing, Package, Wrench, Menu, X, ArrowRight, ShieldCheck, ChevronDown, Check, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { supabase } from "@/integrations/supabase/client";
import { Smartphone, Share, Layout, Zap, Globe, PlusSquare, Database, Lock, Server, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check for existing session and sync tab with hash
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // GATILHO DE SEGURANÇA: Se estivermos em um fluxo de recuperação de senha,
      // NÃO redirecionamos para o dashboard, deixamos o AuthEventsHandler do App.tsx agir.
      const isRecovery = window.location.hash && window.location.hash.includes("type=recovery");
      
      if (session && !isRecovery) {
        navigate("/dashboard");
      }
    };
    checkUser();

    const hash = window.location.hash.replace('#', '');
    if (["home", "funcionalidades", "precos", "faq", "contato"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const features = [
    {
      title: "OS com Assinatura Digital",
      description: "Esqueça o papel. Seu cliente assina o serviço com o dedo direto na tela do seu celular.",
      icon: <ClipboardList className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Histórico na Palma da Mão",
      description: "Acesse tudo o que já foi feito em qualquer veículo ou cliente em segundos.",
      icon: <Wrench className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Status via WhatsApp",
      description: "Envie orçamentos e atualizações automáticas direto para o WhatsApp do seu cliente.",
      icon: <BellRing className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Controle de Estoque Real",
      description: "Saiba exatamente o que tem na prateleira e evite prejuízos com peças paradas.",
      icon: <Package className="h-6 w-6 text-blue-600" />
    }
  ];

  const faqs = [
    {
      q: "Precisa de cartão de crédito para começar?",
      a: "Não. Você pode começar no plano Grátis sem cadastrar nenhum cartão."
    },
    {
      q: "Pode cancelar quando quiser?",
      a: "Sim, sem amarras. Você pode cancelar sua assinatura a qualquer momento no seu painel."
    },
    {
      q: "O cliente precisa de conta para assinar a OS?",
      a: "Não. Ele recebe um link público, acessa pelo celular e assina com o dedo na tela, simples assim."
    },
    {
      q: "Funciona no celular?",
      a: "Sim! Totalmente responsivo. Funciona perfeitamente em computadores, tablets e celulares."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange("home")}>
            <Logo className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Oficina em Ordem</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-medium text-slate-600">
            <button onClick={() => handleTabChange("home")} className={`hover:text-blue-600 transition-colors ${activeTab === 'home' ? 'text-blue-600 font-bold' : ''}`}>Início</button>
            <button onClick={() => handleTabChange("funcionalidades")} className={`hover:text-blue-600 transition-colors ${activeTab === 'funcionalidades' ? 'text-blue-600 font-bold' : ''}`}>Funcionalidades</button>
            <button onClick={() => handleTabChange("precos")} className={`hover:text-blue-600 transition-colors ${activeTab === 'precos' ? 'text-blue-600 font-bold' : ''}`}>Preços</button>
            <button onClick={() => handleTabChange("faq")} className={`hover:text-blue-600 transition-colors ${activeTab === 'faq' ? 'text-blue-600 font-bold' : ''}`}>Dúvidas</button>
            <a href="https://wa.me/5519998156947" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              Contato <MessageSquare className="w-4 h-4" />
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {(isInstallable || isMobile) && !isInstalled && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => isInstallable ? installPWA() : setInstallDialogOpen(true)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold gap-2"
              >
                <Download className="h-4 w-4" /> Instalar App
              </Button>
            )}
            <Link to="/login" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link to="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full px-6">
                Cadastrar
              </Button>
            </Link>
          </div>

          <button onClick={toggleMenu} className="md:hidden text-slate-600">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            <button onClick={() => handleTabChange("home")} className="text-left text-slate-600 font-medium py-2">Início</button>
            <button onClick={() => handleTabChange("funcionalidades")} className="text-left text-slate-600 font-medium py-2">Funcionalidades</button>
            <button onClick={() => handleTabChange("precos")} className="text-left text-slate-600 font-medium py-2">Preços</button>
            <button onClick={() => handleTabChange("faq")} className="text-left text-slate-600 font-medium py-2">Dúvidas</button>
            <a href="https://wa.me/5519998156947" target="_blank" rel="noopener noreferrer" className="text-slate-600 font-medium py-2">Contato</a>
            {(isMobile && !isInstalled) && (
              <button 
                onClick={() => {
                  if (isInstallable) {
                    installPWA();
                  } else {
                    setInstallDialogOpen(true);
                  }
                  toggleMenu();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl"
              >
                <Download className="h-5 w-5" /> Instalar Aplicativo
              </button>
            )}
            <div className="h-px bg-slate-100 my-2" />
            <Link to="/login" onClick={toggleMenu} className="text-slate-600 font-medium py-2 text-center">Entrar</Link>
            <Link to="/signup" onClick={toggleMenu} className="w-full">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">Começar agora</Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="home" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-50 to-slate-50">
              {/* Abstract background shapes */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
              </div>

              <div className="container mx-auto px-4 mt-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
                  <div className="flex-1 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                      Sua oficina organizada <br className="hidden lg:block" /> em poucos cliques
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl lg:mx-0 mx-auto leading-relaxed">
                      Controle de OS, histórico de clientes e estoque num único lugar. Simples, rápido e direto ao ponto.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                      <Link to="/signup" className="w-full sm:w-auto">
                        <Button className="h-14 px-8 text-lg rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 w-full transition-transform hover:-translate-y-1">
                          Começar agora <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={() => handleTabChange("precos")}
                        className="h-14 px-8 text-lg rounded-full font-semibold w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 transition-transform hover:-translate-y-1"
                      >
                        Ver preços
                      </Button>
                    </div>
                    {((isInstallable || isMobile) && !isInstalled) && (
                      <div className="mt-4">
                        <Button 
                          onClick={() => isInstallable ? installPWA() : setInstallDialogOpen(true)}
                          variant="ghost"
                          className="text-blue-600 font-bold hover:bg-blue-50 gap-2"
                        >
                          <Download className="h-5 w-5" /> Baixar Aplicativo
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                      {/* Natural photography filter applied here */}
                      <img 
                        src="/mechanic_phone.png" 
                        alt="Mecânico usando o sistema no celular" 
                        className="w-full h-auto object-cover filter contrast-[1.02] brightness-[0.98] saturate-[0.95] sepia-[0.05]" 
                      />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-10 blur-2xl"></div>
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-emerald-100 rounded-full -z-10 blur-2xl"></div>
                  </div>
                </div>
              </div>
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-500 border-t border-slate-100 pt-8 max-w-4xl mx-auto">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Sem cartão de crédito</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Cancele quando quiser</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> inicie grátis agora</span>
              </div>
            </section>

            <section className="py-20 bg-white">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Sua oficina em boas mãos</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Privacidade e segurança para você focar no que importa: o serviço.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Criptografia SSL</h3>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Database className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Backup Diário</h3>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">LGPD Ready</h3>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Server className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Cloud AWS</h3>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Bottom */}
            <section className="py-20 bg-blue-600 text-center px-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Recupere o controle da sua oficina</h2>
                <p className="text-blue-100 mb-12 max-w-2xl mx-auto text-xl">Organização gera lucro. Comece hoje mesmo gratuitamente.</p>
                <Link to="/signup">
                  <Button className="h-16 px-12 text-xl rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-2xl transition-transform hover:scale-105">
                    Criar minha conta grátis
                  </Button>
                </Link>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="funcionalidades" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {/* Features */}
            <section id="funcionalidades" className="py-20 bg-white min-h-[60vh]">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Tudo o que sua oficina precisa</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">Deixe as planilhas e papéis no passado. Gerencie seu negócio com ferramentas modernas.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                  {features.map((f, i) => (
                    <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        {f.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* App Experience Section - Condensed */}
            <section id="app-experience" className="py-20 bg-slate-900 text-white overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      <Smartphone className="w-3 h-3" /> App Web Progressivo
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                      Instale no seu celular <br /> e use como um aplicativo
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                      Acesse sua oficina com um toque na tela inicial. Mais rápido, estável e sempre à mão.
                    </p>
                    
                    <div className="pt-4">
                      {isInstallable ? (
                        <Button 
                          onClick={installPWA}
                          className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-600/20 gap-3"
                        >
                          <Download className="h-5 w-5" /> INSTALAR AGORA
                        </Button>
                      ) : (
                        <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-sm">
                          <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-400">
                            <Smartphone className="w-4 h-4" /> No iPhone/Safari:
                          </h4>
                          <p className="text-slate-300">Toque em <Share className="inline w-4 h-4 mx-1" /> e depois em **"Adicionar à Tela de Início"**.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative bg-slate-800 rounded-2xl p-2 border border-slate-700 shadow-2xl">
                        <img 
                          src="/mechanic_phone.png" 
                          alt="App Mobile Mockup" 
                          className="w-full max-w-[280px] h-auto rounded-xl filter contrast-[1.02] brightness-[0.98] saturate-[0.95] sepia-[0.05]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="precos" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {/* Pricing */}
            <section id="precos" className="py-20 bg-slate-50 min-h-[60vh]">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Simples, transparente e justo</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">Escolha o plano que melhor se adapta ao momento da sua oficina.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Grátis */}
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Grátis</h3>
                      <p className="text-slate-500 mb-6">Para quem está começando e precisa de organização básica.</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
                        <span className="text-slate-500 font-medium">/mês</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Até 10 Ordens de Serviço por mês</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Cadastro de Clientes e Veículos</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Link público da OS</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Suporte via e-mail</li>
                    </ul>
                    <Link to="/signup">
                      <Button variant="outline" className="w-full py-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 font-bold text-slate-700 text-base">
                        Começar Grátis
                      </Button>
                    </Link>
                  </div>

                  {/* Pro */}
                  <div className="bg-white rounded-3xl p-8 border-2 border-blue-600 shadow-2xl relative flex flex-col transform md:-translate-y-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-sm">
                      POPULAR: MENOS DE R$ 1 POR DIA
                    </div>
                    <div className="mb-8 mt-4">
                      <h3 className="text-2xl font-bold text-blue-600 mb-2">Plano Pro</h3>
                      <p className="text-slate-500 mb-6">Controle total para oficinas que buscam profissionalismo.</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">R$ 29</span>
                        <span className="text-slate-500 font-medium">/mês</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex gap-3 text-slate-900 font-medium"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Tudo do Grátis e mais:</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> OS Ilimitadas</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Gestão de Estoque Completa</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Notificações WhatsApp</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Relatórios de Lucro</li>
                      <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Suporte VIP</li>
                    </ul>
                    <Link to="/signup">
                      <Button className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30">
                        Assinar agora
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="faq" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {/* FAQ */}
            <section id="faq" className="py-20 bg-slate-50 min-h-[60vh]">
              <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Dúvidas comuns</h2>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                      <p className="text-slate-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer id="contato" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Wrench className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-lg tracking-tight">Oficina em Ordem</span>
          </div>
          
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-x-8 gap-y-4 text-sm">
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <a href="mailto:suporte@oficinaemordem.com.br" className="hover:text-white transition-colors flex items-center gap-2">
              E-mail: suporte@oficinaemordem.com.br
            </a>
            <a href="https://wa.me/5519998156947" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
              WhatsApp: (19) 99815-6947
            </a>
          </div>

          <div className="text-sm">
            &copy; {new Date().getFullYear()} Oficina em Ordem. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Floating PWA Install Bar (Mobile Only) */}
      {(isMobile && !isInstalled) && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Logo className="w-8 h-8 object-contain" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Oficina em Ordem</p>
                <p className="text-slate-400 text-xs">Acessar via Aplicativo</p>
              </div>
            </div>
            {isInstallable ? (
              <Button size="sm" onClick={installPWA} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded-lg">
                Instalar
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setInstallDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded-lg"
              >
                Instalar
              </Button>
            )}
          </div>
        </div>
      )}
      {/* PWA Install Instruction Dialog */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Instalar Oficina em Ordem</DialogTitle>
            <DialogDescription className="text-center text-slate-500 pt-2">
              Siga os passos abaixo para ter o aplicativo na sua tela inicial
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            {isIOS ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Toque no botão de <strong>Compartilhar</strong> <Share className="inline-block w-4 h-4 mx-1 text-blue-600" /> no menu do Safari.
                  </p>
                </div>
                <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Role a lista e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="inline-block w-4 h-4 mx-1 text-blue-600" />.
                  </p>
                </div>
                <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Toque em <strong>Adicionar</strong> no canto superior direito.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Toque nos <strong>três pontinhos</strong> (Menu) no canto superior do navegador.
                  </p>
                </div>
                <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Selecione <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à Tela Inicial</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold"
            onClick={() => setInstallDialogOpen(false)}
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
