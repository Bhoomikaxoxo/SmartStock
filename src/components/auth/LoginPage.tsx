import React, { useState } from 'react';
import { useAuth, SEEDED_USERS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Package, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100/80 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-sm mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SmartStock</h1>
          <p className="text-xs text-slate-500 mt-1">
            Inventory Forecasting & Reorder Automation • Sweet Crust Bakery
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your bakery credentials to access inventory and alerts.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@sweetcrustbakery.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authenticating…' : 'Sign in'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Seeded Quick-Fill Personas for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Demo Personas (Click to Quick-Fill)
            </span>
            <div className="space-y-1.5">
              {SEEDED_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickFill(user.email)}
                  className="w-full p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{user.name}</span>
                    <span className="text-slate-400 text-[11px] block">{user.email}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      user.role === 'owner'
                        ? 'bg-amber-100 text-amber-800'
                        : user.role === 'purchasing'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Password is <code>demo1234</code> for all seeded accounts.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Client-side prototype demonstration • Sweet Crust Artisan Bakery #104
        </div>
      </div>
    </div>
  );
};
