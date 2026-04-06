import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "OS-001", client: "João Silva", vehicle: "Honda Civic 2020", service: "Troca de óleo e filtros", status: "em_andamento", date: "05/04/2026" },
  { id: "OS-002", client: "Maria Santos", vehicle: "Toyota Corolla 2019", service: "Revisão completa", status: "concluida", date: "04/04/2026" },
  { id: "OS-003", client: "Carlos Oliveira", vehicle: "VW Gol 2018", service: "Troca de pastilhas de freio", status: "aguardando", date: "05/04/2026" },
  { id: "OS-004", client: "Ana Costa", vehicle: "Fiat Argo 2021", service: "Alinhamento e balanceamento", status: "em_andamento", date: "05/04/2026" },
  { id: "OS-005", client: "Pedro Lima", vehicle: "Chevrolet Onix 2022", service: "Diagnóstico eletrônico", status: "aguardando", date: "06/04/2026" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  em_andamento: { label: "Em andamento", className: "bg-primary/10 text-primary border-primary/20" },
  concluida: { label: "Concluída", className: "bg-success/10 text-success border-success/20" },
  aguardando: { label: "Aguardando", className: "bg-warning/10 text-warning border-warning/20" },
};

const ServiceOrdersTable = () => {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Ordens de Serviço Recentes</CardTitle>
          <button className="text-sm font-medium text-primary hover:underline">Ver todas</button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2">Código</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2">Cliente</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden md:table-cell">Veículo</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden lg:table-cell">Serviço</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                    <td className="py-3 px-2 text-sm font-semibold text-primary">{order.id}</td>
                    <td className="py-3 px-2 text-sm text-card-foreground">{order.client}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">{order.vehicle}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden lg:table-cell">{order.service}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">{order.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOrdersTable;
