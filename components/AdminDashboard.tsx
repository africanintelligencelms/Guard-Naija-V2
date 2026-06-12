import React, { useEffect, useState } from "react";
import { useIncidents } from "../context/IncidentContext";
import { IncidentMap } from "./IncidentMap";
import { UserManagement } from "./UserManagement";
import { AgencyManagement } from "./AgencyManagement";
import { fetchLiveSecurityNews } from "../services/aiService";
import { api } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Eye,
  Download,
  Clock,
  Lock,
  Globe,
  ExternalLink,
  Search,
  ChevronDown,
  RefreshCw,
  Building,
  LayoutDashboard,
  X,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  IncidentStatus,
  SeverityLevel,
  SecurityNewsItem,
  LogEntry,
  IncidentReport,
} from "../types";
import { subscribeToLogs } from "../services/logService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS = {
  [IncidentStatus.Submitted]: "#94a3b8",
  [IncidentStatus.Verified]: "#3b82f6",
  [IncidentStatus.InProgress]: "#eab308",
  [IncidentStatus.Resolved]: "#22c55e",
};

type AdminTab = "overview" | "users" | "agencies";

export const AdminDashboard: React.FC = () => {
  const { incidents, stats } = useIncidents();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [newsFeed, setNewsFeed] = useState<SecurityNewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAgencies, setActiveAgencies] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReport | null>(null);

  // Subscribe to Real Logs
  useEffect(() => {
    // Determine limit based on view mode (only fetch more if viewing all, though standard subscription is fine)
    // For now, let's subscribe to latest 50 logs always, and just show 5 in the dashboard
    const unsubscribe = subscribeToLogs((fetchedLogs) => {
      setLogs(fetchedLogs);
    }, 50);

    return () => unsubscribe();
  }, []);

  // Fetch active agencies count (polled)
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const stats = await api.get<{ activeAgencies: number }>("/users/stats");
        if (active) setActiveAgencies(stats.activeAgencies);
      } catch {
        // offline — keep last value
      }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch Live News on Mount
  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await fetchLiveSecurityNews();
        setNewsFeed(news);
      } catch (error) {
        console.error("Failed to load news", error);
      } finally {
        setIsLoadingNews(false);
      }
    };
    loadNews();
  }, []);

  // Data for Charts
  const typeCount = incidents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const typeData = Object.entries(typeCount).map(([name, value]) => ({
    name,
    value,
  }));

  const statusCount = incidents.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const statusData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Trend Data (Mock timeline based on timestamps + accumulation)
  const sortedIncidents = [...incidents].sort(
    (a, b) => a.timestamp - b.timestamp
  );
  // Generate last 10 points or map real data if enough exists
  const trendData = sortedIncidents
    .map((inc, i) => ({
      time: new Date(inc.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      total: i + 1,
      critical: sortedIncidents
        .slice(0, i + 1)
        .filter((x) => x.severity === SeverityLevel.Critical).length,
    }))
    .slice(-15); // Show last 15 data points

  // Filter for Data Table
  const filteredIncidents = incidents.filter(
    (inc) =>
      (inc.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (inc.type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (inc.location?.address?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          National Security Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Critical Threats
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.critical}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Resolution Rate
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.total > 0
                  ? Math.round((stats.resolved / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Units</p>
              <p className="text-3xl font-bold text-purple-600">
                {activeAgencies}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              Incident Trend Analysis
            </h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-500">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008751" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#008751" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorCritical"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#008751"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="All Incidents"
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stroke="#DC2626"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCritical)"
                  name="Critical"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Case Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[entry.name as IncidentStatus] ||
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Intelligence & Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Media Intelligence */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">
                Live Media Intelligence
              </h3>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Powered by Gemini
            </span>
          </div>

          <div className="overflow-y-auto p-4 space-y-4 flex-1">
            {isLoadingNews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : newsFeed.length > 0 ? (
              newsFeed.map((item) => (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={item.id}
                  className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-2 mb-1">
                      {item.headline}
                    </h4>
                    <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0 mt-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    <span className="font-medium text-gray-500">
                      {item.source}
                    </span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                Unable to fetch live news at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Heatmap/Map View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">
              Geospatial Threat Heatmap
            </h3>
            <div className="flex gap-2">
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <IncidentMap incidents={incidents} />
          </div>
        </div>
      </div>

      {/* Full Database Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900">
            Full Incident Database
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search database..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-guard-green focus:border-guard-green"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncidents.slice(0, 10).map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    #{incident.id.substring(0, 6)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {incident.type}
                  </td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                    {incident.location?.address}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        incident.severity === SeverityLevel.Critical
                          ? "bg-red-100 text-red-700"
                          : incident.severity === SeverityLevel.High
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        incident.status === IncidentStatus.Resolved
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(incident.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredIncidents.length === 0 && (
          <div className="p-8 text-center text-gray-500">No records found.</div>
        )}
      </div>

      {/* Audit Trail Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            System Audit Log
          </h3>
          <button
            onClick={() => setShowAllLogs(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full Log
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No recent activity recorded.
            </div>
          ) : (
            logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      log.type === "security"
                        ? "bg-red-50 text-red-600"
                        : log.type === "edit"
                        ? "bg-orange-50 text-orange-600"
                        : log.type === "system"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {log.type === "security" ? (
                      <Shield className="h-4 w-4" />
                    ) : log.type === "edit" ? (
                      <RefreshCw className="h-4 w-4" />
                    ) : log.type === "system" ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500">{log.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">
                    {log.role}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Full Log Modal */}
      {showAllLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Full System Audit Log
              </h3>
              <button
                onClick={() => setShowAllLogs(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No logs found.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            log.type === "security"
                              ? "bg-red-50 text-red-600"
                              : log.type === "edit"
                              ? "bg-orange-50 text-orange-600"
                              : log.type === "system"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {log.type === "security" ? (
                            <Shield className="h-4 w-4" />
                          ) : log.type === "edit" ? (
                            <RefreshCw className="h-4 w-4" />
                          ) : log.type === "system" ? (
                            <Download className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.action}
                          </p>
                          <p className="text-sm text-gray-500">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {log.role}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Incident Details
                </h3>
                <p className="text-sm text-gray-500 font-mono">
                  ID: #{selectedIncident.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="Close"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedIncident.severity === SeverityLevel.Critical
                        ? "bg-red-100 text-red-700"
                        : selectedIncident.severity === SeverityLevel.High
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedIncident.severity} Severity
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      selectedIncident.status === IncidentStatus.Resolved
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {selectedIncident.status}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Meta Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedIncident.location?.address ||
                          "Coordinates only"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedIncident.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedIncident.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reported By</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedIncident.isAnonymous
                          ? "Anonymous Citizen"
                          : selectedIncident.userId || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Media (if available) */}
                {selectedIncident.media?.image && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Evidence / Media
                    </h4>
                    <img
                      src={selectedIncident.media.image}
                      alt="Incident Evidence"
                      className="rounded-lg w-full h-64 object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors text-sm font-medium"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
