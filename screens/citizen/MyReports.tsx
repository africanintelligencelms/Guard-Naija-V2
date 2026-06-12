import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import { useAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/ui/AppHeader";
import { SegmentedTabs } from "../../components/ui/SegmentedTabs";
import { IncidentCard } from "../../components/ui/IncidentCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/Button";
import { IncidentStatus } from "../../types";

const TABS = ["All", "Pending", "Resolved"];

export const MyReports: React.FC = () => {
  const { incidents } = useIncidents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");

  const mine = useMemo(
    () => incidents.filter((i) => i.userId === user?.uid),
    [incidents, user?.uid]
  );

  const visible = useMemo(() => {
    if (tab === "Pending")
      return mine.filter((i) => i.status !== IncidentStatus.Resolved);
    if (tab === "Resolved")
      return mine.filter((i) => i.status === IncidentStatus.Resolved);
    return mine;
  }, [mine, tab]);

  return (
    <div>
      <AppHeader title="My Reports" />
      <div className="px-4 pt-4 space-y-4">
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
        {visible.length > 0 ? (
          <div className="space-y-3">
            {visible.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-gray-100">
            <EmptyState
              icon={FileText}
              title={tab === "All" ? "No reports yet" : `No ${tab.toLowerCase()} reports`}
              message="Reports you submit will appear here with their status."
              action={
                tab === "All" ? (
                  <Button className="w-full" onClick={() => navigate("/report")}>
                    Report an Incident
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
