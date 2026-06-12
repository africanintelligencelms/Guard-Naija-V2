import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IncidentForm } from "../../components/IncidentForm";
import { Modal } from "../../components/Modal";
import { AppHeader } from "../../components/ui/AppHeader";
import { useIncidents } from "../../context/IncidentContext";
import { useAuth } from "../../context/AuthContext";
import { IncidentReport, IncidentStatus } from "../../types";

export const StartReport: React.FC = () => {
  const { addReport } = useIncidents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState(false);

  const handleSubmit = async (data: any) => {
    const newIncident: IncidentReport = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid,
      status: IncidentStatus.Submitted,
      ...data,
      location: data.location || {
        lat: 9.082,
        lng: 8.6753,
        address: "Location Not Provided",
      },
    };

    try {
      await addReport(newIncident);
      navigate("/reports", { replace: true });
    } catch (error) {
      console.error("Failed to submit report:", error);
      setErrorModal(true);
    }
  };

  return (
    <div>
      <AppHeader title="Start Report" showBack />
      <div className="px-4 pt-4">
        <IncidentForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
      </div>
      <Modal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        title="Submission Failed"
        message="Failed to submit report. It will be retried automatically when you're back online."
        type="error"
      />
    </div>
  );
};

export default StartReport;
