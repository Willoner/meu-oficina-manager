import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "accent";
  href?: string;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default", href }: MetricCardProps) => {
  const content = (
    <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            <div className="flex items-center gap-2">
              {trend && (
                <span className={`text-xs font-semibold ${trend.positive ? "text-success" : "text-destructive"}`}>
                  {trend.positive ? "↑" : "↓"} {trend.value}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              variant === "accent" ? "gradient-accent" : "bg-primary/10"
            }`}
          >
            <Icon className={`w-5 h-5 ${variant === "accent" ? "text-accent-foreground" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }

  return content;
};

export default MetricCard;
