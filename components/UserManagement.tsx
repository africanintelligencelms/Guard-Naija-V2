import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { UserProfile, UserRole } from "../types";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "./Button";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from the API (refreshed after each mutation)
  const loadUsers = useCallback(async () => {
    try {
      const userList = await api.get<UserProfile[]>("/users");
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.agencyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, searchTerm]);

  const handleToggleActive = async (user: UserProfile) => {
    try {
      await api.patch(`/users/${user.uid}`, { isActive: !user.isActive });
      await loadUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (
      !confirm(
        `Are you sure you want to delete ${user.email}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.del(`/users/${user.uid}`);
      await loadUsers();
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "agency":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "citizen":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-400" />
            User Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage all platform users
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as UserRole | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="agency">Agencies</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Citizens</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.role === "citizen").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Agencies</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === "agency").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.displayName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.agencyName && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {user.agencyName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {user.phoneNumber && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phoneNumber}
                        </p>
                      )}
                      {user.agencyLocation && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.agencyLocation}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal: React.FC<{
  user: UserProfile | null;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    displayName: user?.displayName || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || ("citizen" as UserRole),
    password: "",
    agencyName: user?.agencyName || "",
    agencyLocation: user?.agencyLocation || "",
    agencyType: user?.agencyType || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const agencyFields =
        formData.role === "agency"
          ? {
              agencyName: formData.agencyName,
              agencyLocation: formData.agencyLocation,
              agencyType: formData.agencyType,
            }
          : {};

      if (user) {
        // Update existing user
        await api.patch(`/users/${user.uid}`, {
          displayName: formData.displayName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          ...agencyFields,
        });
        alert("User updated successfully");
      } else {
        // Create new user (admin endpoint — no more side-effect of being
        // signed in as the newly created user, unlike the old Firebase flow)
        await api.post("/users", {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          displayName: formData.displayName,
          phoneNumber: formData.phoneNumber,
          ...agencyFields,
        });
        alert("User created successfully");
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-900">
            {user ? "Edit User" : "Add New User"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
              required
              disabled={!!user}
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                required
                minLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
              required
            >
              <option value="citizen">Citizen</option>
              <option value="agency">Agency</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === "agency" && (
            <>
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
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

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
              {user ? "Update" : "Create"} User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
