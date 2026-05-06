import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDown, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateFinancialReport } from "@/utils/reportGenerator";
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from "date-fns";

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportReportDialog({ open, onOpenChange }: ExportReportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateEnd, setDateEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Fetch workshop info
      const { data: userData } = await supabase
        .from("usuarios")
        .select("nome_oficina")
        .eq("id", user.id)
        .single();

      // Fetch Orders with items, clients and vehicles
      const { data: orders, error: ordersError } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          clientes(nome),
          veiculos(modelo, placa)
        `)
        .eq("usuario_id", user.id)
        .eq("status", "concluida")
        .gte("data_conclusao", startOfDay(new Date(dateStart)).toISOString())
        .lte("data_conclusao", endOfDay(new Date(dateEnd)).toISOString());

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        toast({
          title: "Sem dados",
          description: "Nenhuma OS concluída encontrada para o período selecionado.",
          variant: "destructive"
        });
        return;
      }

      // Calculate totals
      const osIds = orders.map(o => o.id);
      const { data: items } = await supabase
        .from("itens_os")
        .select("tipo, valor_total, ordem_servico_id")
        .in("ordem_servico_id", osIds);

      let totalParts = 0;
      let totalServices = 0;

      // Handle items
      items?.forEach(item => {
        if (item.tipo === "peca") totalParts += item.valor_total;
        else totalServices += item.valor_total;
      });

      // Handle OS without items (count as service)
      orders.forEach(o => {
        const hasItems = items?.some(i => i.ordem_servico_id === o.id);
        if (!hasItems && (o.valor_total || 0) > 0) {
          totalServices += o.valor_total;
        }
      });

      const totalRevenue = orders.reduce((acc, os) => acc + (os.valor_total || 0), 0);

      generateFinancialReport({
        workshopName: userData?.nome_oficina || "Minha Oficina",
        period: `${format(new Date(dateStart), "dd/MM/yy")} a ${format(new Date(dateEnd), "dd/MM/yy")}`,
        totalRevenue,
        totalParts,
        totalServices,
        orders
      });

      toast({ title: "Sucesso", description: "Relatório gerado com sucesso!" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Erro ao gerar relatório", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const setPeriod = (monthsAgo: number) => {
    const start = startOfMonth(subMonths(new Date(), monthsAgo));
    const end = endOfMonth(subMonths(new Date(), monthsAgo === 0 ? 0 : monthsAgo));
    setDateStart(format(start, "yyyy-MM-dd"));
    setDateEnd(format(end, "yyyy-MM-dd"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-primary" />
            Exportar Relatório Financeiro
          </DialogTitle>
          <DialogDescription>
            Escolha o período para gerar o documento detalhado de faturamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setPeriod(0)}>Mês Atual</Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod(1)}>Mês Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod(3)}>Últimos 3 Meses</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleExport} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
