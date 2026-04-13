import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Printer, 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type OSData = {
  id: string;
  status: string | null;
  tipo_servico: string | null;
  data_abertura: string | null;
  data_conclusao: string | null;
  observacoes: string | null;
  valor_total: number | null;
  cliente_id: string;
  veiculo_id: string;
  assinatura_cliente_aceito: boolean;
  assinatura_cliente_em: string | null;
  assinatura_mecanico_aceito: boolean;
  assinatura_mecanico_em: string | null;
  clientes: { nome: string; telefone: string; email: string } | null;
  veiculos: { modelo: string; placa: string; marca: string; ano: number; km_atual: number } | null;
  usuarios: { nome_oficina: string; telefone: string; email: string; cnpj: string; endereco: string; logotipo_url: string } | null;
};

type ItemOS = {
  id: string;
  tipo: string;
  item_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  nome?: string;
};

const VisualizarOS = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [os, setOs] = useState<OSData | null>(null);
  const [items, setItems] = useState<ItemOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      // 1. Fetch OS with Joins
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          clientes (nome, telefone, email),
          veiculos (modelo, placa, marca, ano, km_atual),
          usuarios (nome_oficina, telefone, email, cnpj, endereco, logotipo_url)
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar a OS.", variant: "destructive" });
        navigate("/ordens-servico");
        return;
      }

      setOs(data as unknown as OSData);

      // 2. Fetch Items
      const { data: itemsData } = await supabase
        .from("itens_os")
        .select("*")
        .eq("ordem_servico_id", id);

      if (itemsData) {
        // Enriched item names (Mocks for now since we'd need to join pecas/servicos if needed)
        // In a real scenario, we might want to fetch names if item_id is ref
        setItems(itemsData as ItemOS[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate, toast]);

  const handleToggleSignature = async (type: "cliente" | "mecanico", checked: boolean) => {
    if (!os) return;

    const updates: any = {};
    if (type === "cliente") {
      updates.assinatura_cliente_aceito = checked;
      updates.assinatura_cliente_em = checked ? new Date().toISOString() : null;
    } else {
      updates.assinatura_mecanico_aceito = checked;
      updates.assinatura_mecanico_em = checked ? new Date().toISOString() : null;
    }

    const { error } = await supabase
      .from("ordens_servico")
      .update(updates)
      .eq("id", os.id);

    if (error) {
      toast({ title: "Erro", description: "Falha ao salvar assinatura.", variant: "destructive" });
    } else {
      setOs({ ...os, ...updates });
      toast({ title: "Sucesso", description: `Assinatura do ${type} atualizada.` });
    }
  };

  const handleConcluir = async () => {
    if (!os) return;

    if (!os.assinatura_cliente_aceito || !os.assinatura_mecanico_aceito) {
      toast({ 
        title: "Ação Bloqueada", 
        description: "Ambas as assinaturas (Cliente e Mecânico) são obrigatórias para concluir a OS.", 
        variant: "destructive" 
      });
      return;
    }

    setSavingStatus(true);
    const { error } = await supabase
      .from("ordens_servico")
      .update({ 
        status: "concluida",
        data_conclusao: new Date().toISOString()
      })
      .eq("id", os.id);

    setSavingStatus(false);
    if (error) {
      toast({ title: "Erro", description: "Falha ao concluir OS.", variant: "destructive" });
    } else {
      setOs({ ...os, status: "concluida", data_conclusao: new Date().toISOString() });
      toast({ title: "Sucesso", description: "Ordem de serviço concluída com sucesso!" });
    }
  };

  const handleWhatsApp = () => {
    if (!os) return;
    const msg = encodeURIComponent(
      `Olá ${os.clientes?.nome}, aqui está o link para visualização da sua Ordem de Serviço na ${os.usuarios?.nome_oficina}:\n\n` +
      `${window.location.href}`
    );
    window.open(`https://wa.me/${os.clientes?.telefone?.replace(/\D/g, '')}?text=${msg}`, "_blank");
  };

  const handleEmail = () => {
    if (!os) return;
    const subject = encodeURIComponent(`Ordem de Serviço - ${os.usuarios?.nome_oficina}`);
    const body = encodeURIComponent(`Olá ${os.clientes?.nome},\n\nSegue o link para visualização da sua Ordem de Serviço:\n${window.location.href}`);
    window.location.href = `mailto:${os.clientes?.email}?subject=${subject}&body=${body}`;
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground italic">Carregando Ordem de Serviço...</div>;
  if (!os) return null;

  const subtotal = os.valor_total || 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <main className="ml-0 md:ml-64 min-h-screen print:m-0 print:p-0">
        <div className="print:hidden">
          <Header title="Visualizar OS" subtitle={`Ordem de Serviço #${os.id.substring(0, 8).toUpperCase()}`} />
        </div>

        <div className="p-4 md:p-8">
          {/* Buttons (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <Button variant="ghost" onClick={() => navigate("/ordens-servico")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleWhatsApp} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
            <Button variant="outline" onClick={handleEmail} className="gap-2">
              <Mail className="w-4 h-4" /> E-mail
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            {os.status !== "concluida" && (
              <Button onClick={handleConcluir} disabled={savingStatus} className="gap-2 bg-chart-2 hover:bg-chart-2/90">
                <CheckCircle2 className="w-4 h-4" /> Marcar como Concluída
              </Button>
            )}
          </div>
        </div>

        {/* Paper Container */}
        <Card className="max-w-4xl mx-auto shadow-xl print:shadow-none print:border-none rounded-none print:w-full">
          <CardContent className="p-10 space-y-8">
            
            {/* Header / Garage Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
              <div className="flex items-center gap-4">
                {os.usuarios?.logotipo_url ? (
                  <img src={os.usuarios.logotipo_url} alt="Logo" className="w-20 h-20 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-2xl">
                    {os.usuarios?.nome_oficina?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight">{os.usuarios?.nome_oficina}</h1>
                  <p className="text-sm text-muted-foreground">{os.usuarios?.endereco || "Endereço não informado"}</p>
                  <p className="text-sm text-muted-foreground">Tel: {os.usuarios?.telefone} | CNPJ: {os.usuarios?.cnpj}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary font-bold text-sm mb-1">ORDEM DE SERVIÇO</div>
                <div className="text-3xl font-black text-foreground">#{os.id.substring(0, 8).toUpperCase()}</div>
                <div className="text-sm text-muted-foreground mt-1">Data: {os.data_abertura ? new Date(os.data_abertura).toLocaleDateString("pt-BR") : "—"}</div>
              </div>
            </div>

            {/* Client & Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-6 rounded-lg print:bg-transparent print:border print:p-4">
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">DADOS DO CLIENTE</div>
                <div>
                  <p className="font-bold text-foreground text-lg">{os.clientes?.nome}</p>
                  <p className="text-sm text-muted-foreground">{os.clientes?.telefone}</p>
                  <p className="text-sm text-muted-foreground">{os.clientes?.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">DADOS DO VEÍCULO</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Modelo / Marca</p>
                    <p className="font-semibold text-sm">{os.veiculos?.modelo} - {os.veiculos?.marca}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Placa / Ano</p>
                    <p className="font-semibold text-sm">{os.veiculos?.placa} | {os.veiculos?.ano}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">KM Atual</p>
                    <p className="font-semibold text-sm">{os.veiculos?.km_atual?.toLocaleString() || "—"} km</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ÍTENS E SERVIÇOS</div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-foreground/10 text-left">
                    <th className="py-2 px-1">Descrição</th>
                    <th className="py-2 px-4 text-center">Tipo</th>
                    <th className="py-2 px-4 text-center">Quant.</th>
                    <th className="py-2 px-4 text-right">Unitário</th>
                    <th className="py-2 px-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-foreground/5 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-1 font-medium">{item.tipo === 'servico' ? 'Mão de Obra / Serviço' : (item.item_id ? 'Peça / Componente' : 'Item avulso')}</td>
                      <td className="py-3 px-4 text-center uppercase text-[10px] font-bold text-muted-foreground">{item.tipo === 'peca' ? 'Peça' : 'Serviço'}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.quantidade}</td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">R$ {item.valor_unitario?.toFixed(2)}</td>
                      <td className="py-3 px-1 text-right font-bold text-foreground">R$ {item.valor_total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-4 text-right font-bold text-muted-foreground text-base">Valor Total Final:</td>
                    <td className="py-4 text-right font-black text-foreground text-2xl">R$ {subtotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observations */}
            {os.observacoes && (
              <div className="p-4 border rounded-md bg-muted/20 text-sm italic text-muted-foreground border-dashed">
                <span className="font-bold not-italic block mb-1 text-[10px] text-foreground">OBSERVAÇÕES ADICIONAIS:</span>
                "{os.observacoes}"
              </div>
            )}

            {/* Contract / Clauses */}
            <div className="space-y-4 pt-4 border-t">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CONTRATO E GARANTIA (CONDIÇÕES GERAIS)</div>
              <div className="text-[10px] leading-relaxed text-muted-foreground space-y-2 prose max-w-none">
                <p><strong>1. PRAZO E ENTREGA:</strong> O serviço será executado conforme disponibilidade técnica. A oficina não se responsabiliza por atrasos decorrentes de falta de peças no mercado ou imprevistos de transporte.</p>
                <p><strong>2. GARANTIA:</strong> Nos termos da lei, garantimos os serviços por 90 dias e peças conforme fabricante. A garantia não cobre uso indevido, acidentes ou intervenção de terceiros após a entrega.</p>
                <p><strong>3. PAGAMENTO:</strong> Os valores aqui descritos devem ser quitados no ato da entrega do veículo, salvo acordo prévio por escrito. Orçamentos têm validade de 5 dias úteis.</p>
                <p><strong>4. RESPONSABILIDADE:</strong> O cliente declara-se proprietário ou responsável legal pelo veículo, autorizando o teste de rodagem necessário para diagnóstico e verificação dos serviços.</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="p-4 border-2 rounded-xl flex flex-col gap-4 bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="print:hidden">
                    <Checkbox 
                      id="sign-client" 
                      checked={os.assinatura_cliente_aceito} 
                      onCheckedChange={(checked) => handleToggleSignature("cliente", checked === true)} 
                    />
                  </div>
                  <label htmlFor="sign-client" className="text-sm font-bold cursor-pointer">Assinatura do Cliente</label>
                  {os.assinatura_cliente_aceito && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <div className="h-[2px] bg-foreground/20 mt-8 mb-2 border-t border-dashed"></div>
                <div className="text-[10px] text-center text-muted-foreground uppercase">
                  {os.assinatura_cliente_em ? `Aceito digitalmente em: ${new Date(os.assinatura_cliente_em).toLocaleString("pt-BR")}` : "Aguardando assinatura"}
                </div>
              </div>

              <div className="p-4 border-2 rounded-xl flex flex-col gap-4 bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="print:hidden">
                    <Checkbox 
                      id="sign-mecanic" 
                      checked={os.assinatura_mecanico_aceito} 
                      onCheckedChange={(checked) => handleToggleSignature("mecanico", checked === true)} 
                    />
                  </div>
                  <label htmlFor="sign-mecanic" className="text-sm font-bold cursor-pointer">Assinatura do Mecânico</label>
                  {os.assinatura_mecanico_aceito && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <div className="h-[2px] bg-foreground/20 mt-8 mb-2 border-t border-dashed"></div>
                <div className="text-[10px] text-center text-muted-foreground uppercase">
                  {os.assinatura_mecanico_em ? `Assinado em: ${new Date(os.assinatura_mecanico_em).toLocaleString("pt-BR")}` : "Aguardando assinatura"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 text-center text-[10px] text-muted-foreground border-t">
              Esta é uma Ordem de Serviço eletrônica gerada pelo sistema Oficina em Ordem.
              <br/>Impresso em {new Date().toLocaleString("pt-BR")}
            </div>
            
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VisualizarOS;
