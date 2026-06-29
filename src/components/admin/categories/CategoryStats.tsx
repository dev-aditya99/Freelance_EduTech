import React from "react";
import { Layers, CheckCircle2, XCircle } from "lucide-react";

export function CategoryStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Categories
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.total || 0}
          </h3>
        </div>
      </div>
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Active
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.active || 0}
          </h3>
        </div>
      </div>
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
          <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Inactive
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.inactive || 0}
          </h3>
        </div>
      </div>
    </div>
  );
}
