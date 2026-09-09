import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SEEDED_USERS } from '../../data/usersData';
import { useToast } from '../../context/ToastContext';
import { Package, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const newFieldErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newFieldErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newFieldErrors.password = 'Password is required.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    } else {
      showToast('success', `Signed in successfully.`);
    }
  };

  const handleQuickFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo1234');
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-slate-50 dark:bg-[#0B0E14] transition-colors">
      {/* Restrained ambient glow, anchored behind the mark only */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-500/[0.07] dark:bg-brand-400/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-chrome mb-3.5">
            <Package className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Smart<span className="text-brand-600 dark:text-brand-400">Stock</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Inventory Forecasting & Automated Buffer Replenishment
          </p>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Sweet Crust Artisan Bakery • Branch #104</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-modal rounded-3xl shadow-elevated p-7 sm:p-9 animate-scale-in">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sign in to your station</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your credentials or pick a demo role below.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@sweetcrustbakery.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                    fieldErrors.email
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  } text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                    fieldErrors.password
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  } text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-3 active:scale-98 min-h-[42px]"
            >
              <span>{isLoading ? 'Verifying station session…' : 'Sign in to Terminal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Seeded Quick-Fill Personas for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
              1-Click Demo Personas
            </span>
            <div className="space-y-2">
              {SEEDED_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickFill(user.email)}
                  className="w-full p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-brand-50/70 dark:hover:bg-brand-950/30 hover:border-brand-200 dark:hover:border-brand-800 border border-slate-200/80 dark:border-slate-700 text-left transition flex items-center justify-between text-xs cursor-pointer group min-h-[40px]"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-bold flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                      {user.avatarInitial}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-900 dark:group-hover:text-brand-400">{user.name}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] block">{user.email}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      user.role === 'owner'
                        ? 'bg-brand-100 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 border-brand-300 dark:border-brand-800'
                        : user.role === 'purchasing'
                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 text-center font-mono">
              Password: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">demo1234</code>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          SmartStock Systems • Sweet Crust Artisan Bakery Station #104
        </div>
      </div>
    </div>
  );
};
