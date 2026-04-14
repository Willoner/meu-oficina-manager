import { Link } from "react-router-dom";
import { ArrowLeft, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermosUso = () => {
  const dataAtualizacao = "14 de abril de 2026";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/signup">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Gavel className="w-6 h-6" />
            <span>Oficina em Ordem</span>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-8 italic">Última atualização: {dataAtualizacao}</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Objeto</h2>
          <p>O <strong>Oficina em Ordem</strong> é uma plataforma de Software como Serviço (SaaS) destinada à gestão de micro e pequenas oficinas mecânicas, fornecendo ferramentas para cadastro de clientes, veículos, controle de estoque e emissão de Ordens de Serviço digitais.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Cadastro e Acesso</h2>
          <p>Para utilizar o sistema, o usuário deve criar uma conta fornecendo dados verdadeiros e precisos. O usuário é o único responsável por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Manter a confidencialidade de sua senha de acesso.</li>
            <li>Todas as atividades realizadas em sua conta.</li>
            <li>Garantir que os dados de seus clientes sejam inseridos com permissão adequada.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Planos e Pagamentos</h2>
          <p>O sistema pode oferecer planos Gratuitos e Pro. Ao optar por um plano pago:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>O pagamento será processado via cartão de crédito ou métodos disponíveis.</li>
            <li>A renovação é automática, salvo se o cancelamento for solicitado previamente.</li>
            <li>O cancelamento pode ser feito a qualquer momento através do painel de configurações, interrompendo cobranças futuras.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Responsabilidades do Usuário</h2>
          <p>Ao utilizar o Oficina em Ordem, você concorda em não:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utilizar o sistema para atividades ilícitas ou fraudulentas.</li>
            <li>Tentar burlar medidas de segurança ou acessar dados de terceiros.</li>
            <li>Compartilhar suas credenciais de acesso com pessoas não autorizadas.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Disponibilidade e Suporte</h2>
          <p>Esforçamo-nos para manter o sistema online 24/7. No entanto, o serviço pode sofrer interrupções temporárias para manutenções programadas ou reparos de emergência. A manutenção programada será avisada aos usuários com antecedência mínima de 24 horas.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Limitação de Responsabilidade</h2>
          <p>O Oficina em Ordem é fornecido "no estado em que se encontra". Não nos responsabilizamos por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Falhas de conexão de internet do usuário.</li>
            <li>Danos indiretos, perda de lucros ou dados decorrentes do uso do sistema.</li>
            <li>Mau uso das ferramentas de gestão ou erro humano na inserção de dados.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">7. Modificações dos Termos</h2>
          <p>Reservamo-nos o direito de alterar estes termos a qualquer momento. Caso ocorram mudanças significativas, os usuários serão notificados via e-mail ou aviso no painel. O uso continuado do sistema após as mudanças indica aceitação dos novos termos.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">8. Cancelamento</h2>
          <p>O usuário pode encerrar sua conta a qualquer momento por meio das Configurações do Perfil. Os dados serão retidos ou excluídos conforme especificado em nossa Política de Privacidade.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">9. Foro</h2>
          <p>Eventuais controvérsias oriundas destes termos serão resolvidas no foro da Comarca de Limeira/SP.</p>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>© 2026 Oficina em Ordem - Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;
