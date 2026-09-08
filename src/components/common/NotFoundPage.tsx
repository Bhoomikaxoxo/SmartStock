import React from 'react';
import { ChefHat, ArrowLeft, Package } from 'lucide-react';

interface NotFoundPageProps {
  onReturn: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturn }) => {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-sm mx-auto">
          <ChefHat className="w-10 h-10 stroke-[2]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-xs font-mono font-bold shadow">
          404
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        Recipe or Station Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        The inventory ledger route or station you are looking for has been relocated, completed, or doesn't exist at Sweet Crust Bakery Branch #104.
      </p>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onReturn}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-2 cursor-pointer active:scale-95 min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      <div className="mt-12 flex items-center space-x-2 text-xs text-slate-400">
        <Package className="w-4 h-4" />
        <span>SmartStock Artisan OS • Operational Integrity Check</span>
      </div>
    </div>
  );
};
