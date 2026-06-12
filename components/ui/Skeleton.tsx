import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-2xl" />
    ))}
  </div>
);
