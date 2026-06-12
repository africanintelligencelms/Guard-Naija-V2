import React from "react";
import { LogOut, Shield } from "lucide-react";
import { AdminDashboardWithTabs } from "../../components/AdminDashboardWithTabs";
import { OfflineBanner } from "../../components/ui/OfflineBanner";
import { useAuth } from "../../context/AuthContext";

// Desktop-style admin tooling, lazy-loaded so citizens never download it.
// Rebuilt to the mobile designs in Phase 4.
export const AdminArea: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <header className="bg-surface border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg text-white bg-purple-700">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-ink">GuardNG</span>
              <span className="text-[10px] text-ink-secondary uppercase font-semibold tracking-wider">
                MOD Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-gray-100 active:bg-gray-200 text-ink-secondary"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <AdminDashboardWithTabs />
      </main>
    </div>
  );
};

export default AdminArea;
