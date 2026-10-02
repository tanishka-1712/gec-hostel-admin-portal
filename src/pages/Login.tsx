import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState<string>('ADM-GEC-001');
  const [password, setPassword] = useState<string>('Hostel@GEC2026');
  const [role, setRole] = useState<Role>('ADMIN');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(adminId, password, role);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (selectedRole: Role, id: string, name: string) => {
    setRole(selectedRole);
    setAdminId(id);
    setPassword('Hostel@GEC2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* College Identity Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4">
          <Building2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
          Autonomous Institution · Bhubaneswar
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          GEC Autonomous College
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          Central Hostel Admin & Surveillance Portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="card shadow-xl border border-slate-200/80 p-6 sm:p-8 animate-slide-up">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {forgotSent && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Password reset instructions dispatched to registered institutional email.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector Tabs */}
            <div>
              <label className="form-label text-xs font-semibold">Select Administrative Role</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === 'ADMIN' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PRINCIPAL')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === 'PRINCIPAL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => setRole('WARDEN')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === 'WARDEN' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Warden / HOD
                </button>
              </div>
            </div>

            {/* Username / Admin ID */}
            <div>
              <label className="form-label text-xs font-semibold">Username / Official Admin ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. ADM-GEC-001 or principal@gec.edu.in"
                  className="form-input pl-10 text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label text-xs font-semibold">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="form-input pl-10 pr-10 text-xs sm:text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="font-medium">Remember this terminal</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Secure Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Role Switch for Testing
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN', 'ADM-GEC-001', 'Chief Warden')}
                className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-all hover:border-blue-300"
              >
                <p className="font-bold text-slate-800">Admin</p>
                <p className="text-[10px] text-slate-500">Chief Warden</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('PRINCIPAL', 'PRIN-GEC-01', 'Dr. P. K. Subudhi')}
                className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-all hover:border-blue-300"
              >
                <p className="font-bold text-slate-800">Principal</p>
                <p className="text-[10px] text-slate-500">College Head</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('WARDEN', 'WRD-GEC-05', 'Prof. K. C. Sahoo')}
                className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-all hover:border-blue-300"
              >
                <p className="font-bold text-slate-800">Warden</p>
                <p className="text-[10px] text-slate-500">Kalam Block</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit Encrypted Institutional Portal · Session Monitored</span>
        </div>
      </div>
    </div>
  );
};
