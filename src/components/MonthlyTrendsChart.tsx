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
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

interface ChartData {
  name: string;
  total: number;
}

export const MonthlyTrendsChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last6Months.push({
          start: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString(),
          label: d.toLocaleString("pt-BR", { month: "short" }).replace(".", ""),
        });
      }

      const results = await Promise.all(
        last6Months.map(async (month) => {
          const { count } = await supabase
            .from("ordens_servico")
            .select("*", { count: "exact", head: true })
            .eq("usuario_id", user.id)
            .gte("created_at", month.start)
            .lte("created_at", month.end);

          return {
            name: month.label.toUpperCase(),
            total: count || 0,
          };
        })
      );

      setData(results);
      setLoading(false);
    };

    fetchMonthlyData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Movimentação Mensal
          </CardTitle>
          <CardDescription>Quantidade de Ordens de Serviço nos últimos 6 meses</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(130, 233, 222, 0.1)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#1A1F2C", fontWeight: "bold" }}
              />
              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
                barSize={window.innerWidth < 640 ? 25 : 40}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === data.length - 1 ? "#82E9DE" : "#1A1F2C"}
                    fillOpacity={index === data.length - 1 ? 1 : 0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
