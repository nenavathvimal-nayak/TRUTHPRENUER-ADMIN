import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminAuthGuard } from './components/AdminAuthGuard';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Moderation } from './pages/Moderation';
import { AuditLogs } from './pages/AuditLogs';

const Settings = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-[#FEF8E8]">Platform & Security Infrastructure Settings</h2>
    <div className="rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-6 space-y-4 max-w-2xl">
      <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2A]">
        <div>
          <div className="font-semibold text-sm text-white">Edge WAF & Zero Trust</div>
          <div className="text-xs text-gray-400">Cloudflare proxy mode and strict challenge rules</div>
        </div>
        <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-xs font-mono font-bold">Active</span>
      </div>
      <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2A]">
        <div>
          <div className="font-semibold text-sm text-white">Database Row Level Security</div>
          <div className="text-xs text-gray-400">Deny-by-default access policies across all 21 core tables</div>
        </div>
        <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-xs font-mono font-bold">Enforced</span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm text-white">Rate Limiter Burst Guard</div>
          <div className="text-xs text-gray-400">Sliding window protection against scrapers & brute force</div>
        </div>
        <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-xs font-mono font-bold">Enabled</span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AdminAuthGuard>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="moderation" element={<Moderation />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AdminAuthGuard>
    </BrowserRouter>
  );
}

export default App;
