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
    <div className="bg-bg-raised p-6 rounded-xl flex items-center gap-6">
      <div className={cn("p-3 rounded-full", colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}
