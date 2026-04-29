import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Wrench, Package, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface VehicleHistoryTimelineProps {
  vehicleId: string;
}

interface OSWithItems {
  id: string;
  data_abertura: string;
  tipo_servico: string;
  valor_total: number;
  observacoes: string;
  categoria_servico?: string;
  itens_os?: {
    descricao: string;
    quantidade: number;
    valor_total: number;
    tipo: string;
  }[];
}

export const VehicleHistoryTimeline: React.FC<VehicleHistoryTimelineProps> = ({ vehicleId }) => {
  const [history, setHistory] = useState<OSWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("*, itens_os(descricao, quantidade, valor_total, tipo)")
        .eq("veiculo_id", vehicleId)
        .order("data_abertura", { ascending: false });

      if (!error && data) {
        setHistory(data as OSWithItems[]);
      }
      setLoading(false);
    };

    if (vehicleId) {
      fetchHistory();
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Nenhum histórico encontrado para este veículo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {history.map((os) => (
          <div key={os.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            {/* Content */}
            <div 
              className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => setExpandedId(expandedId === os.id ? null : os.id)}
            >
              <div className="absolute top-4 right-4 text-muted-foreground/50">
                {expandedId === os.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              <div className="flex items-center justify-between mb-1 pr-6">
                <time className="text-xs font-bold text-muted-foreground uppercase">
                  {os.data_abertura ? format(new Date(os.data_abertura), "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Data não informada"}
                </time>
                <div className="flex gap-2">
                  {os.categoria_servico === "preventiva" && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50">Preventiva</Badge>
                  )}
                  {os.categoria_servico === "corretiva" && (
                    <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 bg-orange-50">Corretiva</Badge>
                  )}
                  <Badge variant={os.status === "concluida" ? "success" : "secondary"} className="capitalize">
                    {os.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm font-semibold mb-2">{os.tipo_servico || "Serviço Geral"}</div>
              {os.observacoes && (
                <p className="text-xs text-muted-foreground line-clamp-2 italic mb-3">
                  "{os.observacoes}"
                </p>
              )}
              
              {expandedId === os.id && os.itens_os && os.itens_os.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Itens Inclusos na O.S.</p>
                  <ul className="space-y-1">
                    {os.itens_os.map((item, idx) => (
                      <li key={idx} className="text-xs flex justify-between">
                        <span className="flex gap-1 items-center">
                          <span className="text-muted-foreground">{item.quantidade}x</span>
                          {item.descricao}
                        </span>
                        <span className="text-muted-foreground">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor_total || 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                <span className="text-xs font-medium text-muted-foreground">Valor Total:</span>
                <span className="text-sm font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(os.valor_total || 0)}
                </span>
              </div>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};
