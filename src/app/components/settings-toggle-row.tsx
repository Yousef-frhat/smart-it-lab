import { ReactNode } from "react";
import { Switch } from "@/app/components/ui/switch";

interface SettingsToggleRowProps {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SettingsToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: SettingsToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
