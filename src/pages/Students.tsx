import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Building2, 
  Eye, 
  Download, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  UserCheck
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Student, StudentStatus } from '../types';

export const StudentsPage: React.FC = () => {
  const { students, movements, gatePasses } = useHostel();

  const [search, setSearch] = useState<string>('');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.room.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase());

    const matchesHostel = hostelFilter === 'All' || s.hostel.includes(hostelFilter);
    const matchesStatus = statusFilter === 'All' || s.currentStatus === statusFilter;

    return matchesSearch && matchesHostel && matchesStatus;
  });

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'Inside':
        return <Badge variant="blue">Inside Hostel</Badge>;
      case 'Outside':
        return <Badge variant="orange" icon={<Compass className="w-3 h-3" />}>Outside</Badge>;
      case 'Returned':
        return <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3" />}>Returned</Badge>;
      case 'Overdue':
        return <Badge variant="red" icon={<AlertTriangle className="w-3 h-3 animate-pulse" />}>Overdue</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const exportCSV = () => {
    const headers = ['Student ID,Name,Roll Number,Branch,Year,Hostel,Room,Bed,Phone,Guardian Name,Guardian Phone,Status,Attendance Today'];
    const rows = filtered.map((s) =>
      `"${s.id}","${s.name}","${s.rollNumber}","${s.branch}","${s.year}","${s.hostel}","${s.room}","${s.bed}","${s.phone}","${s.guardianName}","${s.guardianPhone}","${s.currentStatus}","${s.attendanceToday}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hostel_Students_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Resident Roster</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Boarder Directory & Room Allocation</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Hostel Students Directory</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Comprehensive registry of all resident boarders across CV Raman, Kalam, Aryabhatta and Girls blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Boarder List</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, ID, branch, or room..."
              className="form-input pl-10 text-xs sm:text-sm py-2"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="form-select text-xs py-2 w-full md:w-48"
            >
              <option value="All">All Hostels & Blocks</option>
              <option value="C.V. Raman">Boys - C.V. Raman</option>
              <option value="Kalam">Boys - Kalam</option>
              <option value="Aryabhatta">Boys - Aryabhatta</option>
              <option value="Kalpana Chawla">Girls - Kalpana Chawla</option>
              <option value="Sarojini Naidu">Girls - Sarojini Naidu</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select text-xs py-2 w-full md:w-36"
            >
              <option value="All">All Statuses</option>
              <option value="Inside">Inside</option>
              <option value="Outside">Outside</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Hostel & Room</th>
              <th>Academic Branch</th>
              <th>Student Contact</th>
              <th>Parent / Guardian</th>
              <th>Today's Attendance</th>
              <th>Current Movement</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                  No student records match search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/60"
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={s.photoUrl}
                        alt={s.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {s.id} · Roll: {s.rollNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-semibold text-slate-800 text-xs">{s.hostel.split('(')[0]}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{s.room} ({s.bed})</p>
                  </td>
                  <td>
                    <p className="text-xs font-medium text-slate-700">{s.branch}</p>
                    <p className="text-[10px] text-slate-400">{s.year}</p>
                  </td>
                  <td>
                    <a
                      href={`tel:${s.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {s.phone}
                    </a>
                  </td>
                  <td>
                    <p className="text-xs font-medium text-slate-800">{s.guardianName}</p>
                    <a
                      href={`tel:${s.guardianPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      {s.guardianPhone}
                    </a>
                  </td>
                  <td>
                    <Badge variant={s.attendanceToday === 'Present' ? 'green' : s.attendanceToday === 'Absent' ? 'red' : 'purple'}>
                      {s.attendanceToday}
                    </Badge>
                  </td>
                  <td>
                    {getStatusBadge(s.currentStatus)}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(s);
                      }}
                      className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={`Boarder Profile: ${selectedStudent.name}`}
          subtitle={`${selectedStudent.hostel} · ${selectedStudent.room}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <img
                src={selectedStudent.photoUrl}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm"
              />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-slate-500 font-mono">ID: {selectedStudent.id} | Roll: {selectedStudent.rollNumber}</p>
                <p className="font-semibold text-slate-700">{selectedStudent.branch} · {selectedStudent.year}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hostel Room Details</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hostel:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.hostel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room & Bed:</span>
                  <span className="font-bold text-blue-700">{selectedStudent.room} ({selectedStudent.bed})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Movement:</span>
                  {getStatusBadge(selectedStudent.currentStatus)}
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Guardian Verification</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guardian Name:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.guardianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guardian Phone:</span>
                  <a href={`tel:${selectedStudent.guardianPhone}`} className="text-blue-600 font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedStudent.guardianPhone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Mobile:</span>
                  <a href={`tel:${selectedStudent.phone}`} className="text-blue-600 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedStudent.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
