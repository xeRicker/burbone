import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: "primary" | "success" | "error" | "warning";
}

const colorClasses = {
  primary: "text-primary bg-primary-subtle",
  success: "text-success bg-success-subtle",
  error: "text-error bg-error-subtle",
  warning: "text-warning bg-warning-subtle",
};

export function StatCard({ label, value, icon: Icon, color = "primary" }: StatCardProps) {
  return (
    <div className="bg-bg-raised border border-border-subtle p-6 rounded-xl flex items-center gap-4 min-h-[116px]">
      <div className={cn("p-3 rounded-full shrink-0", colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <p className="text-sm text-text-secondary truncate">{label}</p>
        <p className="text-2xl font-bold text-text-primary leading-tight break-words">{value}</p>
      </div>
    </div>
  );
}
