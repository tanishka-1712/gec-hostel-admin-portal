-- ============================================================
-- GEC Hostel Admin Portal — Supabase Schema
-- Run this entire file once in the Supabase SQL Editor
-- ============================================================

-- ─── ENUMS ───────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('ADMIN', 'PRINCIPAL', 'WARDEN', 'HOD');

CREATE TYPE hostel_block AS ENUM (
  'Boys Hostel A (C.V. Raman Block)',
  'Boys Hostel B (Kalam Block)',
  'Boys Hostel C (Aryabhatta Block)',
  'Girls Hostel A (Kalpana Chawla Block)',
  'Girls Hostel B (Sarojini Naidu Block)'
);

CREATE TYPE student_status AS ENUM ('Inside', 'Outside', 'Returned', 'Overdue');

CREATE TYPE attendance_session AS ENUM ('Morning', 'Evening');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Leave', 'Late', 'Not Marked');

CREATE TYPE gate_pass_status AS ENUM (
  'Pending', 'Approved', 'Rejected', 'Active', 'Expired', 'Used', 'Cancelled'
);
CREATE TYPE gate_pass_reason AS ENUM (
  'Medical Appointment', 'Home Visit', 'Market / Essentials',
  'Coaching / Tuition', 'Academic Project', 'Emergency', 'Other'
);

CREATE TYPE verification_method AS ENUM ('QR_SCAN', 'MANUAL', 'OTHER');
CREATE TYPE security_action AS ENUM ('EXIT', 'ENTRY');

CREATE TYPE complaint_category AS ENUM (
  'Room', 'Hostel', 'Mess', 'Water', 'Electricity',
  'Internet', 'Cleaning', 'Security', 'Maintenance', 'Other'
);
CREATE TYPE complaint_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');
CREATE TYPE complaint_status AS ENUM (
  'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'
);
CREATE TYPE comment_author_role AS ENUM ('Admin', 'Warden', 'Student', 'Technician');

CREATE TYPE notice_category AS ENUM (
  'General', 'Hostel', 'Mess', 'Maintenance', 'Emergency', 'Event', 'Discipline'
);
CREATE TYPE notice_priority AS ENUM ('Urgent', 'High', 'Normal');
CREATE TYPE notice_status AS ENUM ('Published', 'Scheduled', 'Draft');
CREATE TYPE notice_audience AS ENUM (
  'All Hostels', 'Boys Hostels', 'Girls Hostels', 'Specific Block'
);
CREATE TYPE event_status AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');
CREATE TYPE notification_type AS ENUM (
  'GATE_PASS', 'STUDENT_MOVEMENT', 'AFTER_7PM', 'COMPLAINT', 'ATTENDANCE_SYNC', 'SECURITY'
);

-- ─── TABLES ──────────────────────────────────────────────────

-- Admin Users (portal staff — linked to Supabase Auth)
CREATE TABLE admin_users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        user_role NOT NULL,
  designation TEXT NOT NULL,
  department  TEXT NOT NULL,
  phone       TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  roll_number           TEXT UNIQUE NOT NULL,
  branch                TEXT NOT NULL,
  year                  TEXT NOT NULL,
  hostel                hostel_block NOT NULL,
  room                  TEXT NOT NULL,
  bed                   TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  guardian_name         TEXT NOT NULL,
  guardian_phone        TEXT NOT NULL,
  current_status        student_status DEFAULT 'Inside',
  photo_url             TEXT,
  active_gate_pass_id   TEXT,
  attendance_today      attendance_status DEFAULT 'Not Marked',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Gate Passes
