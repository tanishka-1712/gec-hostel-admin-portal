import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  FileText, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const { movements, gatePasses, complaints, groupComplaints, securityLogs, students } = useHostel();

  const [reportType, setReportType] = useState<string>('daily_attendance');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const reportOptions = [
    { id: 'daily_attendance', name: '1. Daily Attendance Report', description: 'Biometric present/absent summary across hostel blocks' },
    { id: 'gate_pass', name: '2. Gate Pass Report', description: 'Approved, pending, and rejected egress requests with tokens' },
    { id: 'student_movement', name: '3. Student Movement Report', description: 'Real-time exit, entry, outside status, and turnstile timestamps' },
    { id: 'after_7pm_movement', name: '4. After 7 PM Movement Report', description: 'Curfew violations, night exits, and disciplinary flags' },
    { id: 'late_return', name: '5. Late Return Report', description: 'Boarders returning past expected time with exact late calculations' },
    { id: 'complaint', name: '6. Complaint & Grievance Report', description: 'Individual room/mess/electrical issues and resolution SLAs' },
    { id: 'group_complaint', name: '7. Group Complaint Report', description: 'Multi-student petitions and collective hostel grievances' },
    { id: 'security_activity', name: '8. Security Activity Report', description: 'Turnstile logs, guard entries, and manual verification audits' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[] = [];
    const dateStamp = new Date().toISOString().split('T')[0];

    if (reportType === 'daily_attendance') {
      headers = ['Student ID,Name,Hostel,Room,Attendance Status,Marked By,Sync Date'];
      rows = students.map((s) => `"${s.id}","${s.name}","${s.hostel}","${s.room}","${s.attendanceToday}","Biometric Turnstiles","${dateStamp}"`);
    } else if (reportType === 'gate_pass') {
      headers = ['Gate Pass ID,Student ID,Student Name,Reason,Destination,Requested Date,Out Time,Return Time,Status,Approved By'];
      rows = gatePasses.map((g) => `"${g.id}","${g.studentId}","${g.studentName}","${g.reason}","${g.destination}","${g.requestedDate}","${g.outTime}","${g.expectedReturnTime}","${g.status}","${g.approvedBy || ''}"`);
    } else if (reportType === 'student_movement') {
      headers = ['Student ID,Student Name,Hostel,Room,Gate Pass ID,Out Time,Expected Return,Actual Return,Status'];
      rows = movements.map((m) => `"${m.studentId}","${m.studentName}","${m.hostel}","${m.room}","${m.gatePassId}","${m.outTime}","${m.expectedReturn}","${m.actualReturn || 'OUTSIDE'}","${m.status}"`);
    } else if (reportType === 'after_7pm_movement') {
      headers = ['Student ID,Student Name,Hostel,Room,Gate Pass ID,Violation,Out Time,Expected Return,Approved By,Security Guard'];
      rows = movements.filter((m) => m.isAfter7PMExit).map((m) => `"${m.studentId}","${m.studentName}","${m.hostel}","${m.room}","${m.gatePassId}","LEFT AFTER 7 PM","${m.outTime}","${m.expectedReturn}","${m.approvedBy}","${m.exitVerifiedBy || 'Gate Guard'}"`);
    } else if (reportType === 'late_return') {
      headers = ['Student ID,Student Name,Hostel,Room,Gate Pass ID,Actual Return,Expected Return,Late Duration'];
      rows = movements.filter((m) => m.isAfter7PMReturn || m.lateMinutes).map((m) => `"${m.studentId}","${m.studentName}","${m.hostel}","${m.room}","${m.gatePassId}","${m.actualReturn || 'N/A'}","${m.expectedReturn}","${m.lateMinutes ? `${Math.floor(m.lateMinutes / 60)}h ${m.lateMinutes % 60}m` : 'Late After 7 PM'}"`);
    } else if (reportType === 'complaint') {
      headers = ['Complaint ID,Student Name,Room,Category,Subject,Priority,Status,Created Date,Assigned To'];
      rows = complaints.map((c) => `"${c.id}","${c.studentName}","${c.room}","${c.category}","${c.subject}","${c.priority}","${c.status}","${c.createdDate}","${c.assignedTo || 'Unassigned'}"`);
    } else if (reportType === 'group_complaint') {
      headers = ['Group ID,Title,Category,Hostel,Joined Members Count,Priority,Status,Created Date'];
      rows = groupComplaints.map((g) => `"${g.id}","${g.title}","${g.category}","${g.hostel}","${g.membersCount}","${g.priority}","${g.status}","${g.createdDate}"`);
    } else {
      headers = ['Log ID,Timestamp,Student Name,Action,Gate Pass ID,Security Guard,Method,Notes'];
      rows = securityLogs.map((l) => `"${l.id}","${l.timestamp}","${l.studentName}","${l.action}","${l.gatePassId}","${l.securityGuardName}","${l.verificationMethod}","${l.notes || ''}"`);
    }

    const csvContent = [...headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GEC_Hostel_${reportType}_${dateStamp}.csv`;
    a.click();
  };

  const selectedReportObj = reportOptions.find((r) => r.id === reportType);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Audit & Intelligence</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Official Institutional Reporting Engine</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-blue-600" />
            <span>Hostel Administration Reports</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Generate and export official audit reports for the Principal, Chief Warden, and Disciplinary Committee.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {reportOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setReportType(opt.id)}
            className={`card p-4 cursor-pointer transition-all border ${
              reportType === opt.id
                ? 'border-blue-600 ring-2 ring-blue-500/15 bg-blue-50/20 shadow-xs'
                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">{opt.name}</span>
              {reportType === opt.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
              {opt.description}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Parameters Card */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Report Parameters & Scope
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="form-label text-xs">Hostel / Block Filter:</label>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="form-select text-xs py-2"
            >
              <option value="All">All Hostels & Blocks</option>
              <option value="C.V. Raman">Boys Hostel A (C.V. Raman Block)</option>
              <option value="Kalam">Boys Hostel B (Kalam Block)</option>
              <option value="Aryabhatta">Boys Hostel C (Aryabhatta Block)</option>
              <option value="Kalpana Chawla">Girls Hostel A (Kalpana Chawla Block)</option>
              <option value="Sarojini Naidu">Girls Hostel B (Sarojini Naidu Block)</option>
            </select>
          </div>

          <div>
            <label className="form-label text-xs">From Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input text-xs py-1.5"
            />
          </div>

          <div>
            <label className="form-label text-xs">To Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input text-xs py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Live Report Preview */}
      <div className="card p-6 space-y-4 shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
              GEC Autonomous College · Official Audit Preview
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedReportObj?.name}</h2>
            <p className="text-xs text-slate-500">Date Range: {startDate} to {endDate} · Target: {hostelFilter}</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            Generated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Dynamic preview table */}
        <div className="table-container max-h-96 overflow-y-auto">
          <table className="data-table">
            <thead>
              {reportType === 'daily_attendance' && (
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Hostel & Block</th>
                  <th>Room</th>
                  <th>Attendance Status</th>
                  <th>Marked By</th>
                </tr>
              )}
              {reportType === 'gate_pass' && (
                <tr>
                  <th>Gate Pass ID</th>
                  <th>Student Name</th>
                  <th>Reason</th>
                  <th>Destination</th>
                  <th>Scheduled Out</th>
                  <th>Expected Return</th>
                  <th>Status</th>
                </tr>
              )}
              {reportType === 'student_movement' && (
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Hostel</th>
                  <th>Pass ID</th>
                  <th>Out Time</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                </tr>
              )}
              {reportType === 'after_7pm_movement' && (
                <tr>
                  <th>Violation</th>
                  <th>Student Name</th>
                  <th>Hostel & Room</th>
                  <th>Pass ID</th>
                  <th>Out Time</th>
                  <th>Approved By</th>
                  <th>Guard Verification</th>
                </tr>
              )}
              {reportType === 'late_return' && (
                <tr>
                  <th>Student Name</th>
                  <th>Hostel</th>
                  <th>Pass ID</th>
                  <th>Scheduled Return</th>
                  <th>Actual Entry</th>
                  <th>Late Calculation</th>
                </tr>
              )}
              {reportType === 'complaint' && (
                <tr>
                  <th>Complaint ID</th>
                  <th>Student Name</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              )}
              {reportType === 'group_complaint' && (
                <tr>
                  <th>Group ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Hostel</th>
                  <th>Joined Boarders</th>
                  <th>Status</th>
                </tr>
              )}
              {reportType === 'security_activity' && (
                <tr>
                  <th>Timestamp</th>
                  <th>Student Name</th>
                  <th>Action</th>
                  <th>Gate Pass ID</th>
                  <th>Security Guard</th>
                  <th>Method</th>
                </tr>
              )}
            </thead>
            <tbody>
              {reportType === 'daily_attendance' &&
                students.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs">{s.id}</td>
                    <td className="font-bold text-slate-800">{s.name}</td>
                    <td>{s.hostel}</td>
                    <td className="font-semibold">{s.room}</td>
                    <td>
                      <Badge variant={s.attendanceToday === 'Present' ? 'green' : s.attendanceToday === 'Absent' ? 'red' : 'purple'}>
                        {s.attendanceToday}
                      </Badge>
                    </td>
                    <td className="text-slate-500 font-mono text-xs">Biometric Turnstiles</td>
                  </tr>
                ))}

              {reportType === 'gate_pass' &&
                gatePasses.map((g) => (
                  <tr key={g.id}>
                    <td className="font-mono font-bold text-blue-700">{g.id}</td>
                    <td className="font-bold">{g.studentName}</td>
                    <td>{g.reason}</td>
                    <td className="truncate max-w-44">{g.destination}</td>
                    <td>{g.outDate} {g.outTime}</td>
                    <td className="font-bold">{g.expectedReturnTime}</td>
                    <td><Badge variant="blue">{g.status}</Badge></td>
                  </tr>
                ))}

              {reportType === 'student_movement' &&
                movements.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-xs">{m.studentId}</td>
                    <td className="font-bold">{m.studentName}</td>
                    <td>{m.hostel}</td>
                    <td className="font-mono text-blue-700">{m.gatePassId}</td>
                    <td className="font-semibold">{m.outTime}</td>
                    <td>{m.expectedReturn}</td>
                    <td>{m.actualReturn || 'Outside'}</td>
                    <td><Badge variant={m.status === 'Outside' ? 'orange' : m.status === 'Overdue' ? 'red' : 'green'}>{m.status}</Badge></td>
                  </tr>
                ))}

              {reportType === 'after_7pm_movement' &&
                movements.filter((m) => m.isAfter7PMExit).map((m) => (
                  <tr key={m.id}>
                    <td><span className="badge-red text-[10px] font-bold">LEFT AFTER 7 PM</span></td>
                    <td className="font-bold">{m.studentName}</td>
                    <td>{m.hostel} - {m.room}</td>
                    <td className="font-mono text-blue-700">{m.gatePassId}</td>
                    <td className="font-bold text-red-600">{m.outTime}</td>
                    <td>{m.approvedBy}</td>
                    <td>{m.exitVerifiedBy || 'Officer K. Jena'}</td>
                  </tr>
                ))}

              {reportType === 'late_return' &&
                movements.filter((m) => m.isAfter7PMReturn || m.lateMinutes).map((m) => (
                  <tr key={m.id}>
                    <td className="font-bold">{m.studentName}</td>
                    <td>{m.hostel} - {m.room}</td>
                    <td className="font-mono text-blue-700">{m.gatePassId}</td>
                    <td>{m.expectedReturn}</td>
                    <td className="font-bold text-slate-800">{m.actualReturn || 'Pending'}</td>
                    <td>
                      <span className="badge-orange text-[10px] font-bold">
                        {m.lateMinutes ? `Late by ${Math.floor(m.lateMinutes / 60)}h ${m.lateMinutes % 60}m` : 'Late Return After 7 PM'}
                      </span>
                    </td>
                  </tr>
                ))}

              {reportType === 'complaint' &&
                complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono font-bold text-blue-700">{c.id}</td>
                    <td className="font-bold">{c.studentName}</td>
                    <td><Badge variant="blue">{c.category}</Badge></td>
                    <td className="truncate max-w-56">{c.subject}</td>
                    <td><span className="font-bold text-xs">{c.priority}</span></td>
                    <td><Badge variant="green">{c.status}</Badge></td>
                  </tr>
                ))}

              {reportType === 'group_complaint' &&
                groupComplaints.map((g) => (
                  <tr key={g.id}>
                    <td className="font-mono font-bold text-indigo-700">{g.id}</td>
                    <td className="font-bold">{g.title}</td>
                    <td><Badge variant="blue">{g.category}</Badge></td>
                    <td>{g.hostel}</td>
                    <td><span className="font-bold text-blue-700">{g.membersCount} students</span></td>
                    <td><Badge variant="purple">{g.status}</Badge></td>
                  </tr>
                ))}

              {reportType === 'security_activity' &&
                securityLogs.map((l) => (
                  <tr key={l.id}>
                    <td className="font-mono text-xs">{l.timestamp}</td>
                    <td className="font-bold">{l.studentName}</td>
                    <td><Badge variant={l.action === 'EXIT' ? 'red' : 'green'}>{l.action}</Badge></td>
                    <td className="font-mono text-blue-700">{l.gatePassId}</td>
                    <td>{l.securityGuardName}</td>
                    <td className="font-mono text-xs">{l.verificationMethod}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
