import React from "react";

interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefix?: string; // e.g. "+234" for phone fields
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  prefix,
  id,
  className = "",
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-ink"
      >
        {label}
      </label>
      <div
        className={`flex items-center h-12 rounded-xl border bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary ${
          error ? "border-danger" : "border-gray-200"
        }`}
      >
        {prefix && (
          <span className="pl-4 pr-2 text-sm text-ink-secondary border-r border-gray-200 mr-2 py-3">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`flex-1 h-full px-4 text-sm text-ink placeholder:text-ink-faint outline-none bg-transparent ${
            prefix ? "pl-0" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
