import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminAuth } from './AdminAuthGuard';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const location = useLocation();
  const { user, signOut } = useAdminAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users & Roles', path: '/users', icon: Users },
    { name: 'Moderation', path: '/moderation', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/audit-logs', icon: FileText },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#161616] text-[#FFFFFF] font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#2A2A2A] bg-[#1F1F1F] p-5 flex flex-col">
        {/* Brand header */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F44A22] text-[#FEF8E8] shadow-lg shadow-[#F44A22]/20">
            <Shield size={22} />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-[#FEF8E8]">TRUTHPRENUER</div>
            <div className="text-[10px] font-mono tracking-widest text-[#F44A22] uppercase">Admin Gateway</div>
          </div>
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                  isActive 
                    ? "bg-[#F44A22] text-[#FEF8E8] shadow-md shadow-[#F44A22]/20" 
                    : "text-gray-400 hover:bg-[#2A2A2A] hover:text-[#FEF8E8]"
                )}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & session security */}
        <div className="mt-auto border-t border-[#2A2A2A] pt-4 px-2">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>Security Boundary</span>
            <span className="text-green-400 font-mono">Zero Trust</span>
          </div>
          <div className="text-[10px] text-gray-600 font-mono">
            Truthprenuer v1.0.0-mvp
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <header className="h-16 border-b border-[#2A2A2A] flex items-center justify-between px-8 bg-[#1F1F1F]/70 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-mono">Control Plane</span>
            <span className="text-gray-600">/</span>
            <h1 className="text-sm font-bold text-[#FEF8E8]">
              {navItems.find(n => n.path === location.pathname)?.name || 'Admin Area'}
            </h1>
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-mono text-green-400 font-semibold ml-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>127.0.0.1:60135 (Private Loopback)</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User identity & role badge */}
            <div className="flex items-center space-x-3 bg-[#161616] border border-[#2A2A2A] rounded-xl px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F44A22]/20 text-[#F44A22] font-bold text-xs">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-[#FEF8E8] leading-tight">
                  {user?.email || 'admin@truthprenuer.com'}
                </div>
                <div className="text-[10px] font-mono text-[#F44A22]">
                  {user?.role || 'Admin'}
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={signOut}
              title="Terminate Admin Session"
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-auto p-8 bg-[#161616]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
