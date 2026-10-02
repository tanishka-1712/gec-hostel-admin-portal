import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileCheck,
  ArrowLeftRight,
  ClockAlert,
  MessageSquareWarning,
  BellRing,
  CalendarDays,
  QrCode,
  ShieldAlert,
  Bell,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHostel } from '../../context/HostelContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { logout } = useAuth();
  const { gatePasses, movements, complaints, notifications } = useHostel();
  const navigate = useNavigate();

  const pendingPassesCount = gatePasses.filter((g) => g.status === 'Pending').length;
  const overdueCount = movements.filter((m) => m.status === 'Overdue').length;
  const openComplaintsCount = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'In Progress').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/admin/students',
      label: 'Students',
      icon: Users
    },
    {
      to: '/admin/attendance',
      label: 'Attendance',
      icon: CalendarCheck
    },
    {
      to: '/admin/gate-passes',
      label: 'Gate Pass Management',
      icon: FileCheck,
      badge: pendingPassesCount > 0 ? pendingPassesCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      to: '/admin/student-movement',
      label: 'Student Exit & Entry',
      icon: ArrowLeftRight,
      badge: overdueCount > 0 ? `${overdueCount}!` : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse'
    },
    {
      to: '/admin/after-7pm',
      label: 'After 7 PM Movement',
      icon: ClockAlert,
      highlight: true
    },
    {
      to: '/admin/complaints',
      label: 'Complaints & Grievances',
      icon: MessageSquareWarning,
      badge: openComplaintsCount > 0 ? openComplaintsCount : undefined,
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      to: '/admin/notices',
      label: 'Notices',
      icon: BellRing
    },
    {
      to: '/admin/events',
      label: 'Events',
      icon: CalendarDays
    },
    {
      to: '/admin/qr-verification',
      label: 'QR Verification',
      icon: QrCode
    },
    {
      to: '/admin/security-activity',
      label: 'Security Activity',
      icon: ShieldAlert
    },
    {
      to: '/admin/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      to: '/admin/reports',
      label: 'Reports',
      icon: FileSpreadsheet
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/90 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header: HOSTEL MANAGEMENT */}
        <div className="flex items-center justify-between h-17 px-4 border-b border-slate-100 bg-white shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  GEC AUTONOMOUS
                </span>
                <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                  HOSTEL MANAGEMENT
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar-link group relative ${
                    isActive ? 'active' : ''
                  } ${item.highlight && !isActive ? 'hover:bg-amber-50 hover:text-amber-700' : ''}`
                }
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105`} />
                {!collapsed && (
                  <span className="truncate flex-1 font-medium">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer: User & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm cursor-pointer"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 text-red-500 shrink-0" />
            {!collapsed && <span className="font-semibold text-red-600">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
