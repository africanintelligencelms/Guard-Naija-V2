import React from "react";
import { IncidentStatus, SeverityLevel } from "../../types";

type Tone = "warning" | "info" | "success" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  warning: "bg-amber-50 text-amber-700",
  info: "bg-blue-50 text-info",
  success: "bg-primary-light text-primary-dark",
  danger: "bg-red-50 text-danger",
  neutral: "bg-gray-100 text-ink-secondary",
};

const STATUS_TONE: Record<IncidentStatus, { label: string; tone: Tone }> = {
  [IncidentStatus.Submitted]: { label: "Pending", tone: "warning" },
  [IncidentStatus.Verified]: { label: "Verified", tone: "info" },
  [IncidentStatus.InProgress]: { label: "In Progress", tone: "info" },
  [IncidentStatus.Resolved]: { label: "Resolved", tone: "success" },
};

export const StatusBadge: React.FC<{
  status?: IncidentStatus;
  severity?: SeverityLevel;
  label?: string;
  tone?: Tone;
}> = ({ status, severity, label, tone }) => {
  let resolvedLabel = label ?? "";
  let resolvedTone: Tone = tone ?? "neutral";

  if (status && STATUS_TONE[status]) {
    resolvedLabel = label ?? STATUS_TONE[status].label;
    resolvedTone = tone ?? STATUS_TONE[status].tone;
  }
  if (severity === SeverityLevel.Critical) {
    resolvedLabel = label ?? "Critical";
    resolvedTone = "danger";
  }

  if (!resolvedLabel) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[resolvedTone]}`}
    >
      {resolvedLabel}
    </span>
  );
};
