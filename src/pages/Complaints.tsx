import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  PlusCircle,
  Tag
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';
import { ComplaintDetailModal } from '../components/complaints/ComplaintDetailModal';
import { GroupComplaintDetailModal } from '../components/complaints/GroupComplaintDetailModal';
import { Complaint, GroupComplaint, ComplaintCategory, ComplaintStatus } from '../types';

export const ComplaintsPage: React.FC = () => {
  const { complaints, groupComplaints } = useHostel();

  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedGroupComplaint, setSelectedGroupComplaint] = useState<GroupComplaint | null>(null);

  // Statistics
  const totalIndividual = complaints.length;
  const totalGroup = groupComplaints.length;
  const openCount = complaints.filter((c) => c.status === 'Submitted').length;
  const underReviewCount = complaints.filter((c) => c.status === 'Under Review').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const rejectedCount = complaints.filter((c) => c.status === 'Rejected').length;

  // Filter individual complaints
  const filteredIndividual = complaints.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter group complaints
  const filteredGroup = groupComplaints.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.hostel.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || g.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="orange">Submitted</Badge>;
      case 'Under Review':
        return <Badge variant="blue">Under Review</Badge>;
      case 'In Progress':
        return <Badge variant="purple">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="green">Resolved</Badge>;
      case 'Rejected':
        return <Badge variant="red">Rejected</Badge>;
      case 'Closed':
        return <Badge variant="gray">Closed</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const categories: ComplaintCategory[] = [
    'Room',
    'Hostel',
    'Mess',
    'Water',
    'Electricity',
    'Internet',
    'Cleaning',
    'Security',
    'Maintenance',
    'Other'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Grievance Redressal</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Boarder Welfare & Maintenance Tracking</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <MessageSquareWarning className="w-7 h-7 text-indigo-600" />
            <span>Complaints & Grievances</span>
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Address individual room issues, monitor multi-student group petitions, and track maintenance SLAs.
          </p>
        </div>
      </div>

      {/* 23. MAIN DASHBOARD COMPLAINT METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="card p-3 text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total</span>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{totalIndividual + totalGroup}</p>
        </div>
        <div className="card p-3 text-center border-amber-100 bg-amber-50/20">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Open</span>
          <p className="text-xl font-bold text-amber-700 mt-0.5">{openCount}</p>
        </div>
        <div className="card p-3 text-center border-blue-100 bg-blue-50/20">
          <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Under Review</span>
          <p className="text-xl font-bold text-blue-700 mt-0.5">{underReviewCount}</p>
        </div>
        <div className="card p-3 text-center border-purple-100 bg-purple-50/20">
          <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">In Progress</span>
          <p className="text-xl font-bold text-purple-700 mt-0.5">{inProgressCount}</p>
        </div>
        <div className="card p-3 text-center border-emerald-100 bg-emerald-50/20">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Resolved</span>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{resolvedCount}</p>
        </div>
        <div className="card p-3 text-center border-rose-100 bg-rose-50/20">
          <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider block">Rejected</span>
          <p className="text-xl font-bold text-rose-600 mt-0.5">{rejectedCount}</p>
        </div>
        <div className="card p-3 text-center border-indigo-100 bg-indigo-50/20 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider block">Group Petitions</span>
          <p className="text-xl font-bold text-indigo-700 mt-0.5">{totalGroup}</p>
        </div>
      </div>

      {/* Primary Tab Switcher: Individual vs Group Complaints */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl border">
        <button
          type="button"
          onClick={() => setActiveTab('individual')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'individual'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>24. Individual Complaints</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {complaints.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('group')}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'group'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>25. Group Complaints & Petitions</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {groupComplaints.length}
          </span>
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
              placeholder="Search by ID, subject, title, student name, or location..."
              className="form-input pl-10 text-xs sm:text-sm py-2"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select text-xs py-2 w-full md:w-40"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select text-xs py-2 w-full md:w-36"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 24. INDIVIDUAL COMPLAINTS TAB */}
      {activeTab === 'individual' && (
        <div className="table-container shadow-xs">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Student</th>
                <th>Category</th>
                <th>Subject & Location</th>
                <th>Priority</th>
                <th>Created Date</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndividual.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    No individual complaints match current filters.
                  </td>
                </tr>
              ) : (
                filteredIndividual.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className="cursor-pointer transition-colors hover:bg-blue-50/60"
                  >
                    <td>
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        {c.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{c.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.studentId}</p>
                      </div>
                    </td>
                    <td>
                      <Badge variant="blue">{c.category}</Badge>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-xs">{c.subject}</p>
                      <p className="text-[11px] text-slate-500">{c.hostel.split('(')[0]} · {c.room}</p>
                    </td>
                    <td>
                      <span className={`font-bold text-xs ${
                        c.priority === 'Urgent' ? 'text-red-600' : c.priority === 'High' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{c.createdDate}</td>
                    <td className="text-xs text-slate-700 font-medium truncate max-w-36" title={c.assignedTo}>
                      {c.assignedTo || 'Unassigned'}
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td className="text-[11px] text-slate-500 font-mono">{c.lastUpdated.split(' ')[0]}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(c);
                        }}
                        className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 25. GROUP COMPLAINTS TAB */}
      {activeTab === 'group' && (
        <div className="table-container shadow-xs">
          <table className="data-table">
            <thead>
              <tr>
                <th>Group Complaint ID</th>
                <th>Title</th>
                <th>Created By</th>
                <th>Joined Boarders</th>
                <th>Category</th>
                <th>Hostel & Block</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroup.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    No group petitions matching filters.
                  </td>
                </tr>
              ) : (
                filteredGroup.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => setSelectedGroupComplaint(g)}
                    className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                  >
                    <td>
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {g.id}
                      </span>
                    </td>
                    <td>
                      <p className="font-bold text-slate-900 text-xs">{g.title}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-72">{g.description}</p>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-xs">{g.createdBy.studentName}</p>
                      <p className="text-[10px] text-slate-400">{g.createdBy.room}</p>
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                        <Users className="w-3 h-3" />
                        <span>{g.membersCount} students</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant="blue">{g.category}</Badge>
                    </td>
                    <td>
                      <span className="font-medium text-slate-800 text-xs">{g.block}</span>
                    </td>
                    <td>
                      <span className="font-bold text-xs text-red-600">{g.priority}</span>
                    </td>
                    <td>{getStatusBadge(g.status)}</td>
                    <td className="text-xs text-slate-600">{g.createdDate}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroupComplaint(g);
                        }}
                        className="btn-primary text-xs py-1 px-3 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Petition</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modals */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
      />

      <GroupComplaintDetailModal
        groupComplaint={selectedGroupComplaint}
        isOpen={Boolean(selectedGroupComplaint)}
        onClose={() => setSelectedGroupComplaint(null)}
      />
    </div>
  );
};
