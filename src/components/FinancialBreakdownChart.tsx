import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "lucide-react";

interface ChartData {
  name: string;
  pecas: number;
  servicos: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const pecas = payload.find((p: any) => p.dataKey === "pecas")?.value || 0;
  const servicos = payload.find((p: any) => p.dataKey === "servicos")?.value || 0;
  const total = pecas + servicos;

  return (
    <div className="rounded-xl border bg-card p-3 shadow-lg text-sm space-y-1.5">
      <p className="font-bold text-card-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#82E9DE" }} />
        <span className="text-muted-foreground">Peças:</span>
        <span className="font-semibold text-card-foreground">
          R$ {pecas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#1A1F2C" }} />
        <span className="text-muted-foreground">Mão de Obra:</span>
        <span className="font-semibold text-card-foreground">
          R$ {servicos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <hr className="border-border" />
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Total:</span>
        <span className="font-bold text-card-foreground">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};

export const FinancialBreakdownChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Definir os últimos 6 meses
      const months: { start: string; end: string; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          start: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString(),
          label: d.toLocaleString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
        });
      }

      // 1. Buscar IDs de OS concluídas do usuário nos últimos 6 meses
      const { data: ordens } = await supabase
        .from("ordens_servico")
        .select("id, data_conclusao")
        .eq("usuario_id", user.id)
        .eq("status", "concluida")
        .gte("data_conclusao", months[0].start)
        .lte("data_conclusao", months[months.length - 1].end);

      if (!ordens || ordens.length === 0) {
        setData(months.map((m) => ({ name: m.label, pecas: 0, servicos: 0 })));
        setLoading(false);
        return;
      }

      const osIds = ordens.map((o) => o.id);

      // 2. Buscar todos os itens dessas OS em uma única query
      const { data: itens } = await supabase
        .from("itens_os")
        .select("tipo, valor_total, ordem_servico_id")
        .in("ordem_servico_id", osIds);

      // 3. Criar mapa: OS ID -> data_conclusao
      const osDateMap = new Map<string, string>();
      ordens.forEach((o) => {
        if (o.data_conclusao) osDateMap.set(o.id, o.data_conclusao);
      });

      // 4. Agrupar por mês e tipo
      const monthlyData = months.map((m) => ({
        name: m.label,
        pecas: 0,
        servicos: 0,
      }));

      itens?.forEach((item) => {
        const dataConclusao = osDateMap.get(item.ordem_servico_id);
        if (!dataConclusao) return;

        const itemDate = new Date(dataConclusao);
        const monthIndex = months.findIndex((m) => {
          const start = new Date(m.start);
          const end = new Date(m.end);
          return itemDate >= start && itemDate <= end;
        });

        if (monthIndex === -1) return;

        if (item.tipo === "peca") {
          monthlyData[monthIndex].pecas += item.valor_total || 0;
        } else {
          monthlyData[monthIndex].servicos += item.valor_total || 0;
        }
      });

      setData(monthlyData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  const hasData = data.some((d) => d.pecas > 0 || d.servicos > 0);

  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Peças vs Mão de Obra
          </CardTitle>
          <CardDescription>Composição do faturamento nos últimos 6 meses</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {!hasData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma OS concluída nos últimos 6 meses para exibir dados.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `R$${(value / 1000).toFixed(0)}k`
                      : `R$${value}`
                  }
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(130, 233, 222, 0.1)" }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingBottom: "16px", fontSize: "13px" }}
                  formatter={(value: string) =>
                    value === "pecas" ? "Peças" : "Mão de Obra"
                  }
                />
                <Bar
                  dataKey="servicos"
                  stackId="faturamento"
                  fill="#1A1F2C"
                  radius={[0, 0, 0, 0]}
                  barSize={window.innerWidth < 640 ? 25 : 40}
                />
                <Bar
                  dataKey="pecas"
                  stackId="faturamento"
                  fill="#82E9DE"
                  radius={[6, 6, 0, 0]}
                  barSize={window.innerWidth < 640 ? 25 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
