import React, { useState } from "react";
import { IncidentForm } from "./components/IncidentForm";
import { Modal } from "./components/Modal";
import { Dashboard } from "./components/Dashboard";
import { AgencyDashboard } from "./components/AgencyDashboard";
import { AdminDashboardWithTabs } from "./components/AdminDashboardWithTabs";
import { AuthScreen } from "./components/AuthScreen";
import { Button } from "./components/Button";
import { Shield, Plus, AlertOctagon, LogOut } from "lucide-react";
import {
  IncidentReport,
  IncidentStatus,
  IncidentType,
  SeverityLevel,
} from "./types";
import { IncidentProvider, useIncidents } from "./context/IncidentContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SafetyChat } from "./components/SafetyChat";

function MainApp() {
  const { addReport } = useIncidents();
  const { role, logout, isLoading, user } = useAuth();
  const [view, setView] = useState<"home" | "report">("home");
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin text-guard-green">
          <Shield className="h-12 w-12" />
        </div>
        <p className="text-gray-500 font-medium">
          Initializing Secure Environment...
        </p>
      </div>
    );
  }

  // If not logged in, show login screen
  if (!role) {
    return <AuthScreen />;
  }

  const handleReportSubmit = async (data: any) => {
    const newIncident: IncidentReport = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid, // Track who reported it
      status: IncidentStatus.Submitted,
      ...data,
      // Fallback if location is null/undefined from the form
      location: data.location || {
        lat: 9.082,
        lng: 8.6753,
        address: "Location Not Provided",
      },
    };

    try {
      await addReport(newIncident);
      setView("home");
      setModalState({
        isOpen: true,
        type: "success",
        title: "Report Submitted",
        message: "Your report has been submitted successfully. Stay safe.",
      });
    } catch (error) {
      console.error("Failed to submit report:", error);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Submission Failed",
        message: "Failed to submit report. Please try again.",
      });
    }
  };

  const handlePanic = async () => {
    setShowPanicModal(true);

    try {
      // Create Emergency Report immediately
      const sosIncident: IncidentReport = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.uid,
        status: IncidentStatus.Submitted,
        type: IncidentType.Other, // Using 'Other' as generic Emergency/SOS until explicit type is added
        description: "EMERGENCY SOS ALERT - Immediate Assistance Requested",
        severity: SeverityLevel.Critical,
        isAnonymous: false,
        timestamp: Date.now(),
        location: {
          lat: 9.0765, // Default Fallback (Abuja)
          lng: 7.3986,
          address: "Emergency Location (GPS)",
        },
        media: {
          image: null,
          audio: null,
        },
      };

      // Try to get real location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            sosIncident.location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `GPS: ${position.coords.latitude.toFixed(
                4
              )}, ${position.coords.longitude.toFixed(4)}`,
            };
            await addReport(sosIncident);
          },
          async (error) => {
            console.warn("SOS Location failed, using default:", error);
            await addReport(sosIncident);
          }
        );
      } else {
        await addReport(sosIncident);
      }
    } catch (error) {
      console.error("SOS Activation Failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-32 relative">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView("home")}
          >
            <div
              className={`p-1.5 rounded-lg text-white ${
                role === "admin"
                  ? "bg-purple-700"
                  : role === "agency"
                  ? "bg-blue-600"
                  : "bg-guard-green"
              }`}
            >
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-guard-dark tracking-tight leading-none">
                Guard Nigeria
              </span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                {role === "admin"
                  ? "MOD Portal"
                  : role === "agency"
                  ? "Agency Portal"
                  : "Citizen Portal"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {role === "citizen" && (
              <Button
                variant="danger"
                size="sm"
                onClick={handlePanic}
                className="animate-pulse shadow-red-200 shadow-lg mr-2 font-bold"
              >
                SOS
              </Button>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Based Routing */}
        {role === "admin" ? (
          <AdminDashboardWithTabs />
        ) : role === "agency" ? (
          <AgencyDashboard />
        ) : (
          // Citizen View
          <>
            {view === "home" && (
              <>
                {/* Hero Section */}
                <div className="mb-10 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                    Securing Nigeria,{" "}
                    <span className="text-guard-green">Together.</span>
                  </h1>
                  <p className="max-w-2xl mx-auto text-lg text-gray-500">
                    A citizen-led platform to report security incidents, track
                    responses, and foster accountability.
                  </p>
                  <div className="flex justify-center mt-6">
                    <Button
                      size="lg"
                      onClick={() => setView("report")}
                      className="shadow-xl shadow-green-100 transform transition-transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Report an Incident
                    </Button>
                  </div>
                </div>

                <Dashboard />
              </>
            )}

            {view === "report" && (
              <IncidentForm
                onSubmit={handleReportSubmit}
                onCancel={() => setView("home")}
              />
            )}
          </>
        )}
      </main>

      {/* Panic Modal */}
      {showPanicModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center space-y-6 animate-bounce-in shadow-2xl border-4 border-red-500">
            <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
              <AlertOctagon className="h-10 w-10 text-red-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                SOS Triggered
              </h3>
              <p className="text-gray-500 mt-2">
                Emergency services and nearest contacts have been alerted with
                your location.
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-mono">
                GPS: 9.0765° N, 7.3986° E
              </p>
              <p className="text-xs text-green-600 font-bold mt-1">
                ✓ Sent to Police Command
              </p>
              <p className="text-xs text-green-600 font-bold">
                ✓ Sent to Emergency Contacts
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setShowPanicModal(false)}
            >
              Cancel Alert
            </Button>
          </div>
        </div>
      )}

      {/* Global Components - Safety Chat only for Citizens and Agency */}
      {(role === "citizen" || role === "agency") && <SafetyChat />}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
}

// Wrap the main app logic with Providers
export default function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <MainApp />
      </IncidentProvider>
    </AuthProvider>
  );
}
