import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Clock, 
  Bell, 
  User, 
  Lock, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Smartphone,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { resetToDefaultData } = useHostel();

  const [curfewBoys, setCurfewBoys] = useState<string>('07:30 PM');
  const [curfewGirls, setCurfewGirls] = useState<string>('07:00 PM');
  const [parentSMSAlerts, setParentSMSAlerts] = useState<boolean>(true);
  const [biometricSyncInterval, setBiometricSyncInterval] = useState<string>('15');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [resetDone, setResetDone] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo records (gate passes, complaints, movements) to default GEC Autonomous College dataset?')) {
      resetToDefaultData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">System Configuration</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Hostel Rules & Security Protocols</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-slate-700" />
            <span>Portal Settings & Protocols</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Configure night curfew thresholds, SMS gateways, biometric turnstile timings, and administrator accounts.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Hostel surveillance parameters and curfew rules successfully updated in central registry.</span>
        </div>
      )}

      {resetDone && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-800 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Database restored to pristine GEC Autonomous College default state.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Curfew Rules Configuration */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hostel Night Curfew & Movement Rules</h3>
              <p className="text-xs text-slate-500">Thresholds for automated 'After 7 PM' violation tagging</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="form-label text-xs">Girls Hostel Curfew (Kalpana Chawla & Sarojini Naidu):</label>
              <input
                type="text"
                value={curfewGirls}
                onChange={(e) => setCurfewGirls(e.target.value)}
                className="form-input text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Exits after this hour automatically raise urgent alarms.</span>
            </div>

            <div>
              <label className="form-label text-xs">Boys Hostel Curfew (CV Raman, Kalam, Aryabhatta):</label>
              <input
                type="text"
                value={curfewBoys}
                onChange={(e) => setCurfewBoys(e.target.value)}
                className="form-input text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Requires authorized warden pass for gate opening.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={parentSMSAlerts}
                onChange={(e) => setParentSMSAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-900">Automated Parent WhatsApp / SMS Notification Gateway</span>
                <p className="text-[11px] text-slate-500">
                  Sends an automated notification to guardian phone number when a student exits after 7:00 PM or exceeds expected return by 30+ minutes.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Biometric Integration Settings */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Biometric Turnstile & RFID Synchronization</h3>
              <p className="text-xs text-slate-500">Hardware connectivity for Gate 1, Gate 2, and block turnstiles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="form-label text-xs">Automated Poll & Sync Frequency (Minutes):</label>
              <select
                value={biometricSyncInterval}
                onChange={(e) => setBiometricSyncInterval(e.target.value)}
                className="form-select text-xs py-2"
              >
                <option value="5">Every 5 Minutes (Real-Time Egress)</option>
                <option value="15">Every 15 Minutes (Standard Campus Policy)</option>
                <option value="30">Every 30 Minutes</option>
                <option value="60">Hourly Roll Call</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">Connected Gate Terminals:</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Main Gate 1 (Turnstile #1, #2):</span>
                  <span className="text-emerald-600 font-bold">Online 🟢</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Girls Hostel Gate (Turnstile #3):</span>
                  <span className="text-emerald-600 font-bold">Online 🟢</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>South Gate Handheld Scanner:</span>
                  <span className="text-emerald-600 font-bold">Online 🟢</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Admin Account Card */}
        <div className="card p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Administrator Profile</h3>
              <p className="text-xs text-slate-500">Currently logged in staff credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Admin Name</span>
              <p className="font-bold text-slate-800 text-sm">{user?.name}</p>
              <p className="text-slate-500 font-mono">ID: {user?.id}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Designation & Role</span>
              <p className="font-semibold text-slate-800">{user?.designation}</p>
              <Badge variant="blue">{user?.role}</Badge>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Email</span>
              <p className="font-medium text-slate-800">{user?.email}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Contact Line</span>
              <p className="font-medium text-slate-800">{user?.phone}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary text-xs flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset Demo Data to Default</span>
          </button>

          <button
            type="submit"
            className="btn-primary text-xs flex items-center gap-2 py-3 px-6 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
