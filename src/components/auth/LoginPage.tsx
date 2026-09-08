import React, { useState } from 'react';
import { useAuth, SEEDED_USERS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Package, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

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
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-slate-50">
      {/* Ambient Radial Lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-600/30 mb-3.5">
            <Package className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Smart<span className="text-amber-600">Stock</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Inventory Forecasting & Automated Buffer Replenishment
          </p>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Sweet Crust Artisan Bakery • Branch #104</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-modal rounded-3xl border border-slate-200/90 shadow-elevated p-7 sm:p-9 animate-scale-in">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Sign in to your station</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials or pick a demo role below.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@sweetcrustbakery.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-extrabold text-xs shadow-sm shadow-amber-500/25 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-3 active:scale-98"
            >
              <span>{isLoading ? 'Verifying station session…' : 'Sign in to Terminal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Seeded Quick-Fill Personas for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
              1-Click Demo Personas
            </span>
            <div className="space-y-2">
              {SEEDED_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickFill(user.email)}
                  className="w-full p-2.5 rounded-xl bg-slate-50/80 hover:bg-amber-50/70 hover:border-amber-200 border border-slate-200/80 text-left transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                      {user.avatarInitial}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-amber-900">{user.name}</span>
                      <span className="text-slate-400 text-[10px] block">{user.email}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      user.role === 'owner'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : user.role === 'purchasing'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 text-center font-mono">
              Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">demo1234</code>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
          SmartStock Systems • Sweet Crust Artisan Bakery Station #104
        </div>
      </div>
    </div>
  );
};
