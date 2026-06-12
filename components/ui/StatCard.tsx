import React from "react";
import { LucideIcon } from "lucide-react";

export const StatCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: string | number;
  tint?: "primary" | "danger" | "info" | "warning";
}> = ({ icon: Icon, label, value, tint = "primary" }) => {
  const tints = {
    primary: "bg-primary-light text-primary",
    danger: "bg-red-50 text-danger",
    info: "bg-blue-50 text-info",
    warning: "bg-amber-50 text-warning",
  };
  return (
    <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className={`rounded-xl p-2 w-9 h-9 flex items-center justify-center ${tints[tint]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-ink leading-none">{value}</p>
      <p className="text-xs text-ink-secondary font-medium">{label}</p>
    </div>
  );
};
