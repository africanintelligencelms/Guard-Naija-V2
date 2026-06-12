import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export const AppHeader: React.FC<{
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}> = ({ title, showBack, right }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-gray-100">
      <div className="max-w-md mx-auto h-14 px-2 flex items-center">
        {showBack ? (
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="h-11 w-11 flex items-center justify-center rounded-full active:bg-gray-100 text-ink"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-2" />
        )}
        <h1 className="text-xl font-bold text-ink flex-1 px-1 truncate">
          {title}
        </h1>
        {right && <div className="pr-2">{right}</div>}
      </div>
    </header>
  );
};
