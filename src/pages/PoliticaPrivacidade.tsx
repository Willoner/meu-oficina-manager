import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PoliticaPrivacidade = () => {
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
            <ShieldCheck className="w-6 h-6" />
            <span>Oficina em Ordem</span>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-8 italic">Última atualização: {dataAtualizacao}</p>

          <p>Esta Política de Privacidade descreve como o sistema <strong>Oficina em Ordem</strong> coleta, usa e protege suas informações. Estamos comprometidos em garantir a privacidade e a segurança dos seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Dados Coletados</h2>
          <p>Para fornecer nossos serviços de gestão, coletamos as seguintes categorias de informações:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dados da Oficina:</strong> Nome da oficina, telefone, CNPJ, endereço completo, e-mail e logotipo.</li>
            <li><strong>Dados de Clientes e Veículos:</strong> Nome do cliente, telefone, e-mail, placa do veículo, modelo, marca, ano e quilometragem.</li>
            <li><strong>Dados de Ordens de Serviço:</strong> Descrição de serviços realizados, peças utilizadas, valores, status da OS e assinaturas digitais.</li>
            <li><strong>Dados de Uso:</strong> Endereço IP, tipo de dispositivo, navegador utilizado e logs de acesso às páginas.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Finalidade do Tratamento</h2>
          <p>Os dados coletados são tratados exclusivamente para as seguintes finalidades:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gestão operacional da oficina mecânica.</li>
            <li>Emissão e armazenamento de Ordens de Serviço.</li>
            <li>Controle financeiro e faturamento dos serviços.</li>
            <li>Melhoria contínua da interface e funcionalidades do sistema.</li>
            <li>Comunicação de suporte e notificações importantes sobre o serviço.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Compartilhamento e Armazenamento</h2>
          <p>Seus dados são armazenados de forma segura na infraestrutura da <strong>Supabase</strong> (utilizando servidores Google Cloud). Adotamos as seguintes premissas:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Não vendemos ou alugamos:</strong> Jamais comercializamos seus dados ou os dados de seus clientes para terceiros.</li>
            <li><strong>Segurança:</strong> Utilizamos criptografia em trânsito (HTTPS) e em repouso para todos os dados sensíveis.</li>
            <li><strong>Acesso Restrito:</strong> Implementamos segurança em nível de linha (Row Level Security - RLS), garantindo que apenas você possa acessar os dados de sua oficina.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Seus Direitos (LGPD)</h2>
          <p>Como titular dos dados, você possui os seguintes direitos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Confirmar a existência de tratamento e acessar seus dados.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão de seus dados (o que implicará no encerramento da conta).</li>
            <li>Revogar o seu consentimento a qualquer momento.</li>
          </ul>
          <p>Para exercer esses direitos, entre em contato conosco através do e-mail: <a href="mailto:privacidade@oficinaemordem.com.br" className="text-primary hover:underline">privacidade@oficinaemordem.com.br</a>.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Retenção de Dados</h2>
          <p>Mantemos seus dados enquanto sua conta estiver ativa. Caso decida cancelar sua conta, todos os dados vinculados serão removidos de nossos servidores em até 30 dias úteis, exceto aqueles que precisarmos manter por obrigações legais ou fiscais.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Alterações</h2>
          <p>Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças substanciais através do sistema ou por e-mail.</p>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>© 2026 Oficina em Ordem - Gestão para Automotores.</p>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
