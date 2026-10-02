import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Shield, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { SecurityAction, VerificationMethod } from '../types';

export const SecurityActivityPage: React.FC = () => {
  const { securityLogs, students, curfewTime } = useHostel();

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'custom'>('today');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLogs = securityLogs.filter((log) => {
    const matchesSearch =
      log.studentName.toLowerCase().includes(search.toLowerCase()) ||
      log.studentId.toLowerCase().includes(search.toLowerCase()) ||
      log.gatePassId.toLowerCase().includes(search.toLowerCase()) ||
      log.securityGuardName.toLowerCase().includes(search.toLowerCase());

    let matchesAction = true;
    if (actionFilter === 'ENTRY') matchesAction = log.action === 'ENTRY' && !log.isLate;
    if (actionFilter === 'EXIT') matchesAction = log.action === 'EXIT' && !log.isAfter7PM;
    if (actionFilter === 'LATE_ENTRY') matchesAction = log.action === 'ENTRY' && Boolean(log.isLate);
    if (actionFilter === 'LATE_EXIT') matchesAction = log.action === 'EXIT' && Boolean(log.isAfter7PM);

    return matchesSearch && matchesAction;
  });

  const exportCSV = () => {
    const headers = ['Log ID,Timestamp,Student ID,Student Name,Action,Gate Pass ID,Guard Name,Method,Notes,After 7 PM,Late Duration'];
    const rows = filteredLogs.map((l) =>
      `"${l.id}","${l.timestamp}","${l.studentId}","${l.studentName}","${l.action}","${l.gatePassId}","${l.securityGuardName}","${l.verificationMethod}","${l.notes || ''}","${l.isAfter7PM ? 'YES' : 'NO'}","${l.lateDuration || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Security_Activity_Feed_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Campus Gate Sentinel</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Gate 1 & Gate 2 Live Biometric Telemetry</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-indigo-600" />
            <span>Security Activity Feed</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Real-time chronological log of students entering, exiting, late returns, and biometric security passes.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="btn-secondary text-xs flex items-center gap-2 py-2.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Activity Log</span>
        </button>
      </div>

      {/* Date & Action Filter Buttons */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Date Range Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`flex-1 md:flex-none py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilter === 'today' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('yesterday')}
              className={`flex-1 md:flex-none py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilter === 'yesterday' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('week')}
              className={`flex-1 md:flex-none py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilter === 'week' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('custom')}
              className={`flex-1 md:flex-none py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilter === 'custom' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Custom Date
            </button>
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActionFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                actionFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Events ({securityLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActionFilter('ENTRY')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                actionFilter === 'ENTRY' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🟢 Entry
            </button>
            <button
              type="button"
              onClick={() => setActionFilter('EXIT')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                actionFilter === 'EXIT' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔴 Exit
            </button>
            <button
              type="button"
              onClick={() => setActionFilter('LATE_EXIT')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                actionFilter === 'LATE_EXIT' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⚠ Late Exit (After 7 PM)
            </button>
            <button
              type="button"
              onClick={() => setActionFilter('LATE_ENTRY')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                actionFilter === 'LATE_ENTRY' ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⏰ Late Entry
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity by student name, roll number, pass ID, guard name..."
            className="form-input pl-10 text-xs sm:text-sm py-2"
          />
        </div>
      </div>

      {/* 14. REAL-TIME ACTIVITY FEED STREAM */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Chronological Turnstile Feed
        </h3>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="card p-8 text-center text-xs text-slate-400">
              No security movements recorded matching the current criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExit = log.action === 'EXIT';
              const isAfter7 = log.isAfter7PM;
              const isLate = log.isLate;

              return (
                <div
                  key={log.id}
                  className={`card p-4 sm:p-5 transition-all hover:shadow-md border ${
                    isAfter7
                      ? 'bg-amber-50/40 border-amber-200'
                      : isLate
                      ? 'bg-orange-50/40 border-orange-200'
                      : isExit
                      ? 'bg-white border-slate-100'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Indicator, Student & Action */}
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-0.5">
                        {isAfter7 ? '⚠' : isLate ? '⏰' : isExit ? '🔴' : '🟢'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {log.timeFormatted}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {log.studentName}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {isExit ? 'exited hostel.' : 'entered hostel.'}
                          </span>
                        </div>

                        {/* Guard and verification information */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-1 font-medium">
                          <span>Gate Pass: <strong className="font-mono text-blue-700">{log.gatePassId}</strong></span>
                          <span>·</span>
                          <span>Guard: <strong className="text-slate-700">{log.securityGuardName}</strong></span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            Method: {log.verificationMethod}
                          </span>
                        </div>

                        {/* Notes if applicable */}
                        {log.notes && (
                          <p className="text-xs text-slate-700 mt-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Badge Flags */}
                    <div className="flex flex-wrap sm:flex-col items-end gap-1.5 shrink-0 self-end sm:self-auto">
                      {isAfter7 && (
                        <span className="badge-red text-[10px] font-bold">
                          Exited After 7 PM
                        </span>
                      )}
                      {isLate && (
                        <span className="badge-orange text-[10px] font-bold">
                          Late Return: {log.lateDuration || 'Delay'}
                        </span>
                      )}
                      {!isAfter7 && !isLate && (
                        <span className={`badge text-[10px] font-semibold ${isExit ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {isExit ? 'Standard Exit' : 'Safe Return'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