CREATE TABLE gate_passes (
  id                    TEXT PRIMARY KEY,
  student_id            TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name          TEXT NOT NULL,
  student_roll          TEXT NOT NULL,
  hostel                hostel_block NOT NULL,
  room                  TEXT NOT NULL,
  student_phone         TEXT NOT NULL,
  guardian_phone        TEXT NOT NULL,
  reason                gate_pass_reason NOT NULL,
  reason_detail         TEXT,
  destination           TEXT NOT NULL,
  requested_date        DATE NOT NULL,
  out_date              DATE NOT NULL,
  out_time              TEXT NOT NULL,
  expected_return_date  DATE NOT NULL,
  expected_return_time  TEXT NOT NULL,
  actual_exit_time      TEXT,
  actual_return_time    TEXT,
  status                gate_pass_status DEFAULT 'Pending',
  approved_by           TEXT,
  approved_date         DATE,
  approved_time         TEXT,
  rejection_reason      TEXT,
  qr_token              TEXT UNIQUE NOT NULL,
  additional_notes      TEXT,
  is_after_7pm_exit     BOOLEAN DEFAULT FALSE,
  is_after_7pm_return   BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Back-fill FK on students (after gate_passes exists)
ALTER TABLE students
  ADD CONSTRAINT fk_active_gate_pass
  FOREIGN KEY (active_gate_pass_id)
  REFERENCES gate_passes(id) ON DELETE SET NULL;

-- Student Movements
CREATE TABLE student_movements (
  id                      TEXT PRIMARY KEY,
  student_id              TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name            TEXT NOT NULL,
  roll_number             TEXT NOT NULL,
  hostel                  hostel_block NOT NULL,
  room                    TEXT NOT NULL,
  gate_pass_id            TEXT NOT NULL REFERENCES gate_passes(id) ON DELETE CASCADE,
  reason                  TEXT NOT NULL,
  destination             TEXT NOT NULL,
  approved_by             TEXT NOT NULL,
  approval_date           DATE NOT NULL,
  approval_time           TEXT NOT NULL,
  out_time                TEXT NOT NULL,
  expected_return         TEXT NOT NULL,
  actual_return           TEXT,
  status                  student_status NOT NULL,
  is_after_7pm_exit       BOOLEAN DEFAULT FALSE,
  is_after_7pm_return     BOOLEAN DEFAULT FALSE,
  late_minutes            INTEGER DEFAULT 0,
  exit_verified_by        TEXT,
  exit_verification_time  TEXT,
  entry_verified_by       TEXT,
  entry_verification_time TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Security Logs
CREATE TABLE security_logs (
  id                  TEXT PRIMARY KEY,
  student_id          TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name        TEXT NOT NULL,
  gate_pass_id        TEXT NOT NULL REFERENCES gate_passes(id) ON DELETE CASCADE,
  action              security_action NOT NULL,
  timestamp           TEXT NOT NULL,
  time_formatted      TEXT NOT NULL,
  security_guard_id   TEXT NOT NULL,
  security_guard_name TEXT NOT NULL,
  verification_method verification_method NOT NULL,
  notes               TEXT,
  is_after_7pm        BOOLEAN DEFAULT FALSE,
  is_late             BOOLEAN DEFAULT FALSE,
  late_duration       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Records
-- NOTE: No FK on student_id — some attendance records reference students
-- not in the main students table (e.g. from biometric sync).
CREATE TABLE attendance_records (
  id              TEXT PRIMARY KEY,
  date            DATE NOT NULL,
  student_id      TEXT NOT NULL,
  student_name    TEXT NOT NULL,
  hostel          hostel_block NOT NULL,
  block           TEXT NOT NULL,
  room            TEXT NOT NULL,
  session         attendance_session NOT NULL,
  status          attendance_status NOT NULL,
  attendance_time TEXT NOT NULL,
  marked_by       TEXT NOT NULL,
  synced_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, student_id, session)
);

-- Complaints
CREATE TABLE complaints (
  id               TEXT PRIMARY KEY,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name     TEXT NOT NULL,
  roll_number      TEXT NOT NULL,
  hostel           hostel_block NOT NULL,
  room             TEXT NOT NULL,
  category         complaint_category NOT NULL,
  subject          TEXT NOT NULL,
  description      TEXT NOT NULL,
  location         TEXT NOT NULL,
  priority         complaint_priority NOT NULL,
  created_date     DATE NOT NULL,
  created_time     TEXT NOT NULL,
  assigned_to      TEXT,
  status           complaint_status DEFAULT 'Submitted',
  last_updated     TIMESTAMPTZ DEFAULT NOW(),
  attachments      TEXT[],
  resolution_notes TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Complaint Comments
CREATE TABLE complaint_comments (
  id           TEXT PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_role  comment_author_role NOT NULL,
  timestamp    TIMESTAMPTZ DEFAULT NOW(),
  content      TEXT NOT NULL,
  is_internal  BOOLEAN DEFAULT FALSE
);

-- Group Complaints
CREATE TABLE group_complaints (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  category         complaint_category NOT NULL,
  hostel           hostel_block NOT NULL,
  block            TEXT NOT NULL,
  created_by_id    TEXT NOT NULL,
  created_by_name  TEXT NOT NULL,
  created_by_room  TEXT NOT NULL,
  members_count    INTEGER DEFAULT 1,
  priority         complaint_priority NOT NULL,
  status           complaint_status DEFAULT 'Submitted',
  created_date     DATE NOT NULL,
  assigned_to      TEXT,
  description      TEXT NOT NULL,
  resolution_notes TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Group Complaint Members
-- NOTE: No FK on student_id — members may include students not in the
-- main students table (joined from other sources).
CREATE TABLE group_complaint_members (
  id           SERIAL PRIMARY KEY,
  group_id     TEXT NOT NULL REFERENCES group_complaints(id) ON DELETE CASCADE,
  student_id   TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_number  TEXT NOT NULL,
  room         TEXT NOT NULL,
  joined_date  DATE NOT NULL,
  UNIQUE (group_id, student_id)
);

-- Group Complaint Comments
CREATE TABLE group_complaint_comments (
  id          TEXT PRIMARY KEY,
  group_id    TEXT NOT NULL REFERENCES group_complaints(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role comment_author_role NOT NULL,
  timestamp   TIMESTAMPTZ DEFAULT NOW(),
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE
);

-- Notices
CREATE TABLE notices (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  category        notice_category NOT NULL,
  description     TEXT NOT NULL,
  priority        notice_priority NOT NULL,
  publish_date    DATE NOT NULL,
  expiry_date     DATE NOT NULL,
  status          notice_status DEFAULT 'Draft',
  author          TEXT NOT NULL,
  attachment_name TEXT,
  attachment_url  TEXT,
  target_audience notice_audience NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Hostel Events
CREATE TABLE hostel_events (
  id                    TEXT PRIMARY KEY,
  event_name            TEXT NOT NULL,
  description           TEXT NOT NULL,
  date                  DATE NOT NULL,
  time                  TEXT NOT NULL,
  venue                 TEXT NOT NULL,
  organizer             TEXT NOT NULL,
  image_url             TEXT,
  registration_required BOOLEAN DEFAULT FALSE,
  maximum_participants  INTEGER NOT NULL,
  current_registrations INTEGER DEFAULT 0,
  status                event_status DEFAULT 'Upcoming',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Notifications
-- NOTE: Use created_at as the real timestamp.
-- The app displays it as a relative string (e.g. "2 mins ago").
CREATE TABLE admin_notifications (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       notification_type NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  link       TEXT,
  badge      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── updated_at TRIGGERS ─────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER gate_passes_updated_at
  BEFORE UPDATE ON gate_passes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER hostel_events_updated_at
  BEFORE UPDATE ON hostel_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on all tables

ALTER TABLE admin_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students              ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints            ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_complaints      ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_complaint_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices               ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications   ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users (admin portal staff) full access.
-- Tighten per-role policies before production.
CREATE POLICY "Authenticated admin full access" ON admin_users          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON students             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON gate_passes          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON student_movements    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON security_logs        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON attendance_records   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON complaints           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON complaint_comments   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON group_complaints     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON group_complaint_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON group_complaint_comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON notices              FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON hostel_events        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin full access" ON admin_notifications  FOR ALL USING (auth.role() = 'authenticated');

-- ─── DONE ────────────────────────────────────────────────────
-- Schema created successfully.
-- Next: seed with data from mockData.ts, then set env vars.
