import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  FileText, 
  Phone, 
  CheckCircle, 
  XCircle, 
  QrCode, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { GatePass } from '../../types';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface GatePassDetailModalProps {
  gatePass: GatePass | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQR: (gp: GatePass) => void;
}

export const GatePassDetailModal: React.FC<GatePassDetailModalProps> = ({
  gatePass,
  isOpen,
  onClose,
  onOpenQR
}) => {
  const { approveGatePass, rejectGatePass } = useHostel();
  const { user } = useAuth();

  const [notes, setNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectError, setRejectError] = useState<string>('');

  if (!gatePass) return null;

  const handleApprove = () => {
    approveGatePass(gatePass.id, notes, `${user?.name} (${user?.role})`);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setRejectError('Please specify the mandatory rejection reason before proceeding.');
      return;
    }
    rejectGatePass(gatePass.id, rejectionReason.trim(), `${user?.name} (${user?.role})`);
    setIsRejecting(false);
    setRejectionReason('');
    setRejectError('');
    onClose();
  };

  const getStatusBadge = (status: GatePass['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="orange">Pending Approval</Badge>;
      case 'Approved':
        return <Badge variant="green">Approved</Badge>;
      case 'Active':
        return <Badge variant="blue">Active Outside</Badge>;
      case 'Used':
        return <Badge variant="gray">Completed / Used</Badge>;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gate Pass Details: ${gatePass.id}`}
      subtitle={`Requested on ${gatePass.requestedDate} for ${gatePass.reason}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Status & QR Button */}
        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            {getStatusBadge(gatePass.status)}
          </div>
          {gatePass.status !== 'Rejected' && gatePass.status !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => onOpenQR(gatePass)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>View QR Pass</span>
            </button>
          )}
        </div>

        {/* Student Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Student Name</span>
            <p className="font-bold text-slate-800 text-sm">{gatePass.studentName}</p>
            <p className="text-slate-500 font-mono">ID: {gatePass.studentId}</p>
            <p className="text-slate-500 font-mono">Roll: {gatePass.studentRoll}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Hostel Location</span>
            <p className="font-semibold text-slate-800">{gatePass.hostel}</p>
            <p className="text-slate-600">{gatePass.room}</p>
            <div className="mt-2 flex items-center gap-3">
              <a href={`tel:${gatePass.studentPhone}`} className="text-blue-600 flex items-center gap-1 font-medium">
                <Phone className="w-3 h-3" /> Student
              </a>
              <a href={`tel:${gatePass.guardianPhone}`} className="text-blue-600 flex items-center gap-1 font-medium">
                <Phone className="w-3 h-3" /> Guardian
              </a>
            </div>
          </div>
        </div>

        {/* Trip Outing Details */}
        <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 font-medium">Reason for Outing:</span>
              <p className="font-bold text-slate-800 mt-0.5">{gatePass.reason}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Specific Destination:</span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {gatePass.destination}
              </p>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Purpose Detail:</span>
            <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-1 leading-relaxed">
              {gatePass.reasonDetail || 'No additional explanation provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80">
            <div>
              <span className="text-slate-400 block">Out Date</span>
              <p className="font-bold text-slate-800">{gatePass.outDate}</p>
            </div>
            <div>
              <span className="text-slate-400 block">Out Time</span>
              <p className="font-bold text-slate-800">{gatePass.outTime}</p>
            </div>
            <div>
              <span className="text-slate-400 block">Expected Return Date</span>
              <p className="font-bold text-slate-800">{gatePass.expectedReturnDate}</p>
            </div>
            <div>
              <span className="text-slate-400 block">Expected Return Time</span>
              <p className="font-bold text-blue-700">{gatePass.expectedReturnTime}</p>
            </div>
          </div>

          {gatePass.actualExitTime && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
              <span>Actual Exit Time: <strong>{gatePass.actualExitTime}</strong></span>
              <span>Actual Return: <strong>{gatePass.actualReturnTime || 'Still Outside'}</strong></span>
            </div>
          )}
        </div>

        {/* Existing Rejection reason if rejected */}
        {gatePass.rejectionReason && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs">
            <span className="font-bold text-red-900 block mb-1">Rejection Reason:</span>
            <p className="text-red-800">{gatePass.rejectionReason}</p>
          </div>
        )}

        {/* Approval / Rejection Controls for Pending */}
        {gatePass.status === 'Pending' && !isRejecting && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="form-label text-xs">Additional Warden Notes (Optional):</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Parent verified telephonically; return before curfew."
                className="form-input text-xs py-2"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="btn-danger text-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Gate Pass
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="btn-success text-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Gate Pass
              </button>
            </div>
          </div>
        )}

        {/* Rejection Form Input */}
        {gatePass.status === 'Pending' && isRejecting && (
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-red-800 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Mandatory Rejection Justification</span>
            </div>
            <p className="text-red-700 text-[11px]">
              Please state why this gate pass is being rejected. This explanation will be provided to the student and recorded for audits.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setRejectError('');
              }}
              placeholder="e.g. Gate pass rejected because required parent permission document was not provided."
              className="w-full bg-white border border-red-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {rejectError && <p className="text-red-600 font-semibold">{rejectError}</p>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRejecting(false);
                  setRejectError('');
                }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="btn-danger text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
