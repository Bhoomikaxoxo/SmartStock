import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse w-full max-w-7xl mx-auto py-2">
      {/* Top Banner / Heading Shimmer */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-3.5 w-32 bg-slate-200/80 dark:bg-slate-800/80 rounded-full" />
          <div className="h-7 w-64 bg-slate-300/80 dark:bg-slate-700/80 rounded-xl" />
          <div className="h-3 w-80 bg-slate-200/60 dark:bg-slate-800/60 rounded-full" />
        </div>
        <div className="h-9 w-28 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl self-start md:self-center" />
      </div>

      {/* KPI Cards Row Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200/70 dark:bg-slate-800/70 rounded-full" />
              <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
            </div>
            <div className="h-8 w-24 bg-slate-300/80 dark:bg-slate-700/80 rounded-lg" />
            <div className="h-2.5 w-36 bg-slate-200/60 dark:bg-slate-800/60 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Grid Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" />
            <div className="h-7 w-20 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg" />
          </div>
          <div className="h-64 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl" />
        </div>
        <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
          <div className="h-4 w-28 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-12 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
