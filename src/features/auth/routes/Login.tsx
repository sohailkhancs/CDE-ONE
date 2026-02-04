import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { Building2, ShieldCheck, Lock, Mail, Key, AlertCircle, ChevronRight } from 'lucide-react';

const LoginView: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      clearError();
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by AuthProvider and displayed below
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20 mb-6">
              <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CDE-ONE</h1>
            <p className="text-slate-500 text-sm mt-2 text-center font-medium">Common Data Environment for Infrastructure</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="alex@skylinetower.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              disabled={isLoading || !email || !password}
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/10 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock size={18} />
                  <span>SECURE ACCESS</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ISO 19650 Compliant Architecture</span>
            </div>
          </form>
        </div>
        <p className="mt-8 text-center text-slate-500 text-xs font-medium">
          Don&apos;t have an account? <span className="text-red-500 font-bold cursor-pointer hover:underline">Contact Administrator</span>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
