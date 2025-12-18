import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";
import {
  Shield,
  User,
  Briefcase,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  AlertOctagon,
  ArrowLeft,
} from "lucide-react";
import { UserRole } from "../types";

type AuthMode =
  | "select"
  | "citizen-login"
  | "citizen-signup"
  | "agency-login"
  | "agency-signup"
  | "admin-login";

export const AuthScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("select");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyLocation, setAgencyLocation] = useState("");
  const [agencyType, setAgencyType] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setPhoneNumber("");
    setAgencyName("");
    setAgencyLocation("");
    setAgencyType("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password, role);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const additionalData: any = { displayName, phoneNumber };

      if (role === "agency") {
        additionalData.agencyName = agencyName;
        additionalData.agencyLocation = agencyLocation;
        additionalData.agencyType = agencyType;
      }

      await signup(email, password, role, additionalData);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setMode("select");
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className={`${
            mode === "admin-login"
              ? "bg-purple-700"
              : mode === "agency-login" || mode === "agency-signup"
              ? "bg-blue-600"
              : "bg-guard-green"
          } p-6 text-center transition-colors duration-300`}
        >
          <div className="inline-flex bg-white/20 p-3 rounded-xl backdrop-blur-sm mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Guard Nigeria</h1>
          <p className="text-white/80 text-sm">
            Secure Incident Reporting Platform
          </p>
        </div>

        <div className="p-8">
          {/* Role Selection */}
          {mode === "select" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Select Access Portal
                </h2>
                <p className="text-gray-500 text-sm">
                  Choose your role to continue
                </p>
              </div>

              <div className="space-y-3">
                {/* Citizen Portal */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-green-100 p-2.5 rounded-lg text-guard-green">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Citizen</p>
                      <p className="text-xs text-gray-500">
                        Report & View Safety Map
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("citizen-login")}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setMode("citizen-signup")}
                      className="flex-1 px-4 py-2 bg-guard-green text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Agency Portal */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Agency</p>
                      <p className="text-xs text-gray-500">
                        Field Ops & Response
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("agency-login")}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setMode("agency-signup")}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Admin Portal */}
                <button
                  onClick={() => setMode("admin-login")}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 group-hover:bg-white transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Admin</p>
                      <p className="text-xs text-gray-500">
                        Oversight & Analytics
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Citizen Login */}
          {mode === "citizen-login" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={goBack}
                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full mb-3 bg-green-100 text-guard-green">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Citizen Login
                </h2>
                <p className="text-gray-500 text-sm">Access your account</p>
              </div>

              <form
                onSubmit={(e) => handleLogin(e, "citizen")}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center py-3"
                  size="lg"
                  isLoading={isLoading}
                >
                  Login
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("citizen-signup")}
                    className="text-guard-green font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Citizen Signup */}
          {mode === "citizen-signup" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={goBack}
                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full mb-3 bg-green-100 text-guard-green">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Citizen Sign Up
                </h2>
                <p className="text-gray-500 text-sm">Create your account</p>
              </div>

              <form
                onSubmit={(e) => handleSignup(e, "citizen")}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    At least 6 characters
                  </p>
                </div>

                {error && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center py-3"
                  size="lg"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("citizen-login")}
                    className="text-guard-green font-medium hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Agency Login */}
          {mode === "agency-login" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={goBack}
                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full mb-3 bg-blue-100 text-blue-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Agency Login
                </h2>
                <p className="text-gray-500 text-sm">
                  Access your agency portal
                </p>
              </div>

              <form
                onSubmit={(e) => handleLogin(e, "agency")}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="agency@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center py-3"
                  variant="blue"
                  size="lg"
                  isLoading={isLoading}
                >
                  Login
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("agency-signup")}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Agency Signup */}
          {mode === "agency-signup" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[600px] overflow-y-auto pr-2">
              <button
                onClick={goBack}
                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium sticky top-0 bg-white z-10 pb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full mb-3 bg-blue-100 text-blue-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Agency Sign Up
                </h2>
                <p className="text-gray-500 text-sm">Register your agency</p>
              </div>

              <form
                onSubmit={(e) => handleSignup(e, "agency")}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Agency Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="Lagos State Police Command"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Agency Type
                  </label>
                  <select
                    value={agencyType}
                    onChange={(e) => setAgencyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Police">Police</option>
                    <option value="Fire Service">Fire Service</option>
                    <option value="Emergency Response">
                      Emergency Response
                    </option>
                    <option value="Security Agency">Security Agency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={agencyLocation}
                      onChange={(e) => setAgencyLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="Lagos, Nigeria"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="agency@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    At least 6 characters
                  </p>
                </div>

                {error && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center py-3"
                  variant="blue"
                  size="lg"
                  isLoading={isLoading}
                >
                  Create Agency Account
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("agency-login")}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Admin Login */}
          {mode === "admin-login" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={goBack}
                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-full mb-3 bg-purple-100 text-purple-600">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Admin Access
                </h2>
                <p className="text-gray-500 text-sm">Restricted access only</p>
              </div>

              <form
                onSubmit={(e) => handleLogin(e, "admin")}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                      placeholder="admin@guardnigeria.gov"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center py-3 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  isLoading={isLoading}
                >
                  Admin Login
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Restricted Access • Monitoring Active
          </p>
        </div>
      </div>
    </div>
  );
};
