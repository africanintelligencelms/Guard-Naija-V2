import React from "react";
import { LucideIcon } from "lucide-react";

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    <div className="bg-primary-light text-primary rounded-full p-4 mb-4">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {message && <p className="text-sm text-ink-secondary mt-1 max-w-xs">{message}</p>}
    {action && <div className="mt-5 w-full max-w-xs">{action}</div>}
  </div>
);
