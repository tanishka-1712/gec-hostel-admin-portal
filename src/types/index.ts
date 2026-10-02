export type Role = 'ADMIN' | 'PRINCIPAL' | 'WARDEN' | 'HOD';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  department: string;
  avatar?: string;
  phone: string;
}

export type HostelBlock = 
  | 'Boys Hostel A (C.V. Raman Block)'
  | 'Boys Hostel B (Kalam Block)'
  | 'Boys Hostel C (Aryabhatta Block)'
  | 'Girls Hostel A (Kalpana Chawla Block)'
  | 'Girls Hostel B (Sarojini Naidu Block)';

export type StudentStatus = 'Inside' | 'Outside' | 'Returned' | 'Overdue';

export interface Student {
  id: string; // STU20260045
  name: string;
  rollNumber: string; // 2201211045
  branch: string;
  year: string;
  hostel: HostelBlock;
  room: string;
  bed: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  currentStatus: StudentStatus;
  photoUrl?: string;
  activeGatePassId?: string;
  attendanceToday: 'Present' | 'Absent' | 'Leave';
}

export type GatePassStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Rejected' 
  | 'Active' 
  | 'Expired' 
  | 'Used' 
  | 'Cancelled';

export type GatePassReason = 
  | 'Medical Appointment' 
  | 'Home Visit' 
  | 'Market / Essentials' 
  | 'Coaching / Tuition' 
  | 'Academic Project' 
  | 'Emergency' 
  | 'Other';

export interface GatePass {
  id: string; // e.g. GP-2026-00125
  studentId: string;
  studentName: string;
  studentRoll: string;
  hostel: HostelBlock;
  room: string;
  studentPhone: string;
  guardianPhone: string;
  reason: GatePassReason;
  reasonDetail: string;
  destination: string;
  requestedDate: string;
  outDate: string;
  outTime: string; // e.g. "06:15 PM"
  expectedReturnDate: string;
  expectedReturnTime: string; // e.g. "09:00 PM"
  actualExitTime?: string;
  actualReturnTime?: string;
  status: GatePassStatus;
  approvedBy?: string;
  approvedDate?: string;
  approvedTime?: string;
  rejectionReason?: string;
  qrToken: string; // secure token e.g. GP-2026-8F92X71ABC
  additionalNotes?: string;
  isAfter7PMExit?: boolean;
  isAfter7PMReturn?: boolean;
}

export interface StudentMovement {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  hostel: HostelBlock;
  room: string;
  gatePassId: string;
  reason: string;
  destination: string;
  approvedBy: string;
  approvalDate: string;
  approvalTime: string;
  outTime: string;
  expectedReturn: string;
  actualReturn?: string;
  status: StudentStatus;
  isAfter7PMExit: boolean;
  isAfter7PMReturn: boolean;
  lateMinutes?: number;
  exitVerifiedBy?: string;
  exitVerificationTime?: string;
  entryVerifiedBy?: string;
  entryVerificationTime?: string;
}

export type VerificationMethod = 'QR_SCAN' | 'MANUAL' | 'OTHER';
export type SecurityAction = 'EXIT' | 'ENTRY';

export interface SecurityLog {
  id: string;
  studentId: string;
  studentName: string;
  gatePassId: string;
  action: SecurityAction;
  timestamp: string; // ISO or formatted e.g. "2026-10-02 19:12:00"
  timeFormatted: string; // "07:12 PM"
  securityGuardId: string;
  securityGuardName: string;
  verificationMethod: VerificationMethod;
  notes?: string;
  isAfter7PM?: boolean;
  isLate?: boolean;
  lateDuration?: string; // "1 hour 25 minutes"
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Late' | 'Not Marked';

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  hostel: HostelBlock;
  block: string;
  room: string;
  session: 'Morning' | 'Evening';
  status: AttendanceStatus;
  attendanceTime: string;
  markedBy: string;
  syncedAt?: string;
}

export type ComplaintCategory = 
  | 'Room' 
  | 'Hostel' 
  | 'Mess' 
  | 'Water' 
  | 'Electricity' 
  | 'Internet' 
  | 'Cleaning' 
  | 'Security' 
  | 'Maintenance' 
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ComplaintStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Rejected' 
  | 'Closed';

export interface ComplaintComment {
  id: string;
  authorName: string;
  authorRole: 'Admin' | 'Warden' | 'Student' | 'Technician';
  timestamp: string;
  content: string;
  isInternal: boolean; // Students do NOT see internal admin notes
}

export interface Complaint {
  id: string; // e.g. CMP-2026-0034
  studentId: string;
  studentName: string;
  rollNumber: string;
  hostel: HostelBlock;
  room: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  location: string;
  priority: ComplaintPriority;
  createdDate: string;
  createdTime: string;
  assignedTo?: string;
  status: ComplaintStatus;
  lastUpdated: string;
  attachments?: string[];
  comments: ComplaintComment[];
  resolutionNotes?: string;
}

export interface GroupComplaintMember {
  studentId: string;
  studentName: string;
  rollNumber: string;
  room: string;
  joinedDate: string;
}

export interface GroupComplaint {
  id: string; // e.g. GRP-2026-00027
  title: string;
  category: ComplaintCategory;
  hostel: HostelBlock;
  block: string;
  createdBy: {
    studentId: string;
    studentName: string;
    room: string;
  };
  membersCount: number;
  members: GroupComplaintMember[];
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdDate: string;
  assignedTo?: string;
  description: string;
  comments: ComplaintComment[];
  resolutionNotes?: string;
}

export type NoticeCategory = 
  | 'General' 
  | 'Hostel' 
  | 'Mess' 
  | 'Maintenance' 
  | 'Emergency' 
  | 'Event' 
  | 'Discipline';

export interface Notice {
  id: string;
  title: string;
  category: NoticeCategory;
  description: string;
  priority: 'Urgent' | 'High' | 'Normal';
  publishDate: string;
  expiryDate: string;
  status: 'Published' | 'Scheduled' | 'Draft';
  author: string;
  attachmentName?: string;
  attachmentUrl?: string;
  targetAudience: 'All Hostels' | 'Boys Hostels' | 'Girls Hostels' | 'Specific Block';
}

export interface HostelEvent {
  id: string;
  eventName: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  image?: string;
  registrationRequired: boolean;
  maximumParticipants: number;
  currentRegistrations: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'GATE_PASS' | 'STUDENT_MOVEMENT' | 'AFTER_7PM' | 'COMPLAINT' | 'ATTENDANCE_SYNC' | 'SECURITY';
  timestamp: string;
  read: boolean;
  link?: string;
  badge?: string;
}
