import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

type OSData = {
  id: string;
  status: string | null;
  tipo_servico: string | null;
  data_abertura: string | null;
  data_conclusao: string | null;
  prazo: string | null;
  observacoes: string | null;
  valor_total: number | null;
  cliente_id: string;
  veiculo_id: string;
  assinatura_cliente_aceito: boolean;
  assinatura_cliente_em: string | null;
  assinatura_cliente_img?: string | null;
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
  descricao?: string;
  nome?: string;
};

const PublicOS = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [os, setOs] = useState<OSData | null>(null);
  const [items, setItems] = useState<ItemOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [useSignaturePad, setUseSignaturePad] = useState(true);
  const sigCanvas = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
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
        toast({ title: "Erro", description: "Não foi possível carregar a OS. Verifique o link.", variant: "destructive" });
        return;
      }

      setOs(data as unknown as OSData);

      const { data: itemsData } = await supabase
        .from("itens_os")
        .select("*")
        .eq("ordem_servico_id", id);

      if (itemsData) {
        setItems(itemsData as ItemOS[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, toast]);

  const handlePublicSignature = async () => {
    if (!os || os.assinatura_cliente_aceito) return;

    setSigning(true);
    let signatureBase64 = null;

    if (useSignaturePad && sigCanvas.current && !sigCanvas.current.isEmpty()) {
      signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    } else if (useSignaturePad && (!sigCanvas.current || sigCanvas.current.isEmpty())) {
      toast({ title: "Aviso", description: "Por favor, desenhe sua assinatura ou mude para o clique simples.", variant: "destructive" });
      setSigning(false);
      return;
    }

    const { error } = await supabase.rpc('assinar_os_cliente_publico_v2', { 
      p_os_id: os.id,
      p_assinatura_img: signatureBase64
    });

    if (error) {
      toast({ title: "Erro", description: "Falha ao registrar assinatura. Tente novamente.", variant: "destructive" });
    } else {
      setOs({ 
        ...os, 
        assinatura_cliente_aceito: true, 
        assinatura_cliente_em: new Date().toISOString(),
        assinatura_cliente_img: signatureBase64
      });
      toast({ title: "Sucesso", description: "Sua assinatura foi registrada com sucesso!" });
    }
    setSigning(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground italic">Carregando Ordem de Serviço...</div>;
  if (!os) return <div className="p-20 text-center font-bold">Ordem de serviço não encontrada.</div>;

  const subtotal = os.valor_total || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Simple Public Header */}
        <div className="flex items-center justify-between gap-4 px-2">
           <div className="flex items-center gap-2">
             <ClipboardList className="w-6 h-6 text-primary" />
             <span className="font-bold text-lg hidden sm:inline">Oficina em Ordem</span>
           </div>
           <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
             <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir</span>
           </Button>
        </div>

        <Card className="shadow-xl border-t-4 border-t-primary rounded-xl overflow-hidden print:shadow-none print:border-none">
          <CardContent className="p-6 md:p-10 space-y-8">
            
            {/* Garage Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
              <div className="flex items-center gap-4">
                {os.usuarios?.logotipo_url ? (
                  <img src={os.usuarios.logotipo_url} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-2xl">
                    {os.usuarios?.nome_oficina?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">{os.usuarios?.nome_oficina}</h1>
                  <p className="text-xs text-muted-foreground">{os.usuarios?.endereco || "Endereço registrado"}</p>
                </div>
              </div>
              <div className="text-right sr-only md:not-sr-only">
                <div className="text-primary font-bold text-[10px] mb-1 uppercase">Visualização do Cliente</div>
                <div className="text-2xl font-black text-foreground">#{os.id.substring(0, 8).toUpperCase()}</div>
              </div>
            </div>

            {/* Client & Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-5 rounded-lg border border-muted-foreground/5">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CLIENTE</div>
                <p className="font-bold text-foreground">{os.clientes?.nome}</p>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">VEÍCULO</div>
                <p className="font-bold text-foreground">{os.veiculos?.modelo} ({os.veiculos?.placa})</p>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PRAZO DE ENTREGA</div>
                <p className={`font-black ${os.status !== 'concluida' && os.prazo && new Date(os.prazo) < new Date(new Date().setHours(0,0,0,0)) ? 'text-destructive underline decoration-wavy' : 'text-foreground'}`}>
                  {os.prazo ? new Date(os.prazo).toLocaleDateString() : 'A combinar'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground text-[10px] uppercase font-bold">
                    <th className="py-2">Descrição</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-foreground/5">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground">{item.descricao || (item.tipo === 'servico' ? 'Serviço' : 'Peça')}</div>
                        <div className="text-[10px] text-muted-foreground">Qtd: {item.quantidade} x R$ {item.valor_unitario?.toFixed(2)}</div>
                      </td>
                      <td className="py-3 text-right font-bold text-foreground">R$ {item.valor_total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-4 text-right font-bold text-muted-foreground uppercase text-[10px]">Valor Total:</td>
                    <td className="py-4 text-right font-black text-primary text-xl">R$ {subtotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observations */}
            {os.observacoes && (
              <div className="p-4 border rounded-md bg-muted/20 text-xs text-muted-foreground">
                <span className="font-bold text-foreground uppercase text-[10px] block mb-1">Observações:</span>
                "{os.observacoes}"
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Cliente */}
              <div className={`p-5 border-2 rounded-2xl transition-all ${os.assinatura_cliente_aceito ? 'border-green-500/30 bg-green-50/50' : 'border-primary/20 bg-primary/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground">Assinatura do Cliente</span>
                  {os.assinatura_cliente_aceito ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setUseSignaturePad(!useSignaturePad)} className="text-[10px] h-6 px-2">
                      Mudar para {useSignaturePad ? "Clique Simples" : "Desenho"}
                    </Button>
                  )}
                </div>
                <div className="h-[1px] bg-muted-foreground/10 mb-3"></div>
                
                {os.assinatura_cliente_aceito ? (
                  <div className="flex flex-col items-center">
                    {os.assinatura_cliente_img ? (
                      <img src={os.assinatura_cliente_img} alt="Assinatura Cliente" className="h-16 object-contain mb-2 invert dark:invert-0 opacity-80" />
                    ) : (
                      <p className="text-sm font-bold text-foreground py-4">Assinado Digitalmente</p>
                    )}
                    <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter">
                      Aceito em: {new Date(os.assinatura_cliente_em!).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {useSignaturePad ? (
                      <div className="flex flex-col gap-2 items-center">
                        <div className="w-full bg-white border-2 border-dashed border-primary/40 rounded-lg overflow-hidden touch-none h-[120px]">
                          <SignatureCanvas 
                            ref={sigCanvas}
                            canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                            penColor="black"
                          />
                        </div>
                        <div className="flex w-full gap-2">
                          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8" onClick={() => sigCanvas.current?.clear()}>Limpar</Button>
                          <Button size="sm" className="flex-1 text-[10px] h-8" onClick={handlePublicSignature} disabled={signing}>Assinar e Confirmar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 py-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="client-sign" checked={false} onCheckedChange={() => handlePublicSignature()} disabled={signing} className="w-5 h-5" />
                          <label htmlFor="client-sign" className="text-xs font-semibold cursor-pointer">Li e concordo com os termos e serviços desta O.S.</label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mecânico - Read Only for Client */}
              <div className={`p-5 border-2 rounded-2xl ${os.assinatura_mecanico_aceito ? 'border-foreground/20 bg-muted/20' : 'border-muted bg-muted/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground opacity-60">Assinatura da Oficina</span>
                  {os.assinatura_mecanico_aceito && <CheckCircle2 className="w-5 h-5 text-foreground/40" />}
                </div>
                <div className="h-[1px] bg-muted-foreground/10 mb-3"></div>
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter italic">
                  {os.assinatura_mecanico_aceito 
                    ? `Assinado por: Responsável Técnico` 
                    : "Aguardando assinatura da oficina"}
                </p>
              </div>
            </div>

            <div className="text-[9px] text-center text-muted-foreground pt-4 leading-tight space-y-2">
              <div className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest opacity-60">
                <a href="/termos" target="_blank" className="hover:text-primary">Termos</a>
                <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <a href="/privacidade" target="_blank" className="hover:text-primary">Privacidade</a>
              </div>
              <p>
                Este link é exclusivo para aprovação desta Ordem de Serviço.<br/>
                © 2026 Oficina em Ordem - Gestão Inteligente.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicOS;
