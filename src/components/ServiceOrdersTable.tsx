import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type OrderData = {
  id: string;
  status: string | null;
  tipo_servico: string | null;
  data_abertura: string | null;
  observacoes: string | null;
  clientes: { nome: string } | null;
  veiculos: { modelo: string; placa: string } | null;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  aberta: { label: "Aberta", className: "bg-warning/10 text-warning border-warning/20" },
  em_andamento: { label: "Em andamento", className: "bg-primary/10 text-primary border-primary/20" },
  concluida: { label: "Concluída", className: "bg-success/10 text-success border-success/20" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const ServiceOrdersTable = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("ordens_servico")
        .select(`
          id, status, tipo_servico, data_abertura, observacoes,
          clientes (nome),
          veiculos (modelo, placa)
        `)
        .eq("usuario_id", user.id)
        .order("data_abertura", { ascending: false })
        .limit(5);

      if (data) {
        setOrders(data as unknown as OrderData[]);
      }
    };
    fetchRecentOrders();
  }, []);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ordens de Serviço Recentes</CardTitle>
          <button 
            onClick={() => navigate("/ordens-servico")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2">Cliente</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden md:table-cell">Veículo</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden lg:table-cell">Serviço</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma ordem cadastrada.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusKey = order.status || "aberta";
                  const statusInfo = statusConfig[statusKey] || statusConfig.aberta;
                  const dataAbertura = order.data_abertura 
                    ? new Date(order.data_abertura).toLocaleDateString('pt-BR') 
                    : "—";
                  
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/ordens-servico")}>
                      <td className="py-3 px-2 text-sm font-semibold text-primary">{dataAbertura}</td>
                      <td className="py-3 px-2 text-sm text-card-foreground">{order.clientes?.nome || "—"}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                        {order.veiculos ? `${order.veiculos.modelo} (${order.veiculos.placa})` : "—"}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                        {order.tipo_servico || "—"}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={statusInfo.className}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrdersTable;
