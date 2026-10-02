import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Download, Printer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GatePass } from '../../types';

interface GatePassQRCodeModalProps {
  gatePass: GatePass | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GatePassQRCodeModal: React.FC<GatePassQRCodeModalProps> = ({
  gatePass,
  isOpen,
  onClose
}) => {
  if (!gatePass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorized Gate Pass QR Token"
      subtitle={`Secure digital pass token: ${gatePass.qrToken}`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cryptographically Verified Pass</span>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 shadow-sm flex flex-col items-center">
          <QRCodeSVG
            value={gatePass.qrToken}
            size={200}
            level="H"
            includeMargin={true}
          />
          <span className="mt-3 font-mono font-bold text-sm text-slate-800 tracking-wider">
            {gatePass.qrToken}
          </span>
        </div>

        {/* Pass Details Summary */}
        <div className="w-full bg-slate-50 p-4 rounded-xl text-left text-xs space-y-1.5 border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-500">Student:</span>
            <span className="font-bold text-slate-800">{gatePass.studentName} ({gatePass.studentId})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hostel & Room:</span>
            <span className="font-semibold text-slate-700">{gatePass.hostel} - {gatePass.room}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled Out:</span>
            <span className="font-semibold text-slate-800">{gatePass.outDate} at {gatePass.outTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Expected Return:</span>
            <span className="font-bold text-blue-700">{gatePass.expectedReturnTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Destination:</span>
            <span className="font-medium text-slate-700">{gatePass.destination}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          This QR code is scanned by security turnstile cameras or guard handheld scanners at Gate 1 and Gate 2.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 w-full">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Pass
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-primary text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
