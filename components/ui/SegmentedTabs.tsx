import React from "react";

export const SegmentedTabs: React.FC<{
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-colors ${
          active === tab
            ? "bg-surface text-primary shadow-sm"
            : "text-ink-secondary active:text-ink"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);
