import React, { useState } from "react";
import { useIncidents } from "../context/IncidentContext";
import { useAuth } from "../context/AuthContext";
import { IncidentStatus, SeverityLevel } from "../types";
import {
  Search,
  MapPin,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

export const AgencyDashboard: React.FC = () => {
  const { incidents, updateIncidentStatus } = useIncidents();
  const { userProfile } = useAuth();
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "All">(
    "All"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIncidents = incidents.filter((incident) => {
    const matchesStatus =
      filterStatus === "All" || incident.status === filterStatus;
    const matchesSearch =
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.Submitted:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case IncidentStatus.Verified:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case IncidentStatus.InProgress:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case IncidentStatus.Resolved:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case SeverityLevel.Critical:
        return "text-red-600 font-bold";
      case SeverityLevel.High:
        return "text-orange-600 font-semibold";
      case SeverityLevel.Medium:
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      {userProfile?.agencyName && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold">
            Welcome, {userProfile.agencyName}! 🚨
          </h2>
          <p className="text-blue-100 mt-1">
            Manage and respond to security incidents
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Agency Command Center
            </h2>
            <p className="text-sm text-gray-500">
              Monitor and manage security incident reports.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-guard-green focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-3 border-b border-gray-100 mb-4 w-full">
          <button
            onClick={() => setFilterStatus("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              filterStatus === "All"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Reports
          </button>
          {Object.values(IncidentStatus).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                filterStatus === status
                  ? "bg-guard-green text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Type / ID</th>
                <th className="px-4 py-3">Location & Time</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-gray-900">
                        {incident.type}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        ID: {incident.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span
                          className="truncate max-w-[200px] block"
                          title={incident.location?.address}
                        >
                          {incident.location?.address || "Unknown Location"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 pl-5">
                        {new Date(incident.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div
                        className={`flex items-center gap-1.5 ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {incident.severity}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="relative inline-block">
                        <select
                          value={incident.status}
                          onChange={async (e) => {
                            try {
                              await updateIncidentStatus(
                                incident.id,
                                e.target.value as IncidentStatus
                              );
                            } catch (error) {
                              console.error("Failed to update status:", error);
                              alert("Failed to update incident status");
                            }
                          }}
                          className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-xs leading-tight focus:outline-none focus:ring-1 focus:ring-guard-green focus:border-guard-green cursor-pointer shadow-sm hover:border-gray-400"
                        >
                          {Object.values(IncidentStatus).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${getSeverityColor(
                        incident.severity
                      )} bg-gray-50 border border-gray-100`}
                    >
                      {incident.severity}
                    </span>
                    <h3 className="font-bold text-gray-900">{incident.type}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(
                      incident.status
                    )}`}
                  >
                    {incident.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 line-clamp-2">
                  {incident.description}
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {incident.location?.address || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{new Date(incident.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 mt-1 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
                    <RefreshCw className="h-3 w-3" />
                    Update Status
                  </label>
                  <div className="relative">
                    <select
                      value={incident.status}
                      onChange={async (e) => {
                        try {
                          await updateIncidentStatus(
                            incident.id,
                            e.target.value as IncidentStatus
                          );
                        } catch (error) {
                          console.error("Failed to update status:", error);
                          alert("Failed to update incident status");
                        }
                      }}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-2.5 pl-3 pr-8 rounded-lg text-sm focus:ring-guard-green focus:border-guard-green focus:bg-white transition-colors"
                    >
                      {Object.values(IncidentStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No reports found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
