import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[#d0dddb]/70 rounded-xl ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full animate-in fade-in duration-150" aria-label="Carregando dados da residência...">
      {/* Banner Skeleton */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#d9e5e3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full md:w-44 rounded-2xl" />
      </div>

      {/* Mural Skeleton */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4f0ee] pb-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-xl" />
        </div>

        {/* Notes Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[220px]">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-5 rounded-3xl border border-[#d9e5e3] bg-[#f0fcfa]/60 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-4 rounded-md" />
                </div>
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
                <Skeleton className="h-3.5 w-3/5 rounded-md" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TasksSkeleton: React.FC = () => {
  return (
    <div className="p-3 sm:p-5 max-w-5xl mx-auto w-full space-y-3.5 sm:space-y-5 animate-in fade-in duration-150" aria-label="Carregando tarefas...">
      {/* Header Bar Skeleton */}
      <div className="flex flex-row items-center justify-between gap-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white p-2 rounded-xl border border-[#d9e5e3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      {/* Tasks Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white p-3.5 rounded-xl border border-[#d9e5e3] shadow-2xs flex flex-col justify-between gap-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/3 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>

              {/* Responsável bar skeleton */}
              <Skeleton className="h-7 w-full rounded-lg" />
            </div>

            {/* Actions row skeleton */}
            <div className="flex items-center justify-between pt-2 border-t border-[#f0fcfa]">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MealsSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full animate-in fade-in duration-150" aria-label="Carregando cardápio da casa...">
      {/* Header Skeleton */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#d9e5e3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Days of Week Row Skeleton */}
      <div className="bg-white p-2 rounded-2xl border border-[#d9e5e3] shadow-2xs flex items-center justify-between gap-1.5 overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <Skeleton key={d} className="h-10 flex-1 rounded-xl" />
        ))}
      </div>

      {/* 4 Meals Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((m) => (
          <div
            key={m}
            className="bg-white p-5 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e4f0ee]">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>
            <div className="pt-3 border-t border-[#f0fcfa] flex items-center justify-between">
              <Skeleton className="h-7 w-28 rounded-xl" />
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StatisticsSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full animate-in fade-in duration-150" aria-label="Carregando estatísticas da residência...">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
      </div>

      {/* 3 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((c) => (
          <div
            key={c}
            className="bg-white p-6 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-4 flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-baseline gap-3">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-full rounded-md" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Member Rankings Table/List Skeleton */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e4f0ee]">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((r) => (
            <div key={r} className="p-3.5 rounded-2xl border border-[#d9e5e3] bg-[#f0fcfa]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-2/3 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ReportsSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full animate-in fade-in duration-150" aria-label="Carregando relatórios...">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-56 rounded-md" />
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-[#d9e5e3] shadow-2xs flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-44 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-44 rounded-xl" />
      </div>

      {/* Rows Skeleton */}
      <div className="bg-white p-5 rounded-3xl border border-[#d9e5e3] shadow-xs space-y-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="p-3.5 rounded-2xl border border-[#d9e5e3] bg-[#f0fcfa]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HouseSelectionSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-150" aria-label="Carregando residências...">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((h) => (
          <div
            key={h}
            className="p-4 rounded-2xl border border-[#d9e5e3] bg-[#f0fcfa] flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="pt-2 border-t border-[#e4f0ee] flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

