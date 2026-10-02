import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  ChevronDown, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  User, 
  LogOut, 
  CheckCircle2, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHostel } from '../../context/HostelContext';
import { Role } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchRole } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, movements } = useHostel();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Live ticking clock (seconds included)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const unreadNotifications = notifications.filter((n) => !n.read);
  const overdueCount = movements.filter((m) => m.status === 'Overdue').length;

  const handleRoleChange = (role: Role) => {
    switchRole(role);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Live Clock */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* College Mini Label for Mobile/Small Screen */}
          <div className="hidden xl:block">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              GEC Autonomous College, Bhubaneswar
            </span>
          </div>

          {/* Live Date & Time Display */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 border border-slate-200/70 rounded-xl px-3 sm:px-4 py-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse shrink-0" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Overdue alert indicator if active */}
          {overdueCount > 0 && (
            <Link
              to="/admin/student-movement"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>{overdueCount} Overdue Outside</span>
            </Link>
          )}
        </div>

        {/* Right: Quick Actions, Notifications, Role & Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* QR Scan Quick Link */}
          <Link
            to="/admin/qr-verification"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Verify QR</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs animate-bounce">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 animate-slide-up overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    {unreadNotifications.length > 0 && (
                      <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {unreadNotifications.length} New
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.badge && (
                          <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {notif.badge}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 p-2.5 text-center bg-slate-50/50">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View All Notifications
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name.charAt(0) || 'A'
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name.split(' ')[0] || 'Admin'}
                </p>
                <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 animate-slide-up p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.designation}</p>
                  <p className="text-[10px] text-blue-600 font-mono mt-0.5">{user?.id}</p>
                </div>

                {/* Role Switcher Demo */}
                <div className="px-3 py-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Switch Active Role
                  </p>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('ADMIN')}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                        user?.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Chief Warden (ADMIN)</span>
                      {user?.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('PRINCIPAL')}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                        user?.role === 'PRINCIPAL' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Principal Office</span>
                      {user?.role === 'PRINCIPAL' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('WARDEN')}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                        user?.role === 'WARDEN' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Hostel Warden / HOD</span>
                      {user?.role === 'WARDEN' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Portal Settings & Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
