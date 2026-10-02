import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { GroupComplaint, ComplaintStatus } from '../../types';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface GroupComplaintDetailModalProps {
  groupComplaint: GroupComplaint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupComplaintDetailModal: React.FC<GroupComplaintDetailModalProps> = ({
  groupComplaint,
  isOpen,
  onClose
}) => {
  const { updateGroupComplaintStatus } = useHostel();
  const { user } = useAuth();

  const [status, setStatus] = useState<ComplaintStatus>(groupComplaint?.status || 'Submitted');
  const [remark, setRemark] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');

  if (!groupComplaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGroupComplaintStatus(
      groupComplaint.id,
      status,
      remark.trim() || undefined,
      false,
      `${user?.name || 'Admin'} (${user?.role || 'Office'})`
    );
    setRemark('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Group Grievance: ${groupComplaint.id}`}
      subtitle={`${groupComplaint.title} (${groupComplaint.membersCount} students joined)`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Tab switchers: Details vs Members list */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Grievance Details & Action
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Joined Students ({groupComplaint.membersCount})</span>
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-4 text-xs">
            {/* Summary Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <Badge variant="blue">{groupComplaint.category}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Priority</span>
                <span className="font-bold text-red-600">{groupComplaint.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Hostel & Block</span>
                <span className="font-semibold text-slate-800 truncate block">{groupComplaint.hostel}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Originator</span>
                <span className="font-semibold text-slate-800">{groupComplaint.createdBy.studentName} ({groupComplaint.createdBy.room})</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="font-bold text-slate-800 text-sm">{groupComplaint.title}</span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {groupComplaint.description}
              </p>
            </div>

            {/* Existing Comments */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Administrative Action Log
              </span>
              {groupComplaint.comments.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-800">{c.authorName}</span>
                    <span className="text-slate-400">{c.timestamp}</span>
                  </div>
                  <p className="text-slate-700">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Set Group Status:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                    className="form-select text-xs py-2"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Assignee / Department:</label>
                  <input
                    type="text"
                    defaultValue={groupComplaint.assignedTo || 'Executive Engineer (Civil/Electrical)'}
                    className="form-input text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Add Public Update for all {groupComplaint.membersCount} students:</label>
                <textarea
                  rows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. Tank cleaning team deployed. Water pressure will be restored by 6:00 PM."
                  className="form-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Members List */
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-800">
              <span className="font-semibold">
                {groupComplaint.membersCount} boarders have co-signed and joined this grievance petition.
              </span>
              <span className="bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                Active Petition
              </span>
            </div>

            <div className="table-container max-h-72 overflow-y-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Roll Number</th>
                    <th>Room</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {groupComplaint.members.map((member, i) => (
                    <tr key={member.studentId || i}>
                      <td className="font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        {member.studentName}
                        {i === 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                            Initiator
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs">{member.studentId}</td>
                      <td className="font-mono text-xs">{member.rollNumber}</td>
                      <td className="font-semibold">{member.room}</td>
                      <td className="text-slate-500">{member.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
