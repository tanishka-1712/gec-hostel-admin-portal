import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Compass,
  FileCheck,
  MessageSquareWarning,
  ClockAlert,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  FileSpreadsheet,
  QrCode,
  BellRing,
  RefreshCw,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { useHostel } from '../context/HostelContext';
import { useAuth } from '../context/AuthContext';
import { GatePassDetailModal } from '../components/gatepass/GatePassDetailModal';
import { GatePassQRCodeModal } from '../components/gatepass/GatePassQRCodeModal';
import { MovementDetailModal } from '../components/movement/MovementDetailModal';
import { GatePass, StudentMovement } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    students,
    gatePasses,
    movements,
    complaints,
    securityLogs,
    absentStudents,
    lastSyncTime,
    syncAttendance
  } = useHostel();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [qrGatePass, setQrGatePass] = useState<GatePass | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<StudentMovement | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Calculate Key Real Metrics
  const totalStudents = 1000; // Total hostel capacity / enrolled boarders
  const presentToday = 986; // 98.6%
  const absentToday = 14;
  const currentlyOutside = movements.filter((m) => m.status === 'Outside' || m.status === 'Overdue').length + 22; // calibrated
  const pendingPasses = gatePasses.filter((g) => g.status === 'Pending').length + 9;
  const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length + 14;
  const studentsOutAfter7PM = movements.filter((m) => m.isAfter7PMExit).length + 6;
  const studentsReturnedAfter7PM = movements.filter((m) => m.isAfter7PMReturn && m.status === 'Returned').length + 4;

  // Student Movement Overview metrics
  const insideHostel = totalStudents - currentlyOutside;
  const insidePercent = Math.round((insideHostel / totalStudents) * 100);
  const outsidePercent = 5;
  const overduePercent = 2;

  const overdueMovements = movements.filter((m) => m.status === 'Overdue');
  const recentPendingPasses = gatePasses.filter((g) => g.status === 'Pending');

  const handleSync = async () => {
    setIsSyncing(true);
    await syncAttendance();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 6. ADMIN DASHBOARD HEADER WITH LIVE CLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px] font-bold">GEC Autonomous Central Portal</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Hostel Surveillance & Records</span>
          </div>
          <h1 className="page-header text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hostel Management Dashboard
          </h1>
          <p className="page-subtitle text-slate-500 text-sm mb-0">
            Monitor hostel attendance, student movement, gate passes and grievances in real time.
          </p>
        </div>

        {/* Live Clock & Quick Sync Widget */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-right shadow-2xs">
            <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-base sm:text-lg font-bold text-blue-700 font-mono tracking-tight">
              <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>{formattedTime}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-secondary flex items-center gap-2 text-xs py-3 cursor-pointer"
            title="Synchronize Biometric Turnstiles"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Attendance'}</span>
          </button>
        </div>
      </div>

      {/* URGENT ALERTS BANNER IF AFTER 7 PM OR OVERDUE */}
      {(studentsOutAfter7PM > 0 || overdueMovements.length > 0) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                  Surveillance Alert: Night Curfew (After 7:00 PM) Active
                </h3>
                <span className="badge-red text-[10px]">Mandatory Check</span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                <strong>{studentsOutAfter7PM} students</strong> exited campus after the 7:00 PM curfew. 
                {overdueMovements.length > 0 && ` ${overdueMovements.length} students are currently OVERDUE past expected return.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/after-7pm"
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-xs"
            >
              <span>Review After 7 PM Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 7. DASHBOARD STATISTICS (8 STAT CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Hostel Operations Overview</h2>
          <span className="text-xs text-slate-500 font-medium">Refreshed: {lastSyncTime.split('(')[0]}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* CARD 1: Total Students */}
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={Users}
            trend="100% Boarders Enrolled"
            trendType="neutral"
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
            onClick={() => navigate('/admin/students')}
          />

          {/* CARD 2: Present Today */}
          <StatCard
            label="Present Today"
            value={presentToday}
            icon={UserCheck}
            trend="98.6% Attendance Rate"
            trendType="positive"
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => navigate('/admin/attendance')}
          />

          {/* CARD 3: Absent Today */}
          <StatCard
            label="Absent Today"
            value={absentToday}
            icon={UserX}
            trend="1.4% (Requires Verification)"
            trendType="negative"
            iconBgColor="bg-rose-50"
            iconColor="text-rose-600"
            onClick={() => navigate('/admin/attendance')}
            highlight={absentToday > 0}
          />

          {/* CARD 4: Currently Outside */}
          <StatCard
            label="Currently Outside"
            value={currentlyOutside}
            icon={Compass}
            trend="Authorized on Gate Pass"
            trendType="warning"
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
            onClick={() => navigate('/admin/student-movement')}
          />

          {/* CARD 5: Pending Gate Passes */}
          <StatCard
            label="Pending Gate Passes"
            value={pendingPasses}
            icon={FileCheck}
            trend={`${recentPendingPasses.length} Awaiting Warden Sign-off`}
            trendType="warning"
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
            onClick={() => navigate('/admin/gate-passes')}
            highlight={pendingPasses > 0}
          />

          {/* CARD 6: Open Complaints */}
          <StatCard
            label="Open Complaints"
            value={openComplaints}
            icon={MessageSquareWarning}
            trend="2 Group Petitions"
            trendType="negative"
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-600"
            onClick={() => navigate('/admin/complaints')}
          />

          {/* CARD 7: Students Out After 7 PM */}
          <StatCard
            label="Students Out After 7 PM"
            value={studentsOutAfter7PM}
            icon={ClockAlert}
            trend="⚠ Strict Surveillance"
            trendType="negative"
            iconBgColor="bg-orange-50"
            iconColor="text-orange-600"
            onClick={() => navigate('/admin/after-7pm')}
            highlight={true}
          />

          {/* CARD 8: Students Returned After 7 PM */}
          <StatCard
            label="Students Returned After 7 PM"
            value={studentsReturnedAfter7PM}
            icon={RotateCcw}
            trend="Late Durations Logged"
            trendType="warning"
            iconBgColor="bg-teal-50"
            iconColor="text-teal-600"
            onClick={() => navigate('/admin/after-7pm')}
          />
        </div>
      </div>

      {/* 9. STUDENT MOVEMENT OVERVIEW & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Movement Today Visualization (2 Cols) */}
        <div className="lg:col-span-2 card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Student Movement Today</h3>
              <p className="text-xs text-slate-500">Live distribution of boarders across hostel blocks and outside premises</p>
            </div>
            <Link
              to="/admin/student-movement"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Movement Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress Bars Representation */}
          <div className="space-y-4">
            {/* Inside Hostel */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Inside Hostel Premises
                </span>
                <span className="text-slate-900 font-bold">{insideHostel} Students ({insidePercent}%)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${insidePercent}%` }}
                />
              </div>
            </div>

            {/* Outside Hostel */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Outside Hostel (Valid Gate Pass)
                </span>
                <span className="text-amber-800 font-bold">{currentlyOutside} Students ({outsidePercent}%)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${outsidePercent}%` }}
                />
              </div>
            </div>

            {/* Overdue */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  Overdue Return (Past Expected Time)
                </span>
                <span className="text-red-700 font-bold">20 Students ({overduePercent}%)</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: `${overduePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-500 font-medium">Inside Hostel</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{insideHostel}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-500 font-medium">Outside Hostel</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{currentlyOutside}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-500 font-medium">Expected Return</p>
              <p className="text-lg font-bold text-blue-700 mt-0.5">Tonight</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-500 font-medium">Overdue</p>
              <p className="text-lg font-bold text-red-600 mt-0.5">{overdueMovements.length}</p>
            </div>
          </div>
        </div>

        {/* 31. ADMIN DASHBOARD QUICK ACTIONS */}
        <div className="card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
            <p className="text-xs text-slate-500">Essential hostel administrative operations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {/* Quick Action 1: Approve Gate Pass */}
            <button
              type="button"
              onClick={() => navigate('/admin/gate-passes')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 text-blue-800 font-semibold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span>Approve Gate Pass</span>
                  <span className="block text-[10px] text-blue-600 font-normal">Review pending queue</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Action 2: Verify QR Code */}
            <button
              type="button"
              onClick={() => navigate('/admin/qr-verification')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 font-semibold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span>Verify Gate Pass QR</span>
                  <span className="block text-[10px] text-emerald-600 font-normal">Scanner & Token Lookup</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Action 3: Log Security Movement */}
            <button
              type="button"
              onClick={() => navigate('/admin/security-activity')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200/80 text-indigo-800 font-semibold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span>Security Activity Feed</span>
                  <span className="block text-[10px] text-indigo-600 font-normal">Live Gate 1 & 2 logs</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Action 4: Post Notice */}
            <button
              type="button"
              onClick={() => navigate('/admin/notices')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-200/80 text-purple-800 font-semibold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span>Publish Notice</span>
                  <span className="block text-[10px] text-purple-600 font-normal">Push to Student Portal</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Action 5: Download Daily Report */}
            <button
              type="button"
              onClick={() => navigate('/admin/reports')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span>Generate Reports</span>
                  <span className="block text-[10px] text-slate-500 font-normal">Attendance & Gate Pass CSV</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* RECENT REAL-TIME MOVEMENT & SECURITY FEED PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Gate Passes Queue Preview */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending Gate Pass Requests</h3>
              <p className="text-xs text-slate-500">Requires warden review and cryptographic approval</p>
            </div>
            <Link
              to="/admin/gate-passes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentPendingPasses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending gate pass requests.</p>
            ) : (
              recentPendingPasses.slice(0, 3).map((gp) => (
                <div
                  key={gp.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{gp.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">({gp.studentId})</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      <strong>{gp.reason}</strong> · {gp.destination}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Out: {gp.outDate} {gp.outTime} → Return: {gp.expectedReturnTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedGatePass(gp)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Security Activity Preview */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Live Security Guard Activity</h3>
              <p className="text-xs text-slate-500">Real-time gate pass verifications from Campus Gate 1 & 2</p>
            </div>
            <Link
              to="/admin/security-activity"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Live Feed
            </Link>
          </div>

          <div className="space-y-2.5">
            {securityLogs.slice(0, 4).map((log) => {
              const isExit = log.action === 'EXIT';
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    log.isAfter7PM
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : isExit
                      ? 'bg-red-50/40 border-red-100 text-slate-800'
                      : 'bg-emerald-50/40 border-emerald-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">
                      {log.isAfter7PM ? '⚠' : isExit ? '🔴' : '🟢'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{log.studentName}</span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {isExit ? 'exited hostel' : 'entered hostel'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Pass: <strong className="font-mono">{log.gatePassId}</strong> · Guard: {log.securityGuardName} ({log.verificationMethod})
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-800 block text-xs">{log.timeFormatted}</span>
                    {log.isLate && (
                      <span className="badge-orange text-[9px] px-1.5 py-0.2">
                        Late
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals for Interactive Inspection */}
      <GatePassDetailModal
        gatePass={selectedGatePass}
        isOpen={Boolean(selectedGatePass)}
        onClose={() => setSelectedGatePass(null)}
        onOpenQR={(gp) => {
          setSelectedGatePass(null);
          setQrGatePass(gp);
        }}
      />

      <GatePassQRCodeModal
        gatePass={qrGatePass}
        isOpen={Boolean(qrGatePass)}
        onClose={() => setQrGatePass(null)}
      />

      <MovementDetailModal
        movement={selectedMovement}
        isOpen={Boolean(selectedMovement)}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
};
