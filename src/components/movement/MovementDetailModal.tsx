import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Shield, 
  User, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Phone,
  Building
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StudentMovement } from '../../types';
import { useHostel } from '../../context/HostelContext';

interface MovementDetailModalProps {
  movement: StudentMovement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  movement,
  isOpen,
  onClose
}) => {
  const { students, gatePasses } = useHostel();

  if (!movement) return null;

  const student = students.find((s) => s.id === movement.studentId);
  const gatePass = gatePasses.find((g) => g.id === movement.gatePassId);

  // Status checks for timeline
  const isRequested = true;
  const isApproved = Boolean(movement.approvedBy);
  const isExited = Boolean(movement.outTime);
  const isReturned = movement.status === 'Returned' || Boolean(movement.actualReturn);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Movement & Exit History"
      subtitle={`Complete gate pass trajectory for ${movement.studentName} (${movement.studentId})`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Urgent Warning if After 7 PM exit or overdue */}
        {movement.isAfter7PMExit && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                ⚠ Student Left After 7:00 PM
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Exited hostel premises at <strong>{movement.outTime}</strong>. Late movement flagged in central register.
              </p>
            </div>
          </div>
        )}

        {movement.status === 'Overdue' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                🚨 Immediate Action Required: Overdue Student
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                Expected return was <strong>{movement.expectedReturn}</strong>. Student has not logged return through turnstiles.
              </p>
            </div>
          </div>
        )}

        {/* Visual Movement Timeline */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Movement Lifecycle Timeline
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1: Requested */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">1. Requested</span>
              </div>
              <p className="text-[11px] text-slate-500">{gatePass?.requestedDate || movement.approvalDate}</p>
              <p className="text-[10px] text-slate-400">Via Student App</p>
            </div>

            {/* Step 2: Approved */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">2. Approved</span>
              </div>
              <p className="text-[11px] text-slate-500">{movement.approvalTime}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-full" title={movement.approvedBy}>
                {movement.approvedBy.split('(')[0]}
              </p>
            </div>

            {/* Step 3: Exited */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  isExited ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">3. Exited</span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold">{movement.outTime}</p>
              <p className="text-[10px] text-slate-400">{movement.exitVerifiedBy || 'Gate Guard'}</p>
            </div>

            {/* Step 4: Returned */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  isReturned ? 'bg-emerald-100 text-emerald-700' : movement.status === 'Overdue' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-200 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">4. Returned</span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold">
                {movement.actualReturn || (movement.status === 'Overdue' ? 'OVERDUE' : 'Pending Return')}
              </p>
              <p className="text-[10px] text-slate-400">
                Exp: {movement.expectedReturn}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Grid: Student Information & Gate Pass Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Student Information */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Student Profile
            </h4>

            <div className="flex items-center gap-3.5">
              <img
                src={student?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={movement.studentName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-2xs"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{movement.studentName}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {movement.studentId}</p>
                <p className="text-xs text-slate-500 font-mono">Roll: {movement.rollNumber}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hostel & Block:</span>
                <span className="font-semibold text-slate-800 text-right">{movement.hostel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Room:</span>
                <span className="font-semibold text-slate-800">{movement.room}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student Phone:</span>
                <a href={`tel:${student?.phone}`} className="font-semibold text-blue-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {student?.phone || 'N/A'}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Parent / Guardian:</span>
                <a href={`tel:${student?.guardianPhone}`} className="font-semibold text-blue-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {student?.guardianPhone || 'N/A'}
                </a>
              </div>
            </div>
          </div>

          {/* Card: Gate Pass Details */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Gate Pass Details
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Gate Pass ID:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {movement.gatePassId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="font-semibold text-slate-800">{movement.reason}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Destination:</span>
                <span className="font-semibold text-slate-800 text-right">{movement.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Approved By:</span>
                <span className="font-semibold text-slate-800">{movement.approvedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Approval Time:</span>
                <span className="text-slate-700">{movement.approvalDate} at {movement.approvalTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expected Return:</span>
                <span className="font-bold text-slate-900">{movement.expectedReturn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Actual Return:</span>
                <span className="font-bold text-slate-900">{movement.actualReturn || 'Not Yet Returned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Verification Information */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Security Guard Verification Record
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Exit Gate Verification</span>
              <p className="font-semibold text-slate-800">
                Verified By: <span className="text-blue-700">{movement.exitVerifiedBy || 'Security Desk'}</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                Timestamp: <strong>{movement.exitVerificationTime || movement.outTime}</strong>
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Entry Gate Verification</span>
              <p className="font-semibold text-slate-800">
                Verified By: <span className="text-emerald-700">{movement.entryVerifiedBy || (movement.actualReturn ? 'Security Desk' : 'Pending')}</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                Timestamp: <strong>{movement.entryVerificationTime || movement.actualReturn || 'Pending'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
