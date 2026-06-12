import React from "react";
import { Map } from "lucide-react";
import { AppHeader } from "../../components/ui/AppHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { IncidentCard } from "../../components/ui/IncidentCard";
import { useIncidents } from "../../context/IncidentContext";

// Placeholder until the Leaflet map lands in Phase 3 (lazy "map" chunk).
export const MapView: React.FC = () => {
  const { incidents } = useIncidents();
  const located = incidents
    .filter((i) => i.location?.address)
    .slice(0, 10);

  return (
    <div>
      <AppHeader title="Incident Map" />
      <div className="px-4 pt-4 space-y-4">
        <div className="bg-surface rounded-2xl border border-gray-100">
          <EmptyState
            icon={Map}
            title="Live map coming soon"
            message="A data-light map of incidents near you is on the way. Nearby reports are listed below."
          />
        </div>
        {located.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-ink">
              Reported Locations
            </h2>
            {located.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
