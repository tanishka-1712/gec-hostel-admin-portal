import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HostelProvider } from './context/HostelContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { StudentsPage } from './pages/Students';
import { AttendancePage } from './pages/Attendance';
import { GatePassesPage } from './pages/GatePasses';
import { StudentMovementPage } from './pages/StudentMovement';
import { After7PMMonitoring } from './pages/After7PMMonitoring';
import { ComplaintsPage } from './pages/Complaints';
import { NoticesPage } from './pages/Notices';
import { EventsPage } from './pages/Events';
import { QRVerificationPage } from './pages/QRVerification';
import { SecurityActivityPage } from './pages/SecurityActivity';
import { NotificationsPage } from './pages/Notifications';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HostelProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="gate-passes" element={<GatePassesPage />} />
              <Route path="student-movement" element={<StudentMovementPage />} />
              <Route path="after-7pm" element={<After7PMMonitoring />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="qr-verification" element={<QRVerificationPage />} />
              <Route path="security-activity" element={<SecurityActivityPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            {/* 404 Catch All */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </HostelProvider>
    </AuthProvider>
  );
};

export default App;
