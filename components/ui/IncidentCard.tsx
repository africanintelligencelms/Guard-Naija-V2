import React from "react";
import { MapPin, ShieldAlert } from "lucide-react";
import { IncidentReport, SeverityLevel } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "../../lib/format";

const IncidentCardInner: React.FC<{
  incident: IncidentReport;
  onClick?: () => void;
}> = ({ incident, onClick }) => {
  const critical = incident.severity === SeverityLevel.Critical;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface rounded-2xl border border-gray-100 shadow-sm p-4 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-xl p-2.5 shrink-0 ${
            critical ? "bg-red-50 text-danger" : "bg-primary-light text-primary"
          }`}
        >
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-ink truncate">
              {incident.type}
            </p>
            <StatusBadge
              status={incident.status}
              severity={incident.severity}
            />
          </div>
          <p className="text-sm text-ink-secondary mt-0.5 line-clamp-1">
            {incident.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink-faint">
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {incident.location?.address || "Unknown location"}
              </span>
            </span>
            <span className="shrink-0">{timeAgo(incident.timestamp)}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

// Firestore snapshots replace the whole array on every update — memoize rows
export const IncidentCard = React.memo(IncidentCardInner);
