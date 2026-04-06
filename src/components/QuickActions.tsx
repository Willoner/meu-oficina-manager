import { Plus, Search, FileText, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Nova Ordem de Serviço", variant: "default" as const },
  { icon: UserPlus, label: "Cadastrar Cliente", variant: "outline" as const },
  { icon: Search, label: "Buscar Veículo", variant: "outline" as const },
  { icon: FileText, label: "Gerar Relatório", variant: "outline" as const },
];

const QuickActions = () => {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button key={action.label} variant={action.variant} className="w-full justify-start gap-3" size="sm">
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
