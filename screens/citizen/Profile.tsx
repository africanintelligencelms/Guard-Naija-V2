import React from "react";
import { LogOut, PhoneCall, ShieldCheck, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/ui/AppHeader";
import { ListTile } from "../../components/ui/ListTile";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { initials } from "../../lib/format";

export const Profile: React.FC = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div>
      <AppHeader title="Profile" />
      <div className="px-4 pt-4 space-y-4">
        {/* Identity card */}
        <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 rounded-full bg-primary-light text-primary text-xl font-bold flex items-center justify-center">
            {initials(userProfile?.displayName || userProfile?.email)}
          </div>
          <div>
            <p className="text-base font-semibold text-ink">
              {userProfile?.displayName || "Citizen"}
            </p>
            <p className="text-xs text-ink-secondary">{userProfile?.email}</p>
          </div>
          <StatusBadge label="Citizen Account" tone="success" />
        </div>

        {/* Settings list */}
        <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          <ListTile
            icon={UserCog}
            title="Edit Profile"
            subtitle="Name, phone number"
            onClick={() => {}}
          />
          <ListTile
            icon={PhoneCall}
            title="Emergency Contacts"
            subtitle="Coming soon"
            onClick={() => {}}
          />
          <ListTile
            icon={ShieldCheck}
            title="How Reporting Works"
            subtitle="Your identity stays protected"
            onClick={() => {}}
          />
        </div>

        <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <ListTile
            icon={LogOut}
            title="Log Out"
            danger
            onClick={() => logout()}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
