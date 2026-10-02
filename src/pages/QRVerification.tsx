import React, { useState } from 'react';
import { 
  QrCode, 
  Camera, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  User, 
  Clock, 
  MapPin, 
  Shield, 
  Sparkles,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { GatePass, Student } from '../types';

export const QRVerificationPage: React.FC = () => {
  const { verifyQRToken, markStudentOut, markStudentIn, gatePasses, securityLogs } = useHostel();
  const { user } = useAuth();

  const [inputToken, setInputToken] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'manual' | 'camera'>('manual');
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    gatePass?: GatePass;
    student?: Student;
    reason?: string;
  } | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [securityGuardName, setSecurityGuardName] = useState<string>('Officer K. Jena (Main Gate 1)');

  const handleVerify = (tokenToVerify?: string) => {
    const token = tokenToVerify || inputToken;
    if (!token.trim()) return;
    setActionSuccess('');
    const result = verifyQRToken(token.trim());
    setScanResult(result);
  };

  const handleMarkOut = () => {
    if (!scanResult?.gatePass) return;
    const res = markStudentOut(scanResult.gatePass.id, securityGuardName, 'QR_SCAN');
    if (res.success) {
      setActionSuccess(res.message);
      // Re-verify to update state
      handleVerify(scanResult.gatePass.qrToken);
    }
  };

  const handleMarkIn = () => {
    if (!scanResult?.gatePass) return;
    const res = markStudentIn(scanResult.gatePass.id, securityGuardName, 'QR_SCAN');
    if (res.success) {
      setActionSuccess(res.message);
      // Re-verify to update state
      handleVerify(scanResult.gatePass.qrToken);
    }
  };

  // Quick token test presets for easy evaluation
  const activePasses = gatePasses.filter((g) => g.status === 'Active' || g.status === 'Approved');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Gate Terminal Module</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">GEC Turnstile & Security Desk</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-blue-600" />
            <span>Gate Pass QR Verification</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Verify student cryptographic tokens, prevent unauthorized egress, and log biometric entry/exit.
          </p>
        </div>

        {/* Security Guard Desk selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Operating Guard</span>
            <select
              value={securityGuardName}
              onChange={(e) => setSecurityGuardName(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
            >
              <option value="Officer K. Jena (Main Gate 1)">Officer K. Jena (Main Gate 1)</option>
              <option value="Ramesh Naik (Boys Gate 2)">Ramesh Naik (Boys Gate 2)</option>
              <option value="Sunita Pradhan (Girls Gate 3)">Sunita Pradhan (Girls Gate 3)</option>
              <option value="B. Tripathy (South Turnstile)">B. Tripathy (South Turnstile)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verification Scanner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner & Input (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMode('manual')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'manual' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Manual Token Input</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('camera')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'camera' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Camera Scanner</span>
              </button>
            </div>

            {/* Mode 1: Manual Input */}
            {activeMode === 'manual' && (
              <div className="space-y-3">
                <div>
                  <label className="form-label text-xs font-semibold">
                    Enter Secure Gate Pass Token or Student ID:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      placeholder="e.g. GP-2026-8F92X71ABC or STU20260045"
                      className="form-input text-xs sm:text-sm font-mono uppercase"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerify()}
                  className="w-full btn-primary flex items-center justify-center gap-2 text-xs py-3"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Pass Integrity</span>
                </button>
              </div>
            )}

            {/* Mode 2: Camera Viewfinder Simulation */}
            {activeMode === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-500/50">
                  {/* Viewfinder crosshairs */}
                  <div className="w-44 h-44 border-2 border-blue-400 rounded-xl relative flex items-center justify-center animate-pulse">
                    <div className="w-full h-0.5 bg-red-500 absolute top-1/2 left-0 shadow-lg shadow-red-500/50" />
                    <span className="text-[10px] text-blue-200/70 font-mono tracking-widest uppercase">
                      Align QR in Focus
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3 font-medium text-center">
                    Gate 1 HD Security Camera Stream · Ready
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  💡 In browser mode: Select a simulated token from the test presets below to emulate real gate scans.
                </div>
              </div>
            )}

            {/* Quick Test Presets */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simulate Scanning Known Boarder Passes
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {gatePasses.slice(0, 4).map((gp) => (
                  <button
                    key={gp.id}
                    type="button"
                    onClick={() => {
                      setInputToken(gp.qrToken);
                      handleVerify(gp.qrToken);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{gp.studentName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {gp.id} ({gp.status})
                      </span>
                    </div>
                    <Badge variant={gp.status === 'Active' ? 'blue' : gp.status === 'Approved' ? 'green' : 'gray'}>
                      {gp.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Result Panel (7 Cols) */}
        <div className="lg:col-span-7">
          {actionSuccess && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Gate Movement Successfully Recorded
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">{actionSuccess}</p>
              </div>
            </div>
          )}

          {!scanResult ? (
            <div className="card flex flex-col items-center justify-center p-12 text-center text-slate-400 h-full border-dashed min-h-96">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Awaiting Pass Scan</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Enter a cryptographic token above or trigger the live camera scanner to inspect boarder credentials.
              </p>
            </div>
          ) : scanResult.valid && scanResult.gatePass ? (
            /* 17. DISPLAY VALID GATE PASS */
            <div className="card space-y-6 border-emerald-200 ring-2 ring-emerald-500/10 animate-fade-in shadow-md">
              {/* Top Banner: VALID PASS */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                      ✓ VALID GATE PASS
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      Cryptographically verified & approved by Warden
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                  {scanResult.gatePass.qrToken}
                </span>
              </div>

              {/* Student Identity Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={scanResult.student?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                  alt={scanResult.gatePass.studentName}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white shadow-sm shrink-0"
                />
                <div className="flex-1 text-center sm:text-left space-y-1 text-xs">
                  <h2 className="text-base font-bold text-slate-900">{scanResult.gatePass.studentName}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-slate-500 font-mono">
                    <span>ID: {scanResult.gatePass.studentId}</span>
                    <span>·</span>
                    <span>Roll: {scanResult.gatePass.studentRoll}</span>
                  </div>
                  <p className="font-semibold text-slate-700">
                    {scanResult.gatePass.hostel} · <span className="text-blue-600">{scanResult.gatePass.room}</span>
                  </p>
                </div>
                <div className="shrink-0">
                  <Badge variant={scanResult.gatePass.status === 'Active' ? 'blue' : 'green'}>
                    Status: {scanResult.gatePass.status}
                  </Badge>
                </div>
              </div>

              {/* Pass Terms Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Reason for Outing</span>
                  <p className="font-bold text-slate-800 text-sm">{scanResult.gatePass.reason}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Authorized Destination</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {scanResult.gatePass.destination}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Approved By & Date</span>
                  <p className="font-medium text-slate-800">
                    {scanResult.gatePass.approvedBy} ({scanResult.gatePass.approvedDate})
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Scheduled Out & Expected Return</span>
                  <p className="font-bold text-slate-800">
                    {scanResult.gatePass.outTime} → <span className="text-blue-700">{scanResult.gatePass.expectedReturnTime}</span>
                  </p>
                </div>
              </div>

              {/* Interactive Turnstile / Guard Action Buttons */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Security Guard Turnstile Actions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleMarkOut}
                    className="btn-danger flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Mark Student OUT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkIn}
                    className="btn-success flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Mark Student IN</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Executing these actions logs immediate security records with timestamp and guard identification.
                </p>
              </div>
            </div>
          ) : (
            /* INVALID / REJECTED / EXPIRED PASS DISPLAY */
            <div className="card space-y-5 border-red-200 bg-red-50/20 p-6 animate-fade-in">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-xs shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-red-950 uppercase tracking-wider">
                    ✗ INVALID PASS — EGRESS PROHIBITED
                  </h3>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed font-semibold">
                    {scanResult.message}
                  </p>
                </div>
              </div>

              {scanResult.gatePass && (
                <div className="p-4 bg-white rounded-xl border border-red-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student:</span>
                    <span className="font-bold text-slate-800">{scanResult.gatePass.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hostel & Room:</span>
                    <span className="font-medium text-slate-700">{scanResult.gatePass.hostel} - {scanResult.gatePass.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pass Status:</span>
                    <Badge variant="red">{scanResult.gatePass.status}</Badge>
                  </div>
                  {scanResult.gatePass.rejectionReason && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-red-600 font-bold block mb-0.5">Recorded Reason:</span>
                      <p className="text-slate-700">{scanResult.gatePass.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
