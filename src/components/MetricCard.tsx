import { LucideIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "accent";
  href?: string;
  chartData?: { value: number }[];
  showToggle?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = "default", 
  href,
  chartData,
  showToggle = false
}: MetricCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const content = (
    <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {showToggle && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsVisible(!isVisible);
                  }}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <p className="text-2xl font-bold text-card-foreground">
              {showToggle && !isVisible ? "••••••" : value}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              variant === "accent" ? "gradient-accent shadow-lg shadow-accent/20" : "bg-primary/10"
            }`}
          >
            <Icon className={`w-5 h-5 ${variant === "accent" ? "text-accent-foreground" : "text-primary"}`} />
          </div>
        </div>

        {chartData && chartData.length > 0 && (
          <div className="h-10 w-full opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis hide domain={['auto', 'auto']} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={variant === "accent" ? "#fff" : "hsl(var(--primary))"} 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{subtitle}</span>
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
