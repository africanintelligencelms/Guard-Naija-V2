import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertOctagon,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useIncidents } from "../../context/IncidentContext";
import { StatCard } from "../../components/ui/StatCard";
import { IncidentCard } from "../../components/ui/IncidentCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { useSosAlert } from "../../hooks/useSosAlert";
import { initials } from "../../lib/format";

export const Home: React.FC = () => {
  const { userProfile } = useAuth();
  const { incidents, stats } = useIncidents();
  const { triggerSos, sosModal } = useSosAlert();
  const navigate = useNavigate();

  const firstName = userProfile?.displayName?.split(" ")[0];
  const recent = incidents.slice(0, 5);

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center">
          {initials(userProfile?.displayName || userProfile?.email)}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-ink-secondary">Welcome back,</p>
          <h1 className="text-xl font-bold text-ink truncate">
            {firstName || "Citizen"}
          </h1>
        </div>
      </div>

      {/* Emergency CTA */}
      <button
        type="button"
        onClick={triggerSos}
        className="w-full bg-danger active:bg-red-700 text-white rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left"
      >
        <div className="bg-white/20 rounded-xl p-2.5 shrink-0">
          <AlertOctagon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Report Emergency</p>
          <p className="text-xs text-red-100">
            Send SOS with your location instantly
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0" />
      </button>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={ShieldAlert}
          label="Critical"
          value={stats.critical}
          tint="danger"
        />
        <StatCard
          icon={Activity}
          label="Active"
          value={stats.active}
          tint="info"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved"
          value={stats.resolved}
          tint="primary"
        />
      </div>

      {/* Recent reports */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-base font-semibold text-ink">Recent Reports</h2>
        {recent.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/reports")}
            className="text-sm font-semibold text-primary active:text-primary-dark px-2 py-1"
          >
            See all
          </button>
        )}
      </div>
      {recent.length > 0 ? (
        <div className="space-y-3">
          {recent.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-gray-100">
          <EmptyState
            icon={ShieldAlert}
            title="No reports yet"
            message="When you report an incident it will show up here."
          />
        </div>
      )}

      {/* Safety tip */}
      <div className="bg-primary-light rounded-2xl p-4 flex items-start gap-3">
        <div className="bg-surface rounded-xl p-2 text-primary shrink-0">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-dark">Safety Tip</p>
          <p className="text-xs text-ink-secondary mt-0.5">
            Share your live location with a trusted contact when travelling at
            night, and save 112 for emergencies.
          </p>
        </div>
      </div>

      {sosModal}
    </div>
  );
};

export default Home;
