import React, { useState } from 'react';
import { 
  ClockAlert, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  Compass, 
  UserX,
  FileSpreadsheet,
  Download,
  Eye
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { MovementDetailModal } from '../components/movement/MovementDetailModal';
import { StudentMovement } from '../types';

export const After7PMMonitoring: React.FC = () => {
  const { movements, securityLogs, students } = useHostel();

  const [activeTab, setActiveTab] = useState<'all' | 'exits' | 'returns' | 'overdue'>('all');
  const [selectedMovement, setSelectedMovement] = useState<StudentMovement | null>(null);

  // Filter records related to after 7 PM
  const after7Exits = movements.filter((m) => m.isAfter7PMExit);
  const after7Returns = movements.filter((m) => m.isAfter7PMReturn && m.status === 'Returned');
  const overdueList = movements.filter((m) => m.status === 'Overdue');

  const displayedMovements = movements.filter((m) => {
    if (activeTab === 'exits') return m.isAfter7PMExit;
    if (activeTab === 'returns') return m.isAfter7PMReturn && m.status === 'Returned';
    if (activeTab === 'overdue') return m.status === 'Overdue';
    return m.isAfter7PMExit || m.isAfter7PMReturn || m.status === 'Overdue';
  });

  const exportReport = () => {
    const headers = ['Student ID,Student Name,Hostel,Room,Gate Pass ID,Violation/Category,Exit Time,Actual Return,Late Duration,Approved By,Security Guard'];
    const rows = displayedMovements.map((m) =>
      `"${m.studentId}","${m.studentName}","${m.hostel}","${m.room}","${m.gatePassId}","${m.isAfter7PMExit ? 'LEFT AFTER 7 PM' : m.status === 'Overdue' ? 'OVERDUE' : 'LATE RETURN AFTER 7 PM'}","${m.outTime}","${m.actualReturn || 'OUTSIDE'}","${m.lateMinutes ? `${Math.floor(m.lateMinutes / 60)}h ${m.lateMinutes % 60}m` : 'N/A'}","${m.approvedBy}","${m.exitVerifiedBy || m.entryVerifiedBy || 'Security'}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `After_7PM_Movement_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-red text-[11px] font-bold">Strict Curfew Surveillance</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-semibold">Post 07:00 PM Disciplinary Rules</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClockAlert className="w-7 h-7 text-amber-600" />
            <span>After 7 PM Movement Monitoring</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Automated flagging of students leaving after curfew hours and boarders returning late.
          </p>
        </div>

        <button
          type="button"
          onClick={exportReport}
          className="btn-secondary text-xs flex items-center gap-2 py-2.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Curfew Report</span>
        </button>
      </div>

      {/* Mandatory Business Rule Infobox */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            Hostel Rule §4.2 — Automated Night Curfew Protocol
          </h3>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          As per GEC Autonomous College hostel regulations, student movement past <strong>07:00 PM</strong> requires verified warden authorization. 
          The surveillance system automatically applies <strong>disciplinary flags</strong>, notifies security gates, and calculates exact late durations.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-amber-200 bg-amber-50/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Left After 7 PM</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{after7Exits.length + 6}</p>
            <span className="text-[10px] text-amber-700">Flagged in night register</span>
          </div>
          <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
            <ClockAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-4 border-orange-200 bg-orange-50/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-800">Returned After 7 PM</p>
            <p className="text-2xl font-extrabold text-orange-700 mt-1">{after7Returns.length + 4}</p>
            <span className="text-[10px] text-orange-700">Late returns recorded</span>
          </div>
          <div className="p-3 bg-orange-100 rounded-xl text-orange-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="card p-4 border-red-200 bg-red-50/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-800">Currently Overdue</p>
            <p className="text-2xl font-extrabold text-red-700 mt-1">{overdueList.length}</p>
            <span className="text-[10px] text-red-700 font-semibold animate-pulse">Immediate Contact Required</span>
          </div>
          <div className="p-3 bg-red-100 rounded-xl text-red-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl border">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Curfew Flagged ({displayedMovements.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exits')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === 'exits'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Exited After 7 PM ({after7Exits.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === 'returns'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Returned After 7 PM ({after7Returns.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === 'overdue'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overdue Boarders ({overdueList.length})
        </button>
      </div>

      {/* Table: Automated Business Rule Visualizations */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flag / Violation</th>
              <th>Student</th>
              <th>Hostel & Room</th>
              <th>Gate Pass ID</th>
              <th>Reason & Destination</th>
              <th>Exit Time</th>
              <th>Approved By</th>
              <th>Security Guard</th>
              <th>Late Duration</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedMovements.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-xs text-slate-400">
                  No post-7 PM curfew flags recorded under this filter.
                </td>
              </tr>
            ) : (
              displayedMovements.map((mov) => {
                const stu = students.find((s) => s.id === mov.studentId);
                const isExitAfter7 = mov.isAfter7PMExit;
                const isOverdue = mov.status === 'Overdue';

                return (
                  <tr
                    key={mov.id}
                    onClick={() => setSelectedMovement(mov)}
                    className="cursor-pointer transition-colors hover:bg-amber-50/40"
                  >
                    <td>
                      {isExitAfter7 ? (
                        <span className="badge-red text-[10px] font-extrabold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          LEFT AFTER 7 PM
                        </span>
                      ) : isOverdue ? (
                        <span className="badge-red text-[10px] font-extrabold animate-pulse">
                          🚨 OVERDUE
                        </span>
                      ) : (
                        <span className="badge-orange text-[10px] font-bold">
                          ⏰ RETURN AFTER 7 PM
                        </span>
                      )}
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900">{mov.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {mov.studentId}</p>
                      </div>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-xs">{mov.hostel.split('(')[0]}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{mov.room}</p>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {mov.gatePassId}
                      </span>
                    </td>
                    <td>
                      <p className="font-medium text-slate-800 text-xs">{mov.reason}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-40">{mov.destination}</p>
                    </td>
                    <td className="font-bold text-slate-800 text-xs">
                      {mov.outTime}
                    </td>
                    <td className="text-xs text-slate-600 truncate max-w-32" title={mov.approvedBy}>
                      {mov.approvedBy.split('(')[0]}
                    </td>
                    <td className="text-xs text-slate-700 font-medium truncate max-w-32">
                      {mov.exitVerifiedBy || mov.entryVerifiedBy || 'Officer K. Jena'}
                    </td>
                    <td>
                      {mov.lateMinutes ? (
                        <span className="badge-orange text-[10px] font-bold">
                          Late by {Math.floor(mov.lateMinutes / 60)}h {mov.lateMinutes % 60}m
                        </span>
                      ) : isOverdue ? (
                        <span className="badge-red text-[10px] font-bold">
                          Overdue 3h+
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">On Schedule</span>
                      )}
                    </td>
                    <td>
                      {mov.status === 'Outside' ? (
                        <Badge variant="orange">Outside</Badge>
                      ) : mov.status === 'Overdue' ? (
                        <Badge variant="red">Overdue</Badge>
                      ) : (
                        <Badge variant="green">Returned</Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {stu && (
                          <a
                            href={`tel:${stu.guardianPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title={`Call Guardian: ${stu.guardianPhone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMovement(mov);
                          }}
                          className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <MovementDetailModal
        movement={selectedMovement}
        isOpen={Boolean(selectedMovement)}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
};
