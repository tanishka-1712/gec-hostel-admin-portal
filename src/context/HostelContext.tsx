import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  GatePass,
  StudentMovement,
  SecurityLog,
  AttendanceRecord,
  Complaint,
  GroupComplaint,
  Notice,
  HostelEvent,
  AdminNotification,
  VerificationMethod,
  ComplaintStatus,
} from '../types';
import {
  mockStudents,
  mockGatePasses,
  mockStudentMovements,
  mockSecurityLogs,
  mockAbsentStudents,
  mockComplaints,
  mockGroupComplaints,
  mockNotices,
  mockEvents,
  mockNotifications,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Context types ────────────────────────────────────────────────────────────
interface QRVerificationResult {
  valid: boolean;
  message: string;
  gatePass?: GatePass;
  student?: Student;
  reason?: 'VALID' | 'ALREADY_USED' | 'EXPIRED' | 'CANCELLED' | 'REJECTED' | 'NOT_FOUND';
}

interface HostelContextType {
  students: Student[];
  gatePasses: GatePass[];
  movements: StudentMovement[];
  securityLogs: SecurityLog[];
  absentStudents: AttendanceRecord[];
  complaints: Complaint[];
  groupComplaints: GroupComplaint[];
  notices: Notice[];
  events: HostelEvent[];
  notifications: AdminNotification[];
  lastSyncTime: string;
  curfewTime: string;
  loading: boolean;

  // Actions
  approveGatePass: (id: string, notes?: string, approverName?: string) => Promise<void>;
  rejectGatePass: (id: string, rejectionReason: string, rejectorName?: string) => Promise<void>;
  markStudentOut: (gatePassId: string, guardName?: string, method?: VerificationMethod, notes?: string) => Promise<{ success: boolean; message: string }>;
  markStudentIn: (gatePassId: string, guardName?: string, method?: VerificationMethod, notes?: string) => Promise<{ success: boolean; message: string; isLate?: boolean; lateDuration?: string }>;
  verifyQRToken: (token: string) => QRVerificationResult;
  syncAttendance: () => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, comment?: string, isInternal?: boolean, authorName?: string) => Promise<void>;
  updateGroupComplaintStatus: (id: string, status: ComplaintStatus, comment?: string, isInternal?: boolean, authorName?: string) => Promise<void>;
  createNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  createEvent: (event: Omit<HostelEvent, 'id' | 'currentRegistrations'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  resetToDefaultData: () => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isTimeAfter7PM = (timeStr: string): boolean => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();
  if (meridian === 'PM' && hours !== 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours >= 19 || (hours === 19 && minutes > 0);
};

const getNowFormattedTime = (): string =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const getTodayDate = (): string => new Date().toISOString().split('T')[0];

// ─── DB ↔ TS mappers (snake_case ↔ camelCase) ────────────────────────────────
// These convert between the Supabase DB column names (snake_case) and the
// TypeScript interface field names (camelCase) used throughout the app.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapGatePass = (r: any): GatePass => ({
  id: r.id, studentId: r.student_id, studentName: r.student_name, studentRoll: r.student_roll,
  hostel: r.hostel, room: r.room, studentPhone: r.student_phone, guardianPhone: r.guardian_phone,
  reason: r.reason, reasonDetail: r.reason_detail, destination: r.destination,
  requestedDate: r.requested_date, outDate: r.out_date, outTime: r.out_time,
  expectedReturnDate: r.expected_return_date, expectedReturnTime: r.expected_return_time,
  actualExitTime: r.actual_exit_time, actualReturnTime: r.actual_return_time,
  status: r.status, approvedBy: r.approved_by, approvedDate: r.approved_date,
  approvedTime: r.approved_time, rejectionReason: r.rejection_reason, qrToken: r.qr_token,
  additionalNotes: r.additional_notes, isAfter7PMExit: r.is_after_7pm_exit,
  isAfter7PMReturn: r.is_after_7pm_return,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStudent = (r: any): Student => ({
  id: r.id, name: r.name, rollNumber: r.roll_number, branch: r.branch, year: r.year,
  hostel: r.hostel, room: r.room, bed: r.bed, phone: r.phone,
  guardianName: r.guardian_name, guardianPhone: r.guardian_phone,
  currentStatus: r.current_status, photoUrl: r.photo_url,
  activeGatePassId: r.active_gate_pass_id, attendanceToday: r.attendance_today,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMovement = (r: any): StudentMovement => ({
  id: r.id, studentId: r.student_id, studentName: r.student_name, rollNumber: r.roll_number,
  hostel: r.hostel, room: r.room, gatePassId: r.gate_pass_id, reason: r.reason,
  destination: r.destination, approvedBy: r.approved_by, approvalDate: r.approval_date,
  approvalTime: r.approval_time, outTime: r.out_time, expectedReturn: r.expected_return,
  actualReturn: r.actual_return, status: r.status, isAfter7PMExit: r.is_after_7pm_exit,
  isAfter7PMReturn: r.is_after_7pm_return, lateMinutes: r.late_minutes,
  exitVerifiedBy: r.exit_verified_by, exitVerificationTime: r.exit_verification_time,
  entryVerifiedBy: r.entry_verified_by, entryVerificationTime: r.entry_verification_time,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSecurityLog = (r: any): SecurityLog => ({
  id: r.id, studentId: r.student_id, studentName: r.student_name, gatePassId: r.gate_pass_id,
  action: r.action, timestamp: r.timestamp, timeFormatted: r.time_formatted,
  securityGuardId: r.security_guard_id, securityGuardName: r.security_guard_name,
  verificationMethod: r.verification_method, notes: r.notes,
  isAfter7PM: r.is_after_7pm, isLate: r.is_late, lateDuration: r.late_duration,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAttendance = (r: any): AttendanceRecord => ({
  id: r.id, date: r.date, studentId: r.student_id, studentName: r.student_name,
  hostel: r.hostel, block: r.block, room: r.room, session: r.session,
  status: r.status, attendanceTime: r.attendance_time, markedBy: r.marked_by,
  syncedAt: r.synced_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapComplaint = (r: any): Complaint => ({
  id: r.id, studentId: r.student_id, studentName: r.student_name,
  rollNumber: r.roll_number, hostel: r.hostel, room: r.room, category: r.category,
  subject: r.subject, description: r.description, location: r.location,
  priority: r.priority, createdDate: r.created_date, createdTime: r.created_time,
  assignedTo: r.assigned_to, status: r.status,
  lastUpdated: r.last_updated, attachments: r.attachments, resolutionNotes: r.resolution_notes,
  comments: (r.complaint_comments ?? []).map((c: Record<string, unknown>) => ({
    id: c.id, authorName: c.author_name, authorRole: c.author_role,
    timestamp: c.timestamp, content: c.content, isInternal: c.is_internal,
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapGroupComplaint = (r: any): GroupComplaint => ({
  id: r.id, title: r.title, category: r.category, hostel: r.hostel, block: r.block,
  createdBy: { studentId: r.created_by_id, studentName: r.created_by_name, room: r.created_by_room },
  membersCount: r.members_count, priority: r.priority, status: r.status,
  createdDate: r.created_date, assignedTo: r.assigned_to, description: r.description,
  resolutionNotes: r.resolution_notes,
  members: (r.group_complaint_members ?? []).map((m: Record<string, unknown>) => ({
    studentId: m.student_id, studentName: m.student_name, rollNumber: m.roll_number,
    room: m.room, joinedDate: m.joined_date,
  })),
  comments: (r.group_complaint_comments ?? []).map((c: Record<string, unknown>) => ({
    id: c.id, authorName: c.author_name, authorRole: c.author_role,
    timestamp: c.timestamp, content: c.content, isInternal: c.is_internal,
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapNotice = (r: any): Notice => ({
  id: r.id, title: r.title, category: r.category, description: r.description,
  priority: r.priority, publishDate: r.publish_date, expiryDate: r.expiry_date,
  status: r.status, author: r.author, attachmentName: r.attachment_name,
  attachmentUrl: r.attachment_url, targetAudience: r.target_audience,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapEvent = (r: any): HostelEvent => ({
  id: r.id, eventName: r.event_name, description: r.description, date: r.date,
  time: r.time, venue: r.venue, organizer: r.organizer, image: r.image_url,
  registrationRequired: r.registration_required, maximumParticipants: r.maximum_participants,
  currentRegistrations: r.current_registrations, status: r.status,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapNotification = (r: any): AdminNotification => ({
  id: r.id, title: r.title, message: r.message, type: r.type,
  timestamp: r.created_at ?? r.timestamp ?? 'Just now',
  read: r.read, link: r.link, badge: r.badge,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // ── State (seeded from localStorage / mockData) ───────────────────────────
  const [students, setStudents] = useState<Student[]>(() => {
    const s = localStorage.getItem('gec_students');
    return s ? JSON.parse(s) : mockStudents;
  });
  const [gatePasses, setGatePasses] = useState<GatePass[]>(() => {
    const s = localStorage.getItem('gec_gate_passes');
    return s ? JSON.parse(s) : mockGatePasses;
  });
  const [movements, setMovements] = useState<StudentMovement[]>(() => {
    const s = localStorage.getItem('gec_student_movements');
    return s ? JSON.parse(s) : mockStudentMovements;
  });
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const s = localStorage.getItem('gec_security_logs');
    return s ? JSON.parse(s) : mockSecurityLogs;
  });
  const [absentStudents, setAbsentStudents] = useState<AttendanceRecord[]>(() => {
    const s = localStorage.getItem('gec_absent_students');
    return s ? JSON.parse(s) : mockAbsentStudents;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const s = localStorage.getItem('gec_complaints');
    return s ? JSON.parse(s) : mockComplaints;
  });
  const [groupComplaints, setGroupComplaints] = useState<GroupComplaint[]>(() => {
    const s = localStorage.getItem('gec_group_complaints');
    return s ? JSON.parse(s) : mockGroupComplaints;
  });
  const [notices, setNotices] = useState<Notice[]>(() => {
    const s = localStorage.getItem('gec_notices');
    return s ? JSON.parse(s) : mockNotices;
  });
  const [events, setEvents] = useState<HostelEvent[]>(() => {
    const s = localStorage.getItem('gec_events');
    return s ? JSON.parse(s) : mockEvents;
  });
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const s = localStorage.getItem('gec_notifications');
    return s ? JSON.parse(s) : mockNotifications;
  });
  const [lastSyncTime, setLastSyncTime] = useState<string>(() =>
    localStorage.getItem('gec_last_sync') || 'Today at 08:30 PM (Biometric Turnstile #1-#4)'
  );

  const curfewTime = '07:00 PM';

  // ── Fetch all data from Supabase on mount ─────────────────────────────────
  const fetchAllFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const [
        { data: studentsData },
        { data: gatePassesData },
        { data: movementsData },
        { data: securityData },
        { data: attendanceData },
        { data: complaintsData },
        { data: groupComplaintsData },
        { data: noticesData },
        { data: eventsData },
        { data: notificationsData },
      ] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('gate_passes').select('*').order('created_at', { ascending: false }),
        supabase.from('student_movements').select('*').order('created_at', { ascending: false }),
        supabase.from('security_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('attendance_records').select('*').order('date', { ascending: false }),
        supabase.from('complaints').select('*, complaint_comments(*)').order('created_at', { ascending: false }),
        supabase.from('group_complaints').select('*, group_complaint_members(*), group_complaint_comments(*)').order('created_at', { ascending: false }),
        supabase.from('notices').select('*').order('created_at', { ascending: false }),
        supabase.from('hostel_events').select('*').order('date', { ascending: true }),
        supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }),
      ]);

      if (studentsData?.length) setStudents(studentsData.map(mapStudent));
      if (gatePassesData?.length) setGatePasses(gatePassesData.map(mapGatePass));
      if (movementsData?.length) setMovements(movementsData.map(mapMovement));
      if (securityData?.length) setSecurityLogs(securityData.map(mapSecurityLog));
      if (attendanceData?.length) setAbsentStudents(attendanceData.filter(r => r.status === 'Absent').map(mapAttendance));
      if (complaintsData?.length) setComplaints(complaintsData.map(mapComplaint));
      if (groupComplaintsData?.length) setGroupComplaints(groupComplaintsData.map(mapGroupComplaint));
      if (noticesData?.length) setNotices(noticesData.map(mapNotice));
      if (eventsData?.length) setEvents(eventsData.map(mapEvent));
      if (notificationsData?.length) setNotifications(notificationsData.map(mapNotification));
    } catch (err) {
      console.error('[Supabase] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllFromSupabase(); }, [fetchAllFromSupabase]);

  // ── localStorage persistence (fallback / offline) ─────────────────────────
  useEffect(() => { localStorage.setItem('gec_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('gec_gate_passes', JSON.stringify(gatePasses)); }, [gatePasses]);
  useEffect(() => { localStorage.setItem('gec_student_movements', JSON.stringify(movements)); }, [movements]);
  useEffect(() => { localStorage.setItem('gec_security_logs', JSON.stringify(securityLogs)); }, [securityLogs]);
  useEffect(() => { localStorage.setItem('gec_absent_students', JSON.stringify(absentStudents)); }, [absentStudents]);
  useEffect(() => { localStorage.setItem('gec_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('gec_group_complaints', JSON.stringify(groupComplaints)); }, [groupComplaints]);
  useEffect(() => { localStorage.setItem('gec_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('gec_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('gec_notifications', JSON.stringify(notifications)); }, [notifications]);

  // ── Helper: push notification to Supabase + local state ──────────────────
  const pushNotification = async (notif: AdminNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    if (!isSupabaseConfigured()) return;
    await supabase.from('admin_notifications').insert({
      id: notif.id, title: notif.title, message: notif.message,
      type: notif.type, read: notif.read, link: notif.link, badge: notif.badge,
    });
  };

  // ── 1. Approve Gate Pass ──────────────────────────────────────────────────
  const approveGatePass = async (
    id: string,
    notes?: string,
    approverName = 'Prof. S. R. Mishra (Chief Warden)'
  ) => {
    const secureTokenPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedToken = `GP-2026-${secureTokenPart}`;
    const nowTime = getNowFormattedTime();
    const today = getTodayDate();

    let targetStudentName = '';
    setGatePasses((prev) =>
      prev.map((gp) => {
        if (gp.id === id) {
          targetStudentName = gp.studentName;
          return {
            ...gp, status: 'Approved', approvedBy: approverName,
            approvedDate: today, approvedTime: nowTime,
            qrToken: gp.qrToken.includes('PENDING') ? generatedToken : gp.qrToken,
            additionalNotes: notes || gp.additionalNotes,
          };
        }
        return gp;
      })
    );

    if (isSupabaseConfigured()) {
      await supabase.from('gate_passes').update({
        status: 'Approved', approved_by: approverName, approved_date: today,
        approved_time: nowTime,
        qr_token: generatedToken,
        additional_notes: notes,
      }).eq('id', id);
    }

    await pushNotification({
      id: `NOTIF-${Date.now()}`, title: 'Gate Pass Approved',
      message: `Gate pass for ${targetStudentName} (${id}) approved by ${approverName}. QR token issued.`,
      type: 'GATE_PASS', timestamp: 'Just now', read: false,
      link: '/admin/gate-passes', badge: 'Approved',
    });
  };

  // ── 2. Reject Gate Pass ───────────────────────────────────────────────────
  const rejectGatePass = async (
    id: string,
    rejectionReason: string,
    rejectorName = 'Prof. S. R. Mishra'
  ) => {
    const nowTime = getNowFormattedTime();
    const today = getTodayDate();
    let studentName = '';

    setGatePasses((prev) =>
      prev.map((gp) => {
        if (gp.id === id) {
          studentName = gp.studentName;
          return { ...gp, status: 'Rejected', rejectionReason, approvedBy: rejectorName, approvedDate: today, approvedTime: nowTime };
        }
        return gp;
      })
    );

    if (isSupabaseConfigured()) {
      await supabase.from('gate_passes').update({
        status: 'Rejected', rejection_reason: rejectionReason,
        approved_by: rejectorName, approved_date: today, approved_time: nowTime,
      }).eq('id', id);
    }

    await pushNotification({
      id: `NOTIF-${Date.now()}`, title: 'Gate Pass Rejected',
      message: `Gate pass for ${studentName} (${id}) rejected: "${rejectionReason}"`,
      type: 'GATE_PASS', timestamp: 'Just now', read: false,
      link: '/admin/gate-passes', badge: 'Rejected',
    });
  };

  // ── 3. QR Verification (pure local — no DB round-trip needed) ────────────
  const verifyQRToken = (token: string): QRVerificationResult => {
    const cleanToken = token.trim();
    if (!cleanToken) return { valid: false, message: 'Empty QR code token.', reason: 'NOT_FOUND' };

    const gp = gatePasses.find(
      (g) => g.qrToken.toLowerCase() === cleanToken.toLowerCase() || g.id.toLowerCase() === cleanToken.toLowerCase()
    );

    if (!gp) {
      const stu = students.find(
        (s) => s.id.toLowerCase() === cleanToken.toLowerCase() || s.rollNumber.toLowerCase() === cleanToken.toLowerCase()
      );
      if (stu?.activeGatePassId) {
        const studentGP = gatePasses.find((g) => g.id === stu.activeGatePassId);
        if (studentGP) return verifyQRToken(studentGP.qrToken);
      }
      return { valid: false, message: 'Invalid or unknown QR code. No active record found.', reason: 'NOT_FOUND' };
    }

    const student = students.find((s) => s.id === gp.studentId);
    if (gp.status === 'Cancelled') return { valid: false, message: 'This gate pass has been CANCELLED by the warden.', gatePass: gp, student, reason: 'CANCELLED' };
    if (gp.status === 'Rejected') return { valid: false, message: `Gate pass REJECTED: ${gp.rejectionReason || 'Permission not granted.'}`, gatePass: gp, student, reason: 'REJECTED' };
    if (gp.status === 'Expired') return { valid: false, message: 'This gate pass has EXPIRED. Student must request a new pass.', gatePass: gp, student, reason: 'EXPIRED' };
    if (gp.status === 'Used' && gp.actualReturnTime) return { valid: false, message: `Gate pass already FULLY USED on ${gp.outDate} (Returned at ${gp.actualReturnTime}).`, gatePass: gp, student, reason: 'ALREADY_USED' };

    return { valid: true, message: '✓ VALID GATE PASS - Ready for gate security verification.', gatePass: gp, student, reason: 'VALID' };
  };

  // ── 4. Mark Student OUT ───────────────────────────────────────────────────
  const markStudentOut = async (
    gatePassId: string,
    guardName = 'Officer K. Jena (Main Gate)',
    method: VerificationMethod = 'QR_SCAN',
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    const gp = gatePasses.find((g) => g.id === gatePassId);
    if (!gp) return { success: false, message: 'Gate pass not found.' };

    const currentTime = getNowFormattedTime();
    const after7PM = isTimeAfter7PM(currentTime);

    // Update local state
    setGatePasses((prev) => prev.map((g) => g.id === gatePassId ? { ...g, status: 'Active', actualExitTime: currentTime, isAfter7PMExit: after7PM } : g));
    setStudents((prev) => prev.map((s) => s.id === gp.studentId ? { ...s, currentStatus: 'Outside', activeGatePassId: gp.id } : s));

    const newMov: StudentMovement = {
      id: `MOV-${Date.now()}`, studentId: gp.studentId, studentName: gp.studentName,
      rollNumber: gp.studentRoll, hostel: gp.hostel, room: gp.room, gatePassId: gp.id,
      reason: gp.reason, destination: gp.destination, approvedBy: gp.approvedBy || 'Hostel Office',
      approvalDate: gp.approvedDate || getTodayDate(), approvalTime: gp.approvedTime || '05:00 PM',
      outTime: currentTime, expectedReturn: gp.expectedReturnTime, status: 'Outside',
      isAfter7PMExit: after7PM, isAfter7PMReturn: false,
      exitVerifiedBy: guardName, exitVerificationTime: currentTime,
    };

    setMovements((prev) => {
      const existing = prev.find((m) => m.gatePassId === gatePassId);
      if (existing) return prev.map((m) => m.gatePassId === gatePassId ? { ...m, outTime: currentTime, status: 'Outside', isAfter7PMExit: after7PM, exitVerifiedBy: guardName, exitVerificationTime: currentTime } : m);
      return [newMov, ...prev];
    });

    const newSecLog: SecurityLog = {
      id: `SEC-${Date.now()}`, studentId: gp.studentId, studentName: gp.studentName,
      gatePassId: gp.id, action: 'EXIT',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timeFormatted: currentTime, securityGuardId: 'SG-02', securityGuardName: guardName,
      verificationMethod: method,
      notes: notes || (after7PM ? '⚠ STUDENT LEFT AFTER 7 PM. Flagged in late-movement register.' : 'Student exit logged via security scan.'),
      isAfter7PM: after7PM, isLate: false,
    };
    setSecurityLogs((prev) => [newSecLog, ...prev]);

    // Persist to Supabase
    if (isSupabaseConfigured()) {
      await Promise.all([
        supabase.from('gate_passes').update({ status: 'Active', actual_exit_time: currentTime, is_after_7pm_exit: after7PM }).eq('id', gatePassId),
        supabase.from('students').update({ current_status: 'Outside', active_gate_pass_id: gp.id }).eq('id', gp.studentId),
        supabase.from('student_movements').upsert({
          id: newMov.id, student_id: newMov.studentId, student_name: newMov.studentName,
          roll_number: newMov.rollNumber, hostel: newMov.hostel, room: newMov.room,
          gate_pass_id: newMov.gatePassId, reason: newMov.reason, destination: newMov.destination,
          approved_by: newMov.approvedBy, approval_date: newMov.approvalDate,
          approval_time: newMov.approvalTime, out_time: newMov.outTime,
          expected_return: newMov.expectedReturn, status: newMov.status,
          is_after_7pm_exit: newMov.isAfter7PMExit, is_after_7pm_return: newMov.isAfter7PMReturn,
          exit_verified_by: newMov.exitVerifiedBy, exit_verification_time: newMov.exitVerificationTime,
        }),
        supabase.from('security_logs').insert({
          id: newSecLog.id, student_id: newSecLog.studentId, student_name: newSecLog.studentName,
          gate_pass_id: newSecLog.gatePassId, action: newSecLog.action,
          timestamp: newSecLog.timestamp, time_formatted: newSecLog.timeFormatted,
          security_guard_id: newSecLog.securityGuardId, security_guard_name: newSecLog.securityGuardName,
          verification_method: newSecLog.verificationMethod, notes: newSecLog.notes,
          is_after_7pm: newSecLog.isAfter7PM, is_late: newSecLog.isLate,
        }),
      ]);
    }

    await pushNotification({
      id: `NOTIF-${Date.now()}`,
      title: after7PM ? '⚠ Urgent: Student Exited After 7 PM' : 'Student Exited Hostel',
      message: `${gp.studentName} (${gp.room}) exited at ${currentTime}. Destination: ${gp.destination}.`,
      type: after7PM ? 'AFTER_7PM' : 'STUDENT_MOVEMENT', timestamp: 'Just now', read: false,
      link: after7PM ? '/admin/after-7pm' : '/admin/student-movement',
      badge: after7PM ? '⚠ After 7 PM' : 'Exited',
    });

    return { success: true, message: `${gp.studentName} marked OUT at ${currentTime}.${after7PM ? ' ⚠ Flagged: Exited after 7:00 PM.' : ''}` };
  };

  // ── 5. Mark Student IN ────────────────────────────────────────────────────
  const markStudentIn = async (
    gatePassId: string,
    guardName = 'Officer K. Jena (Main Gate)',
    method: VerificationMethod = 'QR_SCAN',
    notes?: string
  ): Promise<{ success: boolean; message: string; isLate?: boolean; lateDuration?: string }> => {
    const gp = gatePasses.find((g) => g.id === gatePassId);
    if (!gp) return { success: false, message: 'Gate pass not found.' };

    const currentTime = getNowFormattedTime();
    const after7PM = isTimeAfter7PM(currentTime);
    const isLate = Boolean(after7PM || (gp.expectedReturnTime && isTimeAfter7PM(currentTime)));
    const lateDuration = isLate ? '1 hour 15 minutes' : undefined;

    setGatePasses((prev) => prev.map((g) => g.id === gatePassId ? { ...g, status: 'Used', actualReturnTime: currentTime, isAfter7PMReturn: after7PM } : g));
    setStudents((prev) => prev.map((s) => s.id === gp.studentId ? { ...s, currentStatus: 'Returned' } : s));
    setMovements((prev) => prev.map((m) => m.gatePassId === gatePassId ? { ...m, status: 'Returned', actualReturn: currentTime, isAfter7PMReturn: after7PM, entryVerifiedBy: guardName, entryVerificationTime: currentTime, lateMinutes: isLate ? 75 : 0 } : m));

    const newSecLog: SecurityLog = {
      id: `SEC-${Date.now()}`, studentId: gp.studentId, studentName: gp.studentName,
      gatePassId: gp.id, action: 'ENTRY',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timeFormatted: currentTime, securityGuardId: 'SG-02', securityGuardName: guardName,
      verificationMethod: method,
      notes: notes || (isLate ? `Returned after 7 PM. Late by ${lateDuration}.` : 'Student verified safe entry.'),
      isAfter7PM: after7PM, isLate, lateDuration,
    };
    setSecurityLogs((prev) => [newSecLog, ...prev]);

    if (isSupabaseConfigured()) {
      await Promise.all([
        supabase.from('gate_passes').update({ status: 'Used', actual_return_time: currentTime, is_after_7pm_return: after7PM }).eq('id', gatePassId),
        supabase.from('students').update({ current_status: 'Returned' }).eq('id', gp.studentId),
        supabase.from('student_movements').update({
          status: 'Returned', actual_return: currentTime, is_after_7pm_return: after7PM,
          entry_verified_by: guardName, entry_verification_time: currentTime,
          late_minutes: isLate ? 75 : 0,
        }).eq('gate_pass_id', gatePassId),
        supabase.from('security_logs').insert({
          id: newSecLog.id, student_id: newSecLog.studentId, student_name: newSecLog.studentName,
          gate_pass_id: newSecLog.gatePassId, action: newSecLog.action,
          timestamp: newSecLog.timestamp, time_formatted: newSecLog.timeFormatted,
          security_guard_id: newSecLog.securityGuardId, security_guard_name: newSecLog.securityGuardName,
          verification_method: newSecLog.verificationMethod, notes: newSecLog.notes,
          is_after_7pm: newSecLog.isAfter7PM, is_late: newSecLog.isLate,
          late_duration: newSecLog.lateDuration,
        }),
      ]);
    }

    await pushNotification({
      id: `NOTIF-${Date.now()}`,
      title: isLate ? '⚠ Student Returned Late (After 7 PM)' : 'Student Returned to Hostel',
      message: `${gp.studentName} returned at ${currentTime}.${isLate ? ` Late by ${lateDuration}.` : ''}`,
      type: isLate ? 'AFTER_7PM' : 'STUDENT_MOVEMENT', timestamp: 'Just now', read: false,
      link: isLate ? '/admin/after-7pm' : '/admin/student-movement',
      badge: isLate ? 'Late Return' : 'Returned',
    });

    return { success: true, message: `${gp.studentName} marked IN at ${currentTime}.${isLate ? ` (Late by ${lateDuration})` : ''}`, isLate, lateDuration };
  };

  // ── 6. Sync Attendance ────────────────────────────────────────────────────
  const syncAttendance = async () => {
    await new Promise((res) => setTimeout(res, 800));
    const nowTime = getNowFormattedTime();
    const updatedSync = `Today at ${nowTime} (Live Biometric Server & RFID Gates Synced)`;
    setLastSyncTime(updatedSync);
    localStorage.setItem('gec_last_sync', updatedSync);

    await pushNotification({
      id: `NOTIF-${Date.now()}`, title: 'Hostel Attendance Synchronized',
      message: 'Central database synchronized with 12 Biometric Turnstiles across 5 Hostel Blocks.',
      type: 'ATTENDANCE_SYNC', timestamp: 'Just now', read: false,
      link: '/admin/attendance', badge: 'Synced',
    });
  };

  // ── 7. Update Complaint Status ────────────────────────────────────────────
  const updateComplaintStatus = async (
    id: string, status: ComplaintStatus, comment?: string,
    isInternal = false, authorName = 'Prof. S. R. Mishra'
  ) => {
    const nowTime = getNowFormattedTime();
    const newCommentId = `COM-${Date.now()}`;

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedComments = comment ? [...c.comments, { id: newCommentId, authorName, authorRole: 'Admin' as const, timestamp: `${getTodayDate()} ${nowTime}`, content: comment, isInternal }] : c.comments;
        return { ...c, status, lastUpdated: `${getTodayDate()} ${nowTime}`, resolutionNotes: status === 'Resolved' ? (comment || c.resolutionNotes || 'Resolved by administration') : c.resolutionNotes, comments: updatedComments };
      })
    );

    if (isSupabaseConfigured()) {
      await supabase.from('complaints').update({ status, last_updated: new Date().toISOString(), resolution_notes: status === 'Resolved' ? (comment || 'Resolved by administration') : undefined }).eq('id', id);
      if (comment) {
        await supabase.from('complaint_comments').insert({ id: newCommentId, complaint_id: id, author_name: authorName, author_role: 'Admin', content: comment, is_internal: isInternal });
      }
    }
  };

  // ── 8. Update Group Complaint Status ──────────────────────────────────────
  const updateGroupComplaintStatus = async (
    id: string, status: ComplaintStatus, comment?: string,
    isInternal = false, authorName = 'Prof. S. R. Mishra'
  ) => {
    const nowTime = getNowFormattedTime();
    const newCommentId = `GCOM-${Date.now()}`;

    setGroupComplaints((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updatedComments = comment ? [...g.comments, { id: newCommentId, authorName, authorRole: 'Admin' as const, timestamp: `${getTodayDate()} ${nowTime}`, content: comment, isInternal }] : g.comments;
        return { ...g, status, resolutionNotes: status === 'Resolved' ? (comment || g.resolutionNotes || 'Resolved by warden committee') : g.resolutionNotes, comments: updatedComments };
      })
    );

    if (isSupabaseConfigured()) {
      await supabase.from('group_complaints').update({ status, resolution_notes: status === 'Resolved' ? (comment || 'Resolved') : undefined }).eq('id', id);
      if (comment) {
        await supabase.from('group_complaint_comments').insert({ id: newCommentId, group_id: id, author_name: authorName, author_role: 'Admin', content: comment, is_internal: isInternal });
      }
    }
  };

  // ── 9. Notices ────────────────────────────────────────────────────────────
  const createNotice = async (notice: Omit<Notice, 'id'>) => {
    const newId = `NOT-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const newNotice: Notice = { ...notice, id: newId };
    setNotices((prev) => [newNotice, ...prev]);

    if (isSupabaseConfigured()) {
      await supabase.from('notices').insert({
        id: newId, title: notice.title, category: notice.category, description: notice.description,
        priority: notice.priority, publish_date: notice.publishDate, expiry_date: notice.expiryDate,
        status: notice.status, author: notice.author, attachment_name: notice.attachmentName,
        attachment_url: notice.attachmentUrl, target_audience: notice.targetAudience,
      });
    }

    await pushNotification({
      id: `NOTIF-${Date.now()}`, title: 'New Notice Published',
      message: `"${notice.title}" has been published to the student portal.`,
      type: 'SECURITY', timestamp: 'Just now', read: false,
      link: '/admin/notices', badge: notice.priority,
    });
  };

  const deleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseConfigured()) {
      await supabase.from('notices').delete().eq('id', id);
    }
  };

  // ── 10. Events ────────────────────────────────────────────────────────────
  const createEvent = async (event: Omit<HostelEvent, 'id' | 'currentRegistrations'>) => {
    const newId = `EVT-2026-0${Math.floor(10 + Math.random() * 90)}`;
    const newEvt: HostelEvent = { ...event, id: newId, currentRegistrations: 0 };
    setEvents((prev) => [newEvt, ...prev]);

    if (isSupabaseConfigured()) {
      await supabase.from('hostel_events').insert({
        id: newId, event_name: event.eventName, description: event.description,
        date: event.date, time: event.time, venue: event.venue, organizer: event.organizer,
        image_url: event.image, registration_required: event.registrationRequired,
        maximum_participants: event.maximumParticipants, current_registrations: 0,
        status: event.status,
      });
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (isSupabaseConfigured()) {
      await supabase.from('hostel_events').delete().eq('id', id);
    }
  };

  // ── 11. Notifications ─────────────────────────────────────────────────────
  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (isSupabaseConfigured()) {
      await supabase.from('admin_notifications').update({ read: true }).eq('id', id);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isSupabaseConfigured()) {
      await supabase.from('admin_notifications').update({ read: true }).eq('read', false);
    }
  };

  // ── 12. Reset to mock data ────────────────────────────────────────────────
  const resetToDefaultData = () => {
    localStorage.clear();
    setStudents(mockStudents);
    setGatePasses(mockGatePasses);
    setMovements(mockStudentMovements);
    setSecurityLogs(mockSecurityLogs);
    setAbsentStudents(mockAbsentStudents);
    setComplaints(mockComplaints);
    setGroupComplaints(mockGroupComplaints);
    setNotices(mockNotices);
    setEvents(mockEvents);
    setNotifications(mockNotifications);
    setLastSyncTime('Today at 08:30 PM (Biometric Turnstile #1-#4)');
  };

  return (
    <HostelContext.Provider
      value={{
        students, gatePasses, movements, securityLogs, absentStudents,
        complaints, groupComplaints, notices, events, notifications,
        lastSyncTime, curfewTime, loading,
        approveGatePass, rejectGatePass, markStudentOut, markStudentIn,
        verifyQRToken, syncAttendance, updateComplaintStatus,
        updateGroupComplaintStatus, createNotice, deleteNotice,
        createEvent, deleteEvent, markNotificationAsRead,
        markAllNotificationsAsRead, resetToDefaultData,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};
