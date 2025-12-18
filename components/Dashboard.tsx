import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useIncidents } from "../context/IncidentContext";
import { useAuth } from "../context/AuthContext";
import { IncidentMap } from "./IncidentMap";
import {
  Activity,
  ShieldAlert,
  CheckCircle,
  MapPin,
  Radio,
} from "lucide-react";
import { IncidentType } from "../types";
import { INCIDENT_CATEGORIES } from "../constants";

export const Dashboard: React.FC = () => {
  const { incidents, stats } = useIncidents();
  const { userProfile } = useAuth();

  // Prepare chart data based on real incidents
  const categoryCounts: Record<string, number> = {};
  INCIDENT_CATEGORIES.forEach((cat) => (categoryCounts[cat.value] = 0));

  incidents.forEach((inc) => {
    if (categoryCounts[inc.type] !== undefined) {
      categoryCounts[inc.type]++;
    } else {
      categoryCounts[inc.type] = (categoryCounts[inc.type] || 0) + 1;
    }
  });

  const data = INCIDENT_CATEGORIES.map((cat) => ({
    name: cat.label.split(" ")[0],
    count: categoryCounts[cat.value] || 0,
    color: cat.value === IncidentType.Kidnapping ? "#DC2626" : "#008751",
  }));

  const recentIncidents = [...incidents]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Message */}
      {userProfile?.displayName && (
        <div className="bg-gradient-to-r from-guard-green to-green-700 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold">
            Welcome back, {userProfile.displayName}! 👋
          </h2>
          <p className="text-green-100 mt-1">
            Stay informed about security incidents in your area
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-red-50 rounded-full text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Critical Reports
            </p>
            <p className="text-3xl font-bold text-gray-900">{stats.critical}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Active Incidents
            </p>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Resolved</p>
            <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Live Incident Map
            </h3>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <div className="flex-1 min-h-[400px]">
            <IncidentMap incidents={incidents} />
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Reports by Category
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* My Reports Section - Only visible if user has reports */}
      {incidents.filter((inc) => inc.userId === userProfile?.uid).length >
        0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50">
            <h3 className="text-lg font-bold text-gray-900">My Reports</h3>
            <span className="text-xs bg-white text-green-700 font-medium px-2 py-1 rounded-full border border-green-200">
              Private
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {incidents
              .filter((inc) => inc.userId === userProfile?.uid)
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((incident) => (
                <div
                  key={incident.id}
                  className="p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          incident.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {incident.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {incident.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Community Reports</h3>
          <div className="flex items-center gap-2 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
            <Radio className="h-3 w-3" />
            LIVE FEED
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        incident.type === IncidentType.Kidnapping
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {incident.type}
                    </span>
                    {incident.isAnonymous && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                        Anon
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(incident.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800 font-medium group-hover:text-guard-green transition-colors">
                  {incident.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate max-w-md">
                    {incident.location?.address || "Unknown Location"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <ShieldAlert className="h-6 w-6 text-gray-400" />
              </div>
              <p>No recent incidents reported in your area.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
