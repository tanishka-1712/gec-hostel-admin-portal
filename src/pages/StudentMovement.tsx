import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  Download, 
  Eye, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { MovementDetailModal } from '../components/movement/MovementDetailModal';
import { StudentMovement, StudentStatus } from '../types';

export const StudentMovementPage: React.FC = () => {
  const { movements } = useHostel();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [selectedMovement, setSelectedMovement] = useState<StudentMovement | null>(null);

  // Filtered movements
  const filtered = movements.filter((m) => {
    const matchesSearch =
      m.studentName.toLowerCase().includes(search.toLowerCase()) ||
      m.studentId.toLowerCase().includes(search.toLowerCase()) ||
      m.gatePassId.toLowerCase().includes(search.toLowerCase()) ||
      m.destination.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesHostel = hostelFilter === 'All' || m.hostel.includes(hostelFilter);

    return matchesSearch && matchesStatus && matchesHostel;
  });

  const outsideCount = movements.filter((m) => m.status === 'Outside').length;
  const overdueCount = movements.filter((m) => m.status === 'Overdue').length;
  const returnedCount = movements.filter((m) => m.status === 'Returned').length;

  const exportCSV = () => {
    const headers = ['Student ID,Student Name,Hostel,Room,Gate Pass ID,Reason,Destination,Approved By,Out Time,Expected Return,Actual Return,Status'];
    const rows = filtered.map((m) =>
      `"${m.studentId}","${m.studentName}","${m.hostel}","${m.room}","${m.gatePassId}","${m.reason}","${m.destination}","${m.approvedBy}","${m.outTime}","${m.expectedReturn}","${m.actualReturn || ''}","${m.status}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Movement_Register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: StudentStatus, isLate?: boolean) => {
    switch (status) {
      case 'Outside':
        return <Badge variant="orange" icon={<Compass className="w-3 h-3" />}>Outside</Badge>;
      case 'Returned':
        return (
          <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3" />}>
            Returned {isLate ? '(Late)' : ''}
          </Badge>
        );
      case 'Overdue':
        return (
          <Badge variant="red" icon={<AlertTriangle className="w-3 h-3 animate-pulse" />}>
            Overdue
          </Badge>
        );
      case 'Inside':
        return <Badge variant="blue">Inside</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Surveillance Core</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">GEC Hostel Entry/Exit Tracking</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900">Student Exit & Entry Register</h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Real-time tracking of students going outside, expected return times, overdue alarms, and gate security records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="btn-secondary text-xs flex items-center gap-2 py-2.5"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Currently Outside</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{outsideCount + 22}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between border-red-200 bg-red-50/20">
          <div>
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Overdue Alerts</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{overdueCount}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Returned Today</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{returnedCount + 18}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Inside Hostel</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{1000 - (outsideCount + 22)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, student ID, pass ID, destination..."
              className="form-input pl-10 text-xs sm:text-sm py-2.5"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select text-xs py-2.5 w-full md:w-36"
            >
              <option value="All">All Statuses</option>
              <option value="Outside">Outside</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
              <option value="Inside">Inside</option>
            </select>

            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="form-select text-xs py-2.5 w-full md:w-44"
            >
              <option value="All">All Hostels</option>
              <option value="C.V. Raman">Boys - Raman</option>
              <option value="Kalam">Boys - Kalam</option>
              <option value="Aryabhatta">Boys - Aryabhatta</option>
              <option value="Kalpana Chawla">Girls - Kalpana</option>
              <option value="Sarojini Naidu">Girls - Sarojini</option>
            </select>
          </div>
        </div>
      </div>

      {/* 10. STUDENTS GOING OUT DATA TABLE */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Hostel & Room</th>
              <th>Gate Pass ID</th>
              <th>Reason & Destination</th>
              <th>Approved By</th>
              <th>Out Time</th>
              <th>Expected Return</th>
              <th>Actual Return</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-xs text-slate-400">
                  No student movement records matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((mov) => {
                const isLateAfter7 = mov.isAfter7PMReturn || mov.isAfter7PMExit;
                return (
                  <tr
                    key={mov.id}
                    onClick={() => setSelectedMovement(mov)}
                    className="cursor-pointer transition-colors hover:bg-blue-50/60"
                  >
                    <td className="font-mono text-xs font-semibold text-slate-600">
                      {mov.studentId}
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900">{mov.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Roll: {mov.rollNumber}</p>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium text-slate-800 text-xs">{mov.hostel.split('(')[0]}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{mov.room}</p>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {mov.gatePassId}
                      </span>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-xs">{mov.reason}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-44" title={mov.destination}>
                        {mov.destination}
                      </p>
                    </td>
                    <td className="text-xs text-slate-600 max-w-32 truncate" title={mov.approvedBy}>
                      {mov.approvedBy.split('(')[0]}
                    </td>
                    <td className="font-semibold text-slate-800 text-xs">
                      {mov.outTime}
                      {mov.isAfter7PMExit && (
                        <span className="block text-[9px] font-bold text-red-600">
                          ⚠ After 7 PM
                        </span>
                      )}
                    </td>
                    <td className="font-bold text-slate-700 text-xs">
                      {mov.expectedReturn}
                    </td>
                    <td className="font-bold text-xs">
                      {mov.actualReturn ? (
                        <span className="text-slate-800">
                          {mov.actualReturn}
                          {mov.lateMinutes ? (
                            <span className="block text-[9px] font-bold text-orange-600">
                              +{mov.lateMinutes}m late
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">-------</span>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(mov.status, isLateAfter7)}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovement(mov);
                        }}
                        className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Movement Detail Modal */}
      <MovementDetailModal
        movement={selectedMovement}
        isOpen={Boolean(selectedMovement)}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
};
