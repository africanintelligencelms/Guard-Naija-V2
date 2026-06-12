import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Home, FileText, Plus, Map, User } from "lucide-react";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center gap-0.5 h-full min-w-[44px] ${
    isActive ? "text-primary" : "text-ink-faint"
  }`;

export const BottomNav: React.FC = () => (
  <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
    <div className="max-w-md mx-auto grid grid-cols-5 h-16">
      <NavLink to="/" end className={tabClass}>
        <Home className="h-6 w-6" />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>
      <NavLink to="/reports" className={tabClass}>
        <FileText className="h-6 w-6" />
        <span className="text-[10px] font-medium">Reports</span>
      </NavLink>
      <div className="relative flex justify-center">
        <Link
          to="/report"
          aria-label="Start a report"
          className="absolute -top-5 bg-primary active:bg-primary-dark text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg shadow-green-200"
        >
          <Plus className="h-7 w-7" />
        </Link>
      </div>
      <NavLink to="/map" className={tabClass}>
        <Map className="h-6 w-6" />
        <span className="text-[10px] font-medium">Map</span>
      </NavLink>
      <NavLink to="/profile" className={tabClass}>
        <User className="h-6 w-6" />
        <span className="text-[10px] font-medium">Profile</span>
      </NavLink>
    </div>
  </nav>
);
