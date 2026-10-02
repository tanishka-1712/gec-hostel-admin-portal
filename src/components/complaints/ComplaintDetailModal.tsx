import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  Lock, 
  Send, 
  AlertCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Complaint, ComplaintStatus } from '../../types';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { updateComplaintStatus } = useHostel();
  const { user } = useAuth();

  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status || 'Submitted');
  const [commentText, setCommentText] = useState<string>('');
  const [isInternal, setIsInternal] = useState<boolean>(true);

  if (!complaint) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && newStatus === complaint.status) return;

    updateComplaintStatus(
      complaint.id,
      newStatus,
      commentText.trim() || undefined,
      isInternal,
      `${user?.name || 'Admin'} (${user?.role || 'Staff'})`
    );

    setCommentText('');
    onClose();
  };

  const steps: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
  const currentStepIndex = steps.indexOf(complaint.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Grievance Record: ${complaint.id}`}
      subtitle={`${complaint.category} Issue reported by ${complaint.studentName}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Status Timeline */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Complaint Resolution Trajectory
          </h4>
          <div className="flex items-center justify-between relative overflow-x-auto py-2">
            {steps.map((st, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={st} className="flex-1 flex flex-col items-center min-w-20 text-center relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] font-semibold ${isCurrent ? 'text-blue-700' : 'text-slate-600'}`}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Student Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Complainant Details
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-800">{complaint.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ID / Roll No:</span>
              <span className="font-mono text-slate-700">{complaint.studentId} / {complaint.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hostel & Room:</span>
              <span className="font-semibold text-slate-800">{complaint.hostel} - {complaint.room}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Exact Location:</span>
              <span className="font-medium text-slate-700">{complaint.location}</span>
            </div>
          </div>

          {/* Grievance Info Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Classification & Priority
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <Badge variant="blue">{complaint.category}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority:</span>
              <span className={`font-bold ${
                complaint.priority === 'Urgent' ? 'text-red-600' : complaint.priority === 'High' ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {complaint.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Technician:</span>
              <span className="font-medium text-slate-800">{complaint.assignedTo || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Logged Date & Time:</span>
              <span className="text-slate-700">{complaint.createdDate} at {complaint.createdTime}</span>
            </div>
          </div>
        </div>

        {/* Complaint Description */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
          <span className="font-bold text-slate-800 text-sm">{complaint.subject}</span>
          <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
            {complaint.description}
          </p>
        </div>

        {/* Resolution Notes if Resolved */}
        {complaint.resolutionNotes && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-900 block mb-1">Resolution Summary:</span>
            <p className="text-emerald-800">{complaint.resolutionNotes}</p>
          </div>
        )}

        {/* Activity & Comment Thread */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Communication & Internal Maintenance Notes
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {complaint.comments.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl text-xs border ${
                  c.isInternal
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{c.authorName}</span>
                    {c.isInternal && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.2 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        Internal Admin Note (Hidden from Student)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                </div>
                <p className="leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Form: Update Status / Add Note */}
        <form onSubmit={handleUpdate} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Update Grievance Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="form-select text-xs py-2"
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Note Visibility:</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="noteVisibility"
                    checked={isInternal}
                    onChange={() => setIsInternal(true)}
                    className="text-blue-600"
                  />
                  <span>Internal Admin Only</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="noteVisibility"
                    checked={!isInternal}
                    onChange={() => setIsInternal(false)}
                    className="text-blue-600"
                  />
                  <span>Visible to Student</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Add Remark / Resolution Note:</label>
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="e.g. Electrician sent to site; part replaced; grievance closed."
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
              Save Updates
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
