import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  FileCheck, 
  ShieldCheck, 
  RotateCcw,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { Badge } from '../components/common/Badge';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useHostel();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<string>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'AFTER_7PM') return n.type === 'AFTER_7PM';
    if (filterType === 'GATE_PASS') return n.type === 'GATE_PASS';
    if (filterType === 'COMPLAINT') return n.type === 'COMPLAINT';
    if (filterType === 'ATTENDANCE_SYNC') return n.type === 'ATTENDANCE_SYNC';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'AFTER_7PM':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'GATE_PASS':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      case 'COMPLAINT':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'ATTENDANCE_SYNC':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-blue text-[11px]">Administrative Alert Hub</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Live Surveillance & System Pings</span>
          </div>
          <h1 className="page-header text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-blue-600" />
            <span>Administrative Notifications</span>
            {unreadCount > 0 && (
              <span className="badge-red text-xs px-2.5 py-0.5 ml-2">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="page-subtitle text-slate-500 text-xs sm:text-sm mb-0">
            Real-time feed of gate pass clearances, post-7 PM alerts, overdue boarders, and biometric roll calls.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('unread')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'unread' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('AFTER_7PM')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'AFTER_7PM' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚠ After 7 PM Movements
        </button>
        <button
          type="button"
          onClick={() => setFilterType('GATE_PASS')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'GATE_PASS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gate Passes
        </button>
        <button
          type="button"
          onClick={() => setFilterType('COMPLAINT')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'COMPLAINT' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Grievances
        </button>
        <button
          type="button"
          onClick={() => setFilterType('ATTENDANCE_SYNC')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'ATTENDANCE_SYNC' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attendance Syncs
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-xs text-slate-400">
            No notifications matching current filter.
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`card p-4 sm:p-5 transition-all hover:shadow-md cursor-pointer border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                !notif.read ? 'bg-blue-50/40 border-blue-200/80 shadow-2xs' : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    {notif.badge && (
                      <span className="badge text-[10px] bg-slate-100 text-slate-700">
                        {notif.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs text-slate-400">
                <span className="font-mono">{notif.timestamp}</span>
                {notif.link && (
                  <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
