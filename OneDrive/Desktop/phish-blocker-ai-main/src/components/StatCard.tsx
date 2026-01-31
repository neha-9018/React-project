import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "danger" | "warning" | "success";
}

export default function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setIsUpdating(true);
      setPrevValue(value);
      const timer = setTimeout(() => setIsUpdating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);
  const variantStyles = {
    default: "border-primary/20 bg-primary/5",
    danger: "border-destructive/20 bg-destructive/5",
    warning: "border-warning/20 bg-warning/5",
    success: "border-success/20 bg-success/5",
  };

  const iconStyles = {
    default: "text-primary",
    danger: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  };

  return (
    <Card className={cn(
      "border-2 transition-all hover:shadow-lg",
      variantStyles[variant],
      isUpdating && "animate-scale-in ring-2 ring-primary"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-3xl font-bold text-foreground transition-all",
              isUpdating && "scale-110 text-primary"
            )}>
              {value}
            </p>
            {trend && (
              <p className={cn("text-xs font-medium", trend.isPositive ? "text-success" : "text-destructive")}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn("rounded-lg bg-background/50 p-3", iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
