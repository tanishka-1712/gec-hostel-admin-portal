# GEC Autonomous College, Bhubaneswar - Central Hostel Admin Management Portal

A complete, modern, responsive, and production-ready **Hostel Admin Management Portal** tailored specifically for the **Authorized Management Staff, Chief Warden, and Principal** of Gandhi Engineering College (GEC Autonomous), Bhubaneswar.

Built to mirror and unify with the **Student Hostel Portal** design system while enforcing strict campus egress surveillance, night curfew rules, biometric turnstile synchronization, and comprehensive grievance management.

---

## 🚀 Key Features Implemented

### 1. Administrative Authentication & Role Management (`/login`)
- **Multi-Role Access**: Seamless switching between **ADMIN (Chief Warden)**, **PRINCIPAL (College Executive Authority)**, and **WARDEN / HOD (Block Warden)**.
- **Security Features**: Show/hide password toggles, "Remember this terminal", forgot password recovery, loading state transitions, and 1-click test credential presets.

### 2. Central Operations Dashboard (`/admin/dashboard`)
- **Live Institutional Clock**: Real-time date and ticking digital clock with seconds precision.
- **8 Dedicated Statistic Cards** (matching exact specifications):
  1. **Total Students**: 1,000 Boarders
  2. **Present Today**: 986 (98.6% Attendance Rate)
  3. **Absent Today**: 14 (Automated absentee alert)
  4. **Currently Outside**: 27 (Authorized egress)
  5. **Pending Gate Passes**: 12 (Awaiting warden review)
  6. **Open Complaints**: 18 (Including group petitions)
  7. **Students Out After 7 PM**: 8 (Strict surveillance flag)
  8. **Students Returned After 7 PM**: 6 (Late duration logged)
- **Student Movement Today Visualization**: Clean visual progress breakdown representing *Inside Hostel* (93%), *Outside Hostel* (5%), and *Overdue Returns* (2%).
- **Quick Actions Panel**: Direct launchers for *Approve Gate Pass*, *Verify QR Code*, *Security Feed*, *Publish Notice*, and *Download Reports*.
- **Emergency Alert Banner**: Prominently highlights active curfew breaches and overdue boarders.

### 3. Student Exit & Entry Register (`/admin/student-movement`)
- **Detailed Movement Table**: Student ID, Name, Hostel Block, Room, Gate Pass ID, Reason, Destination, Approved By, Out Time, Expected Return, Actual Return, and Live Status.
- **Complete Movement History Modal**:
  - Full 4-step visual lifecycle timeline: `Gate Pass Requested` → `Gate Pass Approved` → `Student Exited` → `Student Returned`.
  - Parent/guardian phone contacts and direct calling triggers.
  - Security guard verification checkpoints (Exit Guard vs. Entry Guard).

### 4. Dedicated After 7 PM Movement Monitoring (`/admin/after-7pm`)
- **Automated Business Rules**:
  - **Exited after 7:00 PM**: Automatically flags record with `⚠ STUDENT LEFT AFTER 7 PM` in night registers.
  - **Returned after 7:00 PM / Late**: Records entry time, security guard, expected return time, and automatically calculates: `Late by: X hours Y mins` with orange/red alert badges.
  - One-click parent notification and guardian calling triggers.

### 5. Gate Pass Clearance & Approval Hub (`/admin/gate-passes`)
- **Multi-State Filtering**: Tabs for *All*, *Pending*, *Approved*, *Active*, *Used*, *Rejected*, *Expired*, and *Cancelled*.
- **Cryptographic Gate Pass Approval**:
  - Generates secure, unforgeable QR tokens (e.g., `GP-2026-8F92X71ABC`).
  - Required justification for rejections (records mandatory rejection reason for audits).
  - Confetti animations and automatic push to security turnstiles upon approval.
- **Printable QR Pass Modal**: High-density QR code with student avatar, college watermark, and printable voucher layout.

