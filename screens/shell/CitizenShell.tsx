import React, { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "../../components/ui/BottomNav";
import { OfflineBanner } from "../../components/ui/OfflineBanner";

// Chat bundles the Gemini client — keep it out of the entry chunk
const SafetyChat = lazy(() =>
  import("../../components/SafetyChat").then((m) => ({
    default: m.SafetyChat,
  }))
);

export const CitizenShell: React.FC = () => (
  <div className="min-h-screen bg-background">
    <OfflineBanner />
    <div className="max-w-md mx-auto pb-24">
      <Outlet />
    </div>
    <BottomNav />
    <Suspense fallback={null}>
      <SafetyChat />
    </Suspense>
  </div>
);
