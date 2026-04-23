import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardList, BellRing, Package, Wrench, Menu, X, ArrowRight, ShieldCheck, ChevronDown, Check, Download } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Smartphone, Share, Layout, Zap, Globe } from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const features = [
    {
      title: "Controle de OS Digital",
      description: "Crie, edite e envie Ordens de Serviço com assinatura digital de forma rápida e segura.",
      icon: <ClipboardList className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Histórico Completo",
      description: "Acesse o histórico de todos os serviços prestados para cada cliente e veículo em um clique.",
      icon: <Wrench className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Notificações em Tempo Real",
      description: "Mantenha o cliente avisado sobre o status do serviço diretamente pelo sistema ou WhatsApp.",
      icon: <BellRing className="h-6 w-6 text-blue-600" />
    },
    {
      title: "Gestão de Estoque e Prazos",
      description: "Controle as peças da sua oficina e os prazos de entrega com alertas automáticos.",
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
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Oficina em Ordem</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#precos" className="hover:text-blue-600 transition-colors">Preços</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            <a href="#contato" className="hover:text-blue-600 transition-colors">Contato</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isInstallable && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={installPWA}
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
                Começar agora
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
            <a href="#funcionalidades" onClick={toggleMenu} className="text-slate-600 font-medium py-2">Funcionalidades</a>
            <a href="#precos" onClick={toggleMenu} className="text-slate-600 font-medium py-2">Preços</a>
            <a href="#faq" onClick={toggleMenu} className="text-slate-600 font-medium py-2">FAQ</a>
            {(isMobile && !isInstalled) && (
              <button 
                onClick={() => {
                  if (isInstallable) {
                    installPWA();
                  } else {
                    document.getElementById('app-experience')?.scrollIntoView({ behavior: 'smooth' });
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-blue-50 to-slate-50">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 text-center max-w-4xl mt-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Sua oficina organizada do <span className="text-blue-600">jeito que merece</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Controle de OS, histórico completo e notificações em tempo real – tudo em um só lugar. Preço que cabe no bolso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button className="h-14 px-8 text-lg rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 w-full sm:w-auto transition-transform hover:-translate-y-1">
                Começar agora <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#precos">
              <Button variant="outline" className="h-14 px-8 text-lg rounded-full font-semibold w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 transition-transform hover:-translate-y-1">
                Ver preços
              </Button>
            </a>
            {isInstallable && (
              <Button 
                onClick={installPWA}
                className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 w-full sm:w-auto transition-transform hover:-translate-y-1 gap-2"
              >
                <Download className="h-5 w-5" /> Baixar Aplicativo
              </Button>
            )}
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sem cartão requerido</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cancele quando quiser</span>
          </div>
        </div>
      </section>

      {/* App Experience Section */}
      <section id="app-experience" className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-wide uppercase">
                <Smartphone className="w-4 h-4" /> Experiência Mobile Total
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Sua oficina na palma da mão, <span className="text-blue-400">mais rápido do que nunca.</span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Não é apenas um site. Nosso Aplicativo (PWA) permite que você acesse sua oficina com um toque na tela inicial, com maior velocidade e estabilidade.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Ícone na Tela</h4>
                    <p className="text-sm text-slate-400">Acesse instantaneamente sem precisar digitar a URL.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Mais Velocidade</h4>
                    <p className="text-sm text-slate-400">Carregamento otimizado para conexões móveis.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                {isInstallable ? (
                  <Button 
                    onClick={installPWA}
                    className="h-16 px-10 text-xl rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black shadow-2xl shadow-blue-600/40 gap-3"
                  >
                    <Download className="h-6 w-6" /> INSTALAR AGORA
                  </Button>
                ) : (
                  <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
                    <h4 className="font-bold flex items-center gap-2 mb-3 text-blue-400">
                      <Smartphone className="w-5 h-5" /> Dica para iPhone/Safari
                    </h4>
                    <ol className="text-sm text-slate-300 space-y-3">
                      <li className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs font-bold shrink-0">1</span>
                        <span>Toque no botão de **Compartilhar** <Share className="inline w-4 h-4 mx-1" /> no rodapé do seu Safari.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs font-bold shrink-0">2</span>
                        <span>Role para baixo e toque em **"Adicionar à Tela de Início"**.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs font-bold shrink-0">3</span>
                        <span>Toque em **"Adicionar"** e pronto! O app estará na sua tela inicial.</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 relative lg:mt-0 mt-12">
              <div className="relative z-10 rounded-3xl overflow-hidden border-8 border-slate-800 shadow-2xl max-w-[320px] mx-auto transform rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600" 
                  alt="App Mobile" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24 bg-white">
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

      {/* Pricing */}
      <section id="precos" className="py-24 bg-slate-50">
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
                MENOS DE R$ 1 POR DIA
              </div>
              <div className="mb-8 mt-4">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">Pro</h3>
                <p className="text-slate-500 mb-6">Controle total para oficinas que querem crescer rápido.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">R$ 29</span>
                  <span className="text-slate-500 font-medium">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-slate-900 font-medium"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Tudo do plano Grátis</li>
                <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Ordens de Serviço Ilimitadas</li>
                <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Gestão de Estoque</li>
                <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Notificações automáticas</li>
                <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Relatórios financeiros avançados</li>
                <li className="flex gap-3 text-slate-600"><Check className="h-5 w-5 text-blue-600 shrink-0" /> Suporte prioritário</li>
              </ul>
              <Link to="/signup">
                <Button className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30">
                  Assinar Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> {faq.q}
                </h3>
                <p className="text-slate-600 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-blue-600 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para organizar sua oficina?</h2>
        <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">Junte-se a dezenas de oficinas que já modernizaram seu atendimento e economizam horas toda semana.</p>
        <Link to="/signup">
          <Button className="h-14 px-10 text-lg rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-xl">
            Criar conta grátis agora
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Wrench className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-lg tracking-tight">Oficina em Ordem</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <a href="mailto:contato@oficinaemordem.com.br" className="hover:text-white transition-colors flex items-center gap-2">
              Contato: contato@oficinaemordem.com.br
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
              <a href="#app-experience">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded-lg">
                  Ver como
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
