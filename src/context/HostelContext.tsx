import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ComplaintStatus
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
  mockNotifications 
} from '../data/mockData';

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
  
  // Actions
  approveGatePass: (id: string, notes?: string, approverName?: string) => void;
  rejectGatePass: (id: string, rejectionReason: string, rejectorName?: string) => void;
  markStudentOut: (gatePassId: string, guardName?: string, method?: VerificationMethod, notes?: string) => { success: boolean; message: string };
  markStudentIn: (gatePassId: string, guardName?: string, method?: VerificationMethod, notes?: string) => { success: boolean; message: string; isLate?: boolean; lateDuration?: string };
  verifyQRToken: (token: string) => QRVerificationResult;
  syncAttendance: () => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, comment?: string, isInternal?: boolean, authorName?: string) => void;
  updateGroupComplaintStatus: (id: string, status: ComplaintStatus, comment?: string, isInternal?: boolean, authorName?: string) => void;
  createNotice: (notice: Omit<Notice, 'id'>) => void;
  deleteNotice: (id: string) => void;
  createEvent: (event: Omit<HostelEvent, 'id' | 'currentRegistrations'>) => void;
  deleteEvent: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDefaultData: () => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('gec_students');
    return saved ? JSON.parse(saved) : mockStudents;
  });

  const [gatePasses, setGatePasses] = useState<GatePass[]>(() => {
    const saved = localStorage.getItem('gec_gate_passes');
    return saved ? JSON.parse(saved) : mockGatePasses;
  });

  const [movements, setMovements] = useState<StudentMovement[]>(() => {
    const saved = localStorage.getItem('gec_student_movements');
    return saved ? JSON.parse(saved) : mockStudentMovements;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('gec_security_logs');
    return saved ? JSON.parse(saved) : mockSecurityLogs;
  });

  const [absentStudents, setAbsentStudents] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('gec_absent_students');
    return saved ? JSON.parse(saved) : mockAbsentStudents;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('gec_complaints');
    return saved ? JSON.parse(saved) : mockComplaints;
  });

  const [groupComplaints, setGroupComplaints] = useState<GroupComplaint[]>(() => {
    const saved = localStorage.getItem('gec_group_complaints');
    return saved ? JSON.parse(saved) : mockGroupComplaints;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('gec_notices');
    return saved ? JSON.parse(saved) : mockNotices;
  });

  const [events, setEvents] = useState<HostelEvent[]>(() => {
    const saved = localStorage.getItem('gec_events');
    return saved ? JSON.parse(saved) : mockEvents;
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('gec_notifications');
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('gec_last_sync') || 'Today at 08:30 PM (Biometric Turnstile #1-#4)';
  });

  const curfewTime = '07:00 PM';

  // Persistence effects
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

  // Helper: check if a time is after 7:00 PM (assumes 12h formatted time string like "07:15 PM")
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

  const getNowFormattedTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // 1. Approve Gate Pass
  const approveGatePass = (id: string, notes?: string, approverName: string = 'Prof. S. R. Mishra (Chief Warden)') => {
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
            ...gp,
            status: 'Approved',
            approvedBy: approverName,
            approvedDate: today,
            approvedTime: nowTime,
            qrToken: gp.qrToken.includes('PENDING') ? generatedToken : gp.qrToken,
            additionalNotes: notes || gp.additionalNotes
          };
        }
        return gp;
      })
    );

    // Add notification
    const newNotif: AdminNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Gate Pass Approved',
      message: `Gate pass for ${targetStudentName} (${id}) approved by ${approverName}. QR token issued.`,
      type: 'GATE_PASS',
      timestamp: 'Just now',
      read: false,
      link: '/admin/gate-passes',
      badge: 'Approved'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 2. Reject Gate Pass
  const rejectGatePass = (id: string, rejectionReason: string, rejectorName: string = 'Prof. S. R. Mishra') => {
    const nowTime = getNowFormattedTime();
    const today = getTodayDate();
    let studentName = '';

    setGatePasses((prev) =>
      prev.map((gp) => {
        if (gp.id === id) {
          studentName = gp.studentName;
          return {
            ...gp,
            status: 'Rejected',
            rejectionReason,
            approvedBy: rejectorName,
            approvedDate: today,
            approvedTime: nowTime
          };
        }
        return gp;
      })
    );

    const newNotif: AdminNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Gate Pass Rejected',
      message: `Gate pass for ${studentName} (${id}) rejected: "${rejectionReason}"`,
      type: 'GATE_PASS',
      timestamp: 'Just now',
      read: false,
      link: '/admin/gate-passes',
      badge: 'Rejected'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 3. QR Verification
  const verifyQRToken = (token: string): QRVerificationResult => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { valid: false, message: 'Empty QR code token.', reason: 'NOT_FOUND' };
    }

    // Lookup gate pass by QR token or ID
    const gp = gatePasses.find(
      (g) => g.qrToken.toLowerCase() === cleanToken.toLowerCase() || g.id.toLowerCase() === cleanToken.toLowerCase()
    );

    if (!gp) {
      // Check if it's a student ID
      const stu = students.find((s) => s.id.toLowerCase() === cleanToken.toLowerCase() || s.rollNumber.toLowerCase() === cleanToken.toLowerCase());
      if (stu && stu.activeGatePassId) {
        const studentGP = gatePasses.find((g) => g.id === stu.activeGatePassId);
        if (studentGP) {
          return verifyQRToken(studentGP.qrToken);
        }
      }
      return { valid: false, message: 'Invalid or unknown QR code. No active record found.', reason: 'NOT_FOUND' };
    }

    const student = students.find((s) => s.id === gp.studentId);

    if (gp.status === 'Cancelled') {
      return { valid: false, message: 'This gate pass has been CANCELLED by the warden.', gatePass: gp, student, reason: 'CANCELLED' };
    }
    if (gp.status === 'Rejected') {
      return { valid: false, message: `Gate pass REJECTED: ${gp.rejectionReason || 'Permission not granted.'}`, gatePass: gp, student, reason: 'REJECTED' };
    }
    if (gp.status === 'Expired') {
      return { valid: false, message: 'This gate pass has EXPIRED. Student must request a new pass.', gatePass: gp, student, reason: 'EXPIRED' };
    }
    if (gp.status === 'Used' && gp.actualReturnTime) {
      return { valid: false, message: `Gate pass already FULLY USED on ${gp.outDate} (Returned at ${gp.actualReturnTime}).`, gatePass: gp, student, reason: 'ALREADY_USED' };
    }

    return {
      valid: true,
      message: '✓ VALID GATE PASS - Ready for gate security verification.',
      gatePass: gp,
      student,
      reason: 'VALID'
    };
  };

  // 4. Mark Student OUT
  const markStudentOut = (
    gatePassId: string, 
    guardName: string = 'Officer K. Jena (Main Gate)', 
    method: VerificationMethod = 'QR_SCAN',
    notes?: string
  ): { success: boolean; message: string } => {
    const gp = gatePasses.find((g) => g.id === gatePassId);
    if (!gp) return { success: false, message: 'Gate pass not found.' };

    const currentTime = getNowFormattedTime();
    const after7PM = isTimeAfter7PM(currentTime);

    // Update Gate Pass
    setGatePasses((prev) =>
      prev.map((g) =>
        g.id === gatePassId
          ? {
              ...g,
              status: 'Active',
              actualExitTime: currentTime,
              isAfter7PMExit: after7PM
            }
          : g
      )
    );

    // Update Student Status
    setStudents((prev) =>
      prev.map((s) =>
        s.id === gp.studentId
          ? {
              ...s,
              currentStatus: 'Outside',
              activeGatePassId: gp.id
            }
          : s
      )
    );

    // Add or update Student Movement
    setMovements((prev) => {
      const existing = prev.find((m) => m.gatePassId === gatePassId);
      if (existing) {
        return prev.map((m) =>
          m.gatePassId === gatePassId
            ? {
                ...m,
                outTime: currentTime,
                status: 'Outside',
                isAfter7PMExit: after7PM,
                exitVerifiedBy: guardName,
                exitVerificationTime: currentTime
              }
            : m
        );
      } else {
        const newMov: StudentMovement = {
          id: `MOV-${Date.now()}`,
          studentId: gp.studentId,
          studentName: gp.studentName,
          rollNumber: gp.studentRoll,
          hostel: gp.hostel,
          room: gp.room,
          gatePassId: gp.id,
          reason: gp.reason,
          destination: gp.destination,
          approvedBy: gp.approvedBy || 'Hostel Office',
          approvalDate: gp.approvedDate || getTodayDate(),
          approvalTime: gp.approvedTime || '05:00 PM',
          outTime: currentTime,
          expectedReturn: gp.expectedReturnTime,
          status: 'Outside',
          isAfter7PMExit: after7PM,
          isAfter7PMReturn: false,
          exitVerifiedBy: guardName,
          exitVerificationTime: currentTime
        };
        return [newMov, ...prev];
      }
    });

    // Create Security Log
    const newSecLog: SecurityLog = {
      id: `SEC-${Date.now()}`,
      studentId: gp.studentId,
      studentName: gp.studentName,
      gatePassId: gp.id,
      action: 'EXIT',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timeFormatted: currentTime,
      securityGuardId: 'SG-02',
      securityGuardName: guardName,
      verificationMethod: method,
      notes: notes || (after7PM ? '⚠ STUDENT LEFT AFTER 7 PM. Flagged in late-movement register.' : 'Student exit logged via security scan.'),
      isAfter7PM: after7PM,
      isLate: false
    };
    setSecurityLogs((prev) => [newSecLog, ...prev]);

    // Send Notification
    const notif: AdminNotification = {
      id: `NOTIF-${Date.now()}`,
      title: after7PM ? '⚠ Urgent: Student Exited After 7 PM' : 'Student Exited Hostel',
      message: `${gp.studentName} (${gp.room}) exited at ${currentTime}. Destination: ${gp.destination}.`,
      type: after7PM ? 'AFTER_7PM' : 'STUDENT_MOVEMENT',
      timestamp: 'Just now',
      read: false,
      link: after7PM ? '/admin/after-7pm' : '/admin/student-movement',
      badge: after7PM ? '⚠ After 7 PM' : 'Exited'
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `${gp.studentName} marked OUT at ${currentTime}.${after7PM ? ' ⚠ Flagged: Exited after 7:00 PM.' : ''}`
    };
  };

  // 5. Mark Student IN
  const markStudentIn = (
    gatePassId: string, 
    guardName: string = 'Officer K. Jena (Main Gate)', 
    method: VerificationMethod = 'QR_SCAN',
    notes?: string
  ): { success: boolean; message: string; isLate?: boolean; lateDuration?: string } => {
    const gp = gatePasses.find((g) => g.id === gatePassId);
    if (!gp) return { success: false, message: 'Gate pass not found.' };

    const currentTime = getNowFormattedTime();
    const after7PM = isTimeAfter7PM(currentTime);

    // Simple calculation of delay if after expected return
    const isLate = Boolean(after7PM || (gp.expectedReturnTime && isTimeAfter7PM(currentTime)));
    const lateDuration = isLate ? '1 hour 15 minutes' : undefined;

    // Update Gate Pass
    setGatePasses((prev) =>
      prev.map((g) =>
        g.id === gatePassId
          ? {
              ...g,
              status: 'Used',
              actualReturnTime: currentTime,
              isAfter7PMReturn: after7PM
            }
          : g
      )
    );

    // Update Student Status
    setStudents((prev) =>
      prev.map((s) =>
        s.id === gp.studentId
          ? {
              ...s,
              currentStatus: 'Returned'
            }
          : s
      )
    );

    // Update Student Movement
    setMovements((prev) =>
      prev.map((m) =>
        m.gatePassId === gatePassId
          ? {
              ...m,
              status: 'Returned',
              actualReturn: currentTime,
              isAfter7PMReturn: after7PM,
              entryVerifiedBy: guardName,
              entryVerificationTime: currentTime,
              lateMinutes: isLate ? 75 : 0
            }
          : m
      )
    );

    // Create Security Log
    const newSecLog: SecurityLog = {
      id: `SEC-${Date.now()}`,
      studentId: gp.studentId,
      studentName: gp.studentName,
      gatePassId: gp.id,
      action: 'ENTRY',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timeFormatted: currentTime,
      securityGuardId: 'SG-02',
      securityGuardName: guardName,
      verificationMethod: method,
      notes: notes || (isLate ? `Returned after 7 PM. Late by ${lateDuration}.` : 'Student verified safe entry.'),
      isAfter7PM: after7PM,
      isLate: isLate,
      lateDuration: lateDuration
    };
    setSecurityLogs((prev) => [newSecLog, ...prev]);

    // Send Notification
    const notif: AdminNotification = {
      id: `NOTIF-${Date.now()}`,
      title: isLate ? '⚠ Student Returned Late (After 7 PM)' : 'Student Returned to Hostel',
      message: `${gp.studentName} returned at ${currentTime}.${isLate ? ` Late by ${lateDuration}.` : ''}`,
      type: isLate ? 'AFTER_7PM' : 'STUDENT_MOVEMENT',
      timestamp: 'Just now',
      read: false,
      link: isLate ? '/admin/after-7pm' : '/admin/student-movement',
      badge: isLate ? 'Late Return' : 'Returned'
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `${gp.studentName} marked IN at ${currentTime}.${isLate ? ` (Late by ${lateDuration})` : ''}`,
      isLate,
      lateDuration
    };
  };

  // 6. Sync Attendance (biometric sync architecture)
  const syncAttendance = async () => {
    await new Promise((res) => setTimeout(res, 800));
    const nowTime = getNowFormattedTime();
    const updatedSync = `Today at ${nowTime} (Live Biometric Server & RFID Gates Synced)`;
    setLastSyncTime(updatedSync);
    localStorage.setItem('gec_last_sync', updatedSync);

    const notif: AdminNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Hostel Attendance Synchronized',
      message: `Central database synchronized with 12 Biometric Turnstiles across 5 Hostel Blocks.`,
      type: 'ATTENDANCE_SYNC',
      timestamp: 'Just now',
      read: false,
      link: '/admin/attendance',
      badge: 'Synced'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 7. Update Complaints
  const updateComplaintStatus = (
    id: string, 
    status: ComplaintStatus, 
    comment?: string, 
    isInternal: boolean = false,
    authorName: string = 'Prof. S. R. Mishra'
  ) => {
    const nowTime = getNowFormattedTime();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedComments = comment
            ? [
                ...c.comments,
                {
                  id: `COM-${Date.now()}`,
                  authorName,
                  authorRole: 'Admin' as const,
                  timestamp: `${getTodayDate()} ${nowTime}`,
                  content: comment,
                  isInternal
                }
              ]
            : c.comments;

          return {
            ...c,
            status,
            lastUpdated: `${getTodayDate()} ${nowTime}`,
            resolutionNotes: status === 'Resolved' ? (comment || c.resolutionNotes || 'Resolved by administration') : c.resolutionNotes,
            comments: updatedComments
          };
        }
        return c;
      })
    );
  };

  // 8. Update Group Complaints
  const updateGroupComplaintStatus = (
    id: string, 
    status: ComplaintStatus, 
    comment?: string, 
    isInternal: boolean = false,
    authorName: string = 'Prof. S. R. Mishra'
  ) => {
    const nowTime = getNowFormattedTime();
    setGroupComplaints((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updatedComments = comment
            ? [
                ...g.comments,
                {
                  id: `GCOM-${Date.now()}`,
                  authorName,
                  authorRole: 'Admin' as const,
                  timestamp: `${getTodayDate()} ${nowTime}`,
                  content: comment,
                  isInternal
                }
              ]
            : g.comments;

          return {
            ...g,
            status,
            resolutionNotes: status === 'Resolved' ? (comment || g.resolutionNotes || 'Resolved by warden committee') : g.resolutionNotes,
            comments: updatedComments
          };
        }
        return g;
      })
    );
  };

  // 9. Notices
  const createNotice = (notice: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...notice,
      id: `NOT-2026-0${Math.floor(100 + Math.random() * 900)}`
    };
    setNotices((prev) => [newNotice, ...prev]);

    const notif: AdminNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'New Notice Published',
      message: `"${notice.title}" has been published to the student portal.`,
      type: 'SECURITY',
      timestamp: 'Just now',
      read: false,
      link: '/admin/notices',
      badge: notice.priority
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // 10. Events
  const createEvent = (event: Omit<HostelEvent, 'id' | 'currentRegistrations'>) => {
    const newEvt: HostelEvent = {
      ...event,
      id: `EVT-2026-0${Math.floor(10 + Math.random() * 90)}`,
      currentRegistrations: 0
    };
    setEvents((prev) => [newEvt, ...prev]);
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // 11. Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
        students,
        gatePasses,
        movements,
        securityLogs,
        absentStudents,
        complaints,
        groupComplaints,
        notices,
        events,
        notifications,
        lastSyncTime,
        curfewTime,
        approveGatePass,
        rejectGatePass,
        markStudentOut,
        markStudentIn,
        verifyQRToken,
        syncAttendance,
        updateComplaintStatus,
        updateGroupComplaintStatus,
        createNotice,
        deleteNotice,
        createEvent,
        deleteEvent,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDefaultData
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
