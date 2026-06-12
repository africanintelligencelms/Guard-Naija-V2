import React from "react";
import { ChevronRight, LucideIcon } from "lucide-react";

export const ListTile: React.FC<{
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, onClick, danger, trailing }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 bg-surface px-4 py-3.5 active:bg-gray-50 text-left min-h-[44px]"
  >
    <div
      className={`rounded-xl p-2 shrink-0 ${
        danger ? "bg-red-50 text-danger" : "bg-primary-light text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p
        className={`text-sm font-semibold ${danger ? "text-danger" : "text-ink"}`}
      >
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-ink-secondary truncate">{subtitle}</p>
      )}
    </div>
    {trailing ?? <ChevronRight className="h-5 w-5 text-ink-faint shrink-0" />}
  </button>
);
