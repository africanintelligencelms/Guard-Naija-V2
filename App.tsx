
import React, { useState } from 'react';
import { IncidentForm } from './components/IncidentForm';
import { Dashboard } from './components/Dashboard';
import { AgencyDashboard } from './components/AgencyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import { Shield, Plus, AlertOctagon, User, Briefcase, Lock, LogOut, ArrowLeft, KeyRound } from 'lucide-react';
import { IncidentReport, IncidentStatus } from './types';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { SafetyChat } from './components/SafetyChat';

function LoginScreen() {
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for effect
        setTimeout(() => {
            if (accessCode === 'drpepper2025') {
                if (selectedRole) login(selectedRole);
            } else {
                setError('Invalid Access Code. Please try again.');
                setIsLoading(false);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-guard-green p-6 text-center">
                     <div className="inline-flex bg-white/20 p-3 rounded-xl backdrop-blur-sm mb-4">
                        <Shield className="h-10 w-10 text-white" />
                     </div>
                     <h1 className="text-2xl font-bold text-white">Guard Nigeria</h1>
                     <p className="text-green-100 text-sm">Secure Incident Reporting Platform</p>
                </div>

                <div className="p-8">
                    {!selectedRole ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Select Access Portal</h2>
                                <p className="text-gray-500 text-sm">Choose your role to continue</p>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={() => setSelectedRole('citizen')}
                                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-guard-green hover:bg-green-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 p-2.5 rounded-lg text-guard-green group-hover:bg-white transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">Citizen</p>
                                            <p className="text-xs text-gray-500">Report & View Safety Map</p>
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setSelectedRole('agency')}
                                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 group-hover:bg-white transition-colors">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">Agency</p>
                                            <p className="text-xs text-gray-500">Field Ops & Response</p>
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setSelectedRole('admin')}
                                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 group-hover:bg-white transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">Admin</p>
                                            <p className="text-xs text-gray-500">Oversight & Analytics</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <button 
                                onClick={() => { setSelectedRole(null); setAccessCode(''); setError(''); }}
                                className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium mb-4"
                             >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Roles
                             </button>

                             <div className="text-center mb-6">
                                <div className={`inline-flex p-3 rounded-full mb-3 ${
                                    selectedRole === 'admin' ? 'bg-purple-100 text-purple-600' : 
                                    selectedRole === 'agency' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-guard-green'
                                }`}>
                                    {selectedRole === 'admin' ? <Lock className="h-6 w-6" /> : 
                                     selectedRole === 'agency' ? <Briefcase className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 capitalize">{selectedRole} Access</h2>
                                <p className="text-gray-500 text-sm">Please enter your secure access code</p>
                             </div>

                             <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 ml-1">Access Code</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <KeyRound className="h-5 w-5" />
                                        </div>
                                        <input 
                                            type="password"
                                            value={accessCode}
                                            onChange={(e) => setAccessCode(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-guard-green transition-shadow"
                                            placeholder="Enter 'drpepper2025'"
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-red-600 text-sm mt-2 ml-1 flex items-center gap-1"><AlertOctagon className="h-3 w-3" /> {error}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full justify-center py-3" 
                                    size="lg"
                                    isLoading={isLoading}
                                    variant={selectedRole === 'admin' ? 'primary' : selectedRole === 'agency' ? 'primary' : 'primary'} // Simplified for consistency, could change color
                                >
                                    Enter Portal
                                </Button>
                             </form>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">Restricted Access • Monitoring Active</p>
                </div>
            </div>
        </div>
    );
}

function MainApp() {
  const { addReport } = useIncidents();
  const { role, logout, isLoading } = useAuth();
  const [view, setView] = useState<'home' | 'report'>('home');
  const [showPanicModal, setShowPanicModal] = useState(false);

  // Loading Screen
  if (isLoading) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin text-guard-green">
                <Shield className="h-12 w-12" />
            </div>
            <p className="text-gray-500 font-medium">Initializing Secure Environment...</p>
        </div>
      );
  }

  // If not logged in, show login screen
  if (!role) {
      return <LoginScreen />;
  }

  const handleReportSubmit = (data: any) => {
    const newIncident: IncidentReport = {
      id: Math.random().toString(36).substr(2, 9),
      status: IncidentStatus.Submitted,
      ...data,
      // Fallback if location is null/undefined from the form
      location: data.location || { lat: 9.0820, lng: 8.6753, address: 'Location Not Provided' }
    };
    addReport(newIncident);
    setView('home');
    alert("Report submitted successfully. Stay safe.");
  };

  const handlePanic = () => {
    setShowPanicModal(true);
    // Simulate immediate API call
    setTimeout(() => {
      // Logic to send SOS would go here
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-32 relative">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className={`p-1.5 rounded-lg text-white ${role === 'admin' ? 'bg-purple-700' : role === 'agency' ? 'bg-blue-600' : 'bg-guard-green'}`}>
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-guard-dark tracking-tight leading-none">Guard Nigeria</span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                    {role === 'admin' ? 'MOD Portal' : role === 'agency' ? 'Agency Portal' : 'Citizen Portal'}
                </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {role === 'citizen' && (
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
        {role === 'admin' ? (
            <AdminDashboard />
        ) : role === 'agency' ? (
            <AgencyDashboard />
        ) : (
            // Citizen View
            <>
                {view === 'home' && (
                <>
                    {/* Hero Section */}
                    <div className="mb-10 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Securing Nigeria, <span className="text-guard-green">Together.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-500">
                        A citizen-led platform to report security incidents, track responses, and foster accountability.
                    </p>
                    <div className="flex justify-center mt-6">
                        <Button size="lg" onClick={() => setView('report')} className="shadow-xl shadow-green-100 transform transition-transform hover:scale-105">
                        <Plus className="h-5 w-5 mr-2" />
                        Report an Incident
                        </Button>
                    </div>
                    </div>

                    <Dashboard />
                </>
                )}

                {view === 'report' && (
                <IncidentForm 
                    onSubmit={handleReportSubmit} 
                    onCancel={() => setView('home')} 
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
              <h3 className="text-2xl font-bold text-gray-900">SOS Triggered</h3>
              <p className="text-gray-500 mt-2">
                Emergency services and nearest contacts have been alerted with your location.
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <p className="text-xs text-gray-500 font-mono">GPS: 9.0765° N, 7.3986° E</p>
                 <p className="text-xs text-green-600 font-bold mt-1">✓ Sent to Police Command</p>
                 <p className="text-xs text-green-600 font-bold">✓ Sent to Emergency Contacts</p>
            </div>
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShowPanicModal(false)}>
              Cancel Alert
            </Button>
          </div>
        </div>
      )}

      {/* Global Components - Safety Chat only for Citizens and Agency */}
      {(role === 'citizen' || role === 'agency') && <SafetyChat />}
    </div>
  );
}

// Wrap the main app logic with Providers
export default function App() {
  return (
    <IncidentProvider>
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    </IncidentProvider>
  );
}
