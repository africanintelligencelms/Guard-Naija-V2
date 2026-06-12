import React, { useState, useCallback } from "react";
import { AlertOctagon, PhoneCall } from "lucide-react";
import {
  IncidentReport,
  IncidentStatus,
  IncidentType,
  SeverityLevel,
} from "../types";
import { useIncidents } from "../context/IncidentContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

/**
 * Shared SOS flow: files a Critical incident with the best available GPS fix
 * and shows a confirmation sheet with a no-data fallback (dial 112).
 */
export function useSosAlert() {
  const { addReport } = useIncidents();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const triggerSos = useCallback(() => {
    setOpen(true);

    const sosIncident: IncidentReport = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid,
      status: IncidentStatus.Submitted,
      type: IncidentType.Other,
      description: "EMERGENCY SOS ALERT - Immediate Assistance Requested",
      severity: SeverityLevel.Critical,
      isAnonymous: false,
      timestamp: Date.now(),
      location: {
        lat: 9.0765, // Abuja fallback until GPS resolves
        lng: 7.3986,
        address: "Emergency Location (GPS)",
      },
      media: { image: null, audio: null },
    };

    const submit = () =>
      addReport(sosIncident).catch((error) =>
        console.error("SOS Activation Failed:", error)
      );

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sosIncident.location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          };
          submit();
        },
        () => submit(),
        { timeout: 8000 }
      );
    } else {
      submit();
    }
  }, [addReport, user]);

  const sosModal = open ? (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-surface rounded-2xl max-w-sm w-full p-6 text-center space-y-5 animate-bounce-in border-4 border-danger">
        <div className="mx-auto bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center">
          <AlertOctagon className="h-10 w-10 text-danger" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-ink">SOS Triggered</h3>
          <p className="text-sm text-ink-secondary mt-1.5">
            Your location is being shared with responders. If you have no
            network, call 112 directly.
          </p>
        </div>
        <a
          href="tel:112"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-danger active:bg-red-700 text-white font-semibold"
        >
          <PhoneCall className="h-5 w-5" />
          Call 112 Now
        </a>
        <Button
          variant="outline"
          className="w-full border-red-200 text-danger hover:bg-red-50"
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
      </div>
    </div>
  ) : null;

  return { triggerSos, sosModal };
}
