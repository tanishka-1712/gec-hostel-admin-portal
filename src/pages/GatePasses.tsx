import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  QrCode, 
  Plus, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { GatePassDetailModal } from '../components/gatepass/GatePassDetailModal';
import { GatePassQRCodeModal } from '../components/gatepass/GatePassQRCodeModal';
import { GatePass, GatePassStatus } from '../types';

export const GatePassesPage: React.FC = () => {
  const { gatePasses } = useHostel();

  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);
  const [qrPass, setQrPass] = useState<GatePass | null>(null);

  const tabs: Array<{ key: string; label: string; count?: number }> = [
    { key: 'All', label: 'All Requests' },
    { key: 'Pending', label: 'Pending', count: gatePasses.filter((g) => g.status === 'Pending').length },
    { key: 'Approved', label: 'Approved', count: gatePasses.filter((g) => g.status === 'Approved').length },
    { key: 'Active', label: 'Active Outside', count: gatePasses.filter((g) => g.status === 'Active').length },
    { key: 'Used', label: 'Used / Returned' },
    { key: 'Rejected', label: 'Rejected' },
    { key: 'Expired', label: 'Expired' },
    { key: 'Cancelled', label: 'Cancelled' }
  ];

  const filtered = gatePasses.filter((g) => {
    const matchesSearch =
      g.studentName.toLowerCase().includes(search.toLowerCase()) ||
      g.studentId.toLowerCase().includes(search.toLowerCase()) ||
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.destination.toLowerCase().includes(search.toLowerCase()) ||
      g.reason.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === 'All' || g.status === activeTab;
    const matchesHostel = hostelFilter === 'All' || g.hostel.includes(hostelFilter);

    return matchesSearch && matchesTab && matchesHostel;
  });

  const getStatusBadge = (status: GatePassStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="orange">Pending</Badge>;
      case 'Approved':
        return <Badge variant="green">Approved</Badge>;
      case 'Active':
        return <Badge variant="blue">Active Outside</Badge>;
      case 'Used':
        return <Badge variant="gray">Used / In</Badge>;
      case 'Rejected':
        return <Badge variant="red">Rejected</Badge>;
      case 'Expired':
        return <Badge variant="red">Expired</Badge>;
      case 'Cancelled':
        return <Badge variant="gray">Cancelled</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const exportCSV = () => {
    const headers = ['Gate Pass ID,Student ID,Student Name,Hostel,Room,Reason,Destination,Requested Date,Out Time,Return Time,Status,Approved By'];
    const rows = filtered.map((g) =>
      `"${g.id}","${g.studentId}","${g.studentName}","${g.hostel}","${g.room}","${g.reason}","${g.destination}","${g.requestedDate}","${g.outTime}","${g.expectedReturnTime}","${g.status}","${g.approvedBy || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gate_Passes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Surveillance Pass System</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Warden Clearance & Cryptographic Tokens</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900">Gate Pass Management</h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Review boarder leave and outing requests, issue secure QR tokens, and maintain clearance logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 sm:px-4 rounded-xl border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                tab.key === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
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
              placeholder="Search by Gate Pass ID, student name, roll number, destination..."
              className="form-input pl-10 text-xs sm:text-sm py-2.5"
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="form-select text-xs py-2.5"
            >
              <option value="All">All Hostels & Blocks</option>
              <option value="C.V. Raman">Boys Hostel A (C.V. Raman)</option>
              <option value="Kalam">Boys Hostel B (Kalam)</option>
              <option value="Aryabhatta">Boys Hostel C (Aryabhatta)</option>
              <option value="Kalpana Chawla">Girls Hostel A (Kalpana Chawla)</option>
              <option value="Sarojini Naidu">Girls Hostel B (Sarojini Naidu)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 15. GATE PASS TABLE */}
      <div className="table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>Gate Pass ID</th>
              <th>Student</th>
              <th>Hostel & Room</th>
              <th>Reason</th>
              <th>Destination</th>
              <th>Requested Date</th>
              <th>Out Time</th>
              <th>Return Time</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                  No gate pass records found under current filter.
                </td>
              </tr>
            ) : (
              filtered.map((gp) => (
                <tr
                  key={gp.id}
                  onClick={() => setSelectedGatePass(gp)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/60"
                >
                  <td>
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      {gp.id}
                    </span>
                  </td>
                  <td>
                    <div>
                      <p className="font-bold text-slate-900">{gp.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Roll: {gp.studentRoll}</p>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-slate-800 text-xs">{gp.hostel.split('(')[0]}</p>
                    <p className="text-[11px] text-slate-500">{gp.room}</p>
                  </td>
                  <td>
                    <span className="font-semibold text-slate-800 text-xs">{gp.reason}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 truncate max-w-44 block" title={gp.destination}>
                      {gp.destination}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600">{gp.requestedDate}</td>
                  <td className="font-semibold text-slate-800 text-xs">{gp.outDate} {gp.outTime}</td>
                  <td className="font-bold text-blue-700 text-xs">{gp.expectedReturnTime}</td>
                  <td>{getStatusBadge(gp.status)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {gp.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedGatePass(gp)}
                            className="btn-success text-xs py-1 px-2.5"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedGatePass(gp)}
                            className="btn-danger text-xs py-1 px-2.5"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          {gp.status !== 'Rejected' && gp.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => setQrPass(gp)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="View QR Token"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedGatePass(gp)}
                            className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <GatePassDetailModal
        gatePass={selectedGatePass}
        isOpen={Boolean(selectedGatePass)}
        onClose={() => setSelectedGatePass(null)}
        onOpenQR={(gp) => {
          setSelectedGatePass(null);
          setQrPass(gp);
        }}
      />

      <GatePassQRCodeModal
        gatePass={qrPass}
        isOpen={Boolean(qrPass)}
        onClose={() => setQrPass(null)}
      />
    </div>
  );
};
