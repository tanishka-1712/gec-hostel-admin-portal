import React, { useState } from 'react';
import { 
  CalendarCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertTriangle, 
  Download, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Phone,
  Printer,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { AttendanceStatus } from '../types';

export const AttendancePage: React.FC = () => {
  const { absentStudents, lastSyncTime, syncAttendance, students } = useHostel();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [session, setSession] = useState<'Evening' | 'Morning'>('Evening');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [showAbsentOnly, setShowAbsentOnly] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Key Attendance Metrics (as per prompt specifications)
  const totalEnrolled = 1000;
  const presentCount = 986;
  const absentCount = 14;
  const leaveCount = 10;
  const notMarkedCount = 0;
  const attendanceRate = ((presentCount / totalEnrolled) * 100).toFixed(1);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncAttendance();
    setIsSyncing(false);
  };

  // Build attendance list from mock absent + regular students
  const studentRows = students.map((s) => {
    const isAbsent = absentStudents.some((a) => a.studentId === s.id);
    const status: AttendanceStatus = isAbsent ? 'Absent' : s.attendanceToday === 'Leave' ? 'Leave' : 'Present';
    return {
      studentId: s.id,
      studentName: s.name,
      rollNumber: s.rollNumber,
      hostel: s.hostel,
      room: s.room,
      phone: s.phone,
      guardianPhone: s.guardianPhone,
      session,
      time: isAbsent ? '08:15 PM' : '08:00 PM',
      status,
      markedBy: 'Biometric Turnstile #1-#4'
    };
  });

  const filtered = studentRows.filter((row) => {
    const matchesSearch =
      row.studentName.toLowerCase().includes(search.toLowerCase()) ||
      row.studentId.toLowerCase().includes(search.toLowerCase()) ||
      row.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      row.room.toLowerCase().includes(search.toLowerCase());

    const matchesHostel = hostelFilter === 'All' || row.hostel.includes(hostelFilter);
    const matchesStatus = showAbsentOnly
      ? row.status === 'Absent'
      : statusFilter === 'All' || row.status === statusFilter;

    return matchesSearch && matchesHostel && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Student ID,Student Name,Roll Number,Hostel,Room,Session,Status,Attendance Time,Marked By'];
    const rows = filtered.map((r) =>
      `"${r.studentId}","${r.studentName}","${r.rollNumber}","${r.hostel}","${r.room}","${r.session}","${r.status}","${r.time}","${r.markedBy}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hostel_Attendance_Report_${selectedDate}_${session}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Automated Sync Architecture</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Biometric & Turnstile Integration</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            <span>Hostel Attendance Monitoring</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Automated biometric synchronization for daily morning and evening roll calls across all blocks.
          </p>
        </div>

        {/* Sync & Export actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-primary text-xs flex items-center gap-2 py-2.5"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Biometrics...' : 'Sync Biometrics'}</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2.5"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 20. AUTOMATIC ATTENDANCE SYNC STATUS NOTIFICATION */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500">
            Attendance Flow: <strong>Biometric Turnstiles → Central DB → Admin Dashboard</strong>
          </span>
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Last Auto-Sync: <span className="font-bold text-slate-700">{lastSyncTime}</span>
        </div>
      </div>

      {/* 21. ABSENT STUDENT ALERT CALLOUT BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
              ⚠ Absentee Alert: {absentCount} Students Marked Absent Today
            </h3>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
              Biometric evening turnstile logs detected {absentCount} students unaccounted for across Boys & Girls hostels.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAbsentOnly(!showAbsentOnly)}
          className={`btn-danger text-xs font-bold py-2 px-4 shadow-xs cursor-pointer ${
            showAbsentOnly ? 'ring-2 ring-rose-400' : ''
          }`}
        >
          {showAbsentOnly ? 'Show All Students' : 'View Absent Students'}
        </button>
      </div>

      {/* 19. TODAY'S ATTENDANCE SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Boarders</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalEnrolled}</p>
          <span className="text-[10px] text-slate-400">100% capacity</span>
        </div>

        <div className="card p-4 text-center border-emerald-100 bg-emerald-50/20">
          <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Present</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</p>
          <span className="text-[10px] text-emerald-700 font-bold">{attendanceRate}% Rate</span>
        </div>

        <div className="card p-4 text-center border-rose-100 bg-rose-50/20">
          <p className="text-xs text-rose-800 font-semibold uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{absentCount}</p>
          <span className="text-[10px] text-rose-700">Flagged alert</span>
        </div>

        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">On Leave</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{leaveCount}</p>
          <span className="text-[10px] text-slate-400">Official leave</span>
        </div>

        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Not Marked</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{notMarkedCount}</p>
          <span className="text-[10px] text-slate-400">All synchronized</span>
        </div>
      </div>

      {/* 22. ATTENDANCE HISTORY & FILTERS */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Session Switcher (Morning vs Evening) */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSession('Evening')}
              className={`flex-1 md:flex-none py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                session === 'Evening' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              🌙 Evening Roll Call (08:00 PM)
            </button>
            <button
              type="button"
              onClick={() => setSession('Morning')}
              className={`flex-1 md:flex-none py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                session === 'Morning' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              ☀️ Morning Roll Call (07:00 AM)
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input text-xs py-1.5 w-full md:w-40"
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, ID, or room..."
              className="form-input pl-10 text-xs sm:text-sm py-2"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="form-select text-xs py-2 w-full md:w-44"
            >
              <option value="All">All Hostels & Blocks</option>
              <option value="C.V. Raman">Boys - Raman</option>
              <option value="Kalam">Boys - Kalam</option>
              <option value="Aryabhatta">Boys - Aryabhatta</option>
              <option value="Kalpana Chawla">Girls - Kalpana</option>
              <option value="Sarojini Naidu">Girls - Sarojini</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setShowAbsentOnly(false);
              }}
              className="form-select text-xs py-2 w-full md:w-36"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Data Table */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Hostel & Block</th>
              <th>Room</th>
              <th>Session</th>
              <th>Attendance Time</th>
              <th>Status</th>
              <th>Biometric Sync Source</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.studentId}
                  className={`transition-colors hover:bg-blue-50/50 ${
                    row.status === 'Absent' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="font-mono text-xs font-semibold text-slate-600">
                    {row.studentId}
                  </td>
                  <td>
                    <div>
                      <p className="font-bold text-slate-900">{row.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Roll: {row.rollNumber}</p>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-slate-800 text-xs">{row.hostel}</span>
                  </td>
                  <td className="font-bold text-slate-700 text-xs">{row.room}</td>
                  <td>
                    <span className="text-xs text-slate-600">{row.session}</span>
                  </td>
                  <td className="font-mono text-xs text-slate-700">{row.time}</td>
                  <td>
                    {row.status === 'Present' ? (
                      <Badge variant="green">Present</Badge>
                    ) : row.status === 'Absent' ? (
                      <Badge variant="red" icon={<AlertTriangle className="w-3 h-3" />}>Absent</Badge>
                    ) : (
                      <Badge variant="purple">On Leave</Badge>
                    )}
                  </td>
                  <td className="text-xs text-slate-500 font-mono">
                    {row.markedBy}
                  </td>
                  <td className="text-right">
                    {row.status === 'Absent' ? (
                      <a
                        href={`tel:${row.guardianPhone}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Call Guardian
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">Verified</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
