import { ReactNode } from "react";
import { Card, CardContent } from "@/app/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  subtext?: string;
  cardClassName?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  icon,
  subtext,
  cardClassName = "bg-card border-border",
  valueClassName = "",
}: StatCardProps) {
  return (
    <Card className={cardClassName}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold font-mono ${valueClassName}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
