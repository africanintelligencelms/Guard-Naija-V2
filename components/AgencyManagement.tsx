import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { UserProfile } from "../types";
import {
  Building,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
  Phone,
  Mail,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./Button";

export const AgencyManagement: React.FC = () => {
  const [agencies, setAgencies] = useState<UserProfile[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [editingAgency, setEditingAgency] = useState<UserProfile | null>(null);

  // Fetch agencies from the API (refreshed after each mutation)
  const loadAgencies = useCallback(async () => {
    try {
      const agencyList = await api.get<UserProfile[]>("/users?role=agency");
      setAgencies(agencyList);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    }
  }, []);

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  // Filter agencies
  useEffect(() => {
    let filtered = agencies;

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((a) => a.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((a) => !a.isActive);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.agencyLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgencies(filtered);
  }, [agencies, statusFilter, searchTerm]);

  const handleToggleStatus = async (agency: UserProfile) => {
    try {
      await api.patch(`/users/${agency.uid}`, { isActive: !agency.isActive });
      await loadAgencies();
    } catch (error) {
      console.error("Error toggling agency status:", error);
      alert("Failed to update agency status");
    }
  };

  const getAgencyTypeColor = (type?: string) => {
    switch (type) {
      case "Police":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Fire Service":
        return "bg-red-100 text-red-700 border-red-200";
      case "Emergency Response":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Security Agency":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="h-6 w-6 text-gray-400" />
          Agency Management
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor and manage registered agencies
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Agencies</p>
          <p className="text-2xl font-bold text-gray-900">{agencies.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {agencies.filter((a) => a.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {agencies.filter((a) => !a.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Police Units</p>
          <p className="text-2xl font-bold text-blue-600">
            {agencies.filter((a) => a.agencyType === "Police").length}
          </p>
        </div>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <div
            key={agency.uid}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {agency.agencyName}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getAgencyTypeColor(
                    agency.agencyType
                  )}`}
                >
                  {agency.agencyType || "Other"}
                </span>
              </div>
              <button
                onClick={() => handleToggleStatus(agency)}
                className={`p-2 rounded-lg transition-colors ${
                  agency.isActive
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
                title={agency.isActive ? "Deactivate" : "Activate"}
              >
                {agency.isActive ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{agency.agencyLocation || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="truncate">{agency.email}</span>
              </div>
              {agency.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{agency.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Contact Person */}
            {agency.displayName && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                <p className="text-sm font-medium text-gray-900">
                  {agency.displayName}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Joined {new Date(agency.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={() => setEditingAgency(agency)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mt-3">
              {agency.isActive ? (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Active & Operational</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>Inactive</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAgencies.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No agencies found</p>
        </div>
      )}

      {/* Edit Agency Modal */}
      {editingAgency && (
        <AgencyEditModal
          agency={editingAgency}
          onClose={() => {
            setEditingAgency(null);
            loadAgencies();
          }}
        />
      )}
    </div>
  );
};

// Agency Edit Modal
const AgencyEditModal: React.FC<{
  agency: UserProfile;
  onClose: () => void;
}> = ({ agency, onClose }) => {
  const [formData, setFormData] = useState({
    agencyName: agency.agencyName || "",
    agencyType: agency.agencyType || "",
    agencyLocation: agency.agencyLocation || "",
    displayName: agency.displayName || "",
    phoneNumber: agency.phoneNumber || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.patch(`/users/${agency.uid}`, formData);
      alert("Agency updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating agency:", error);
      alert("Failed to update agency");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit Agency</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              value={formData.agencyName}
              onChange={(e) =>
                setFormData({ ...formData, agencyName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Type
            </label>
            <select
              value={formData.agencyType}
              onChange={(e) =>
                setFormData({ ...formData, agencyType: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
              required
            >
              <option value="">Select Type</option>
              <option value="Police">Police</option>
              <option value="Fire Service">Fire Service</option>
              <option value="Emergency Response">Emergency Response</option>
              <option value="Security Agency">Security Agency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.agencyLocation}
              onChange={(e) =>
                setFormData({ ...formData, agencyLocation: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Update Agency
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