### 6. Security Turnstile QR Verification Terminal (`/admin/qr-verification`)
- **Dual Verification Modes**:
  - **Live Camera Scanner**: Simulated camera viewfinder with target reticle.
  - **Manual Token Input**: Quick keyboard lookup by token or Student ID.
- **QR Security Rules**:
  - Enforces validity checks (blocks expired, cancelled, rejected, or reused passes).
  - Displays `✓ VALID GATE PASS` screen with boarder photo, room, destination, and warden approval stamp.
  - Direct Turnstile Actions: **[Mark Student OUT]** and **[Mark Student IN]** with immediate logging.

### 7. Real-Time Security Activity Feed (`/admin/security-activity`)
- Chronological surveillance feed with live indicators:
  - 🟢 **Entry**: Boarder entered hostel
  - 🔴 **Exit**: Boarder exited campus
  - ⚠ **Late Exit**: Exited past 7:00 PM curfew
  - ⏰ **Late Return**: Returned past scheduled hour
- Tracks operating guard name, gate number, and verification method (`QR_SCAN` / `MANUAL`).

### 8. Automated Attendance System (`/admin/attendance`)
- **Biometric Sync Architecture**: Simulates hardware polling from 12 biometric turnstiles across CV Raman, Kalam, Aryabhatta, and Girls Hostels.
- **Absent Student Alert**: Prominent banner highlighting absent boarders with instant "View Absent Students" filter.
- **Session Support**: Morning roll call (07:00 AM) and Evening roll call (08:00 PM).
- **Exporting**: Downloadable CSV report and print preview.

### 9. Complaints & Grievance Redressal (`/admin/complaints`)
- **Individual Grievances**: Categorized by *Room, Mess, Water, Electricity, Internet, Cleaning, Maintenance, Security*.
- **Group Grievances & Petitions**: Multi-boarder collective complaints (e.g., `GRP-2026-00027: Water Supply Problem - Block A`, 24 students joined).
- **Internal Admin Notes**: Private staff remarks protected and completely hidden from student views.
- **6-Stage Lifecycle**: `Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Closed`.

### 10. Notices & Circulars (`/admin/notices`)
- Official warden orders, disciplinary memos, and mess committee updates with publish/expiry scheduling.

### 11. Campus Events & Tournaments (`/admin/events`)
- Inter-block sports championships, tech coding hackathons, and cultural festivities with registration limits.

### 12. Audit & Intelligence Reports (`/admin/reports`)
- Generates 8 dedicated institutional reports with one-click **CSV Export** and **Print PDF** layouts:
  1. *Daily Attendance Report*
  2. *Gate Pass Report*
  3. *Student Movement Report*
  4. *After 7 PM Movement Report*
  5. *Late Return Report*
  6. *Complaint & Grievance Report*
  7. *Group Complaint Report*
  8. *Security Activity Report*

### 13. System Settings & Curfew Protocols (`/admin/settings`)
- Configurable curfew thresholds, parent SMS gateways, turnstile polling intervals, and a 1-click **Reset Demo Data** utility.

---

## 🛠 Tech Stack & Design System

- **Framework**: React 19 + TypeScript + Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 using the exact base design system (Inter/Poppins, `#f0f4ff` canvas, `.card`, `.btn-primary`, custom badges, smooth keyframe animations)
- **Icons**: Lucide React
- **QR Codes**: `qrcode.react` (SVG, Level H error correction)
- **Delight & Feedback**: `canvas-confetti`
- **State Management**: Reactive React Context with `localStorage` persistence

---

## 💻 Running the Portal Locally

1. Navigate to the project directory:
   ```bash
   cd "C:\Users\tanis\.gemini\antigravity\scratch\gec-hostel-admin"
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open in your browser:
   ```
   http://localhost:5173/
   ```

4. Or preview the production build:
   ```bash
   npm run preview
   ```
