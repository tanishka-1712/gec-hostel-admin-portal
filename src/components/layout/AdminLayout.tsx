import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col antialiased">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <Header onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/40">
          <p>© 2026 Gandhi Engineering College (GEC Autonomous), Bhubaneswar. Central Hostel Administration Portal.</p>
        </footer>
      </div>
    </div>
  );
};
