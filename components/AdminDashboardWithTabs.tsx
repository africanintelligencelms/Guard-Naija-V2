import React, { useState } from "react";
import { AdminDashboard as AdminOverview } from "./AdminDashboard";
import { UserManagement } from "./UserManagement";
import { AgencyManagement } from "./AgencyManagement";
import { LayoutDashboard, Users, Building } from "lucide-react";

type AdminTab = "overview" | "users" | "agencies";

export const AdminDashboardWithTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-guard-green text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "users"
                ? "bg-guard-green text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </button>
          <button
            onClick={() => setActiveTab("agencies")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "agencies"
                ? "bg-guard-green text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Building className="h-4 w-4" />
            <span className="hidden md:inline">Agencies</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <AdminOverview />}
      {activeTab === "users" && <UserManagement />}
      {activeTab === "agencies" && <AgencyManagement />}
    </div>
  );
};
