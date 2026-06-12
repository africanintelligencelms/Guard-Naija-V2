import React from "react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export const OfflineBanner: React.FC = () => {
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 flex items-center gap-2 sticky top-0 z-50">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      You're offline — reports will be sent when you reconnect.
    </div>
  );
};
