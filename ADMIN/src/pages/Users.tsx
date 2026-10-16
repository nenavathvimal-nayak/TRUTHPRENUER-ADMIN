import { useState, useEffect } from 'react';
import { Ban, CheckCircle2, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../components/AdminAuthGuard';
import { supabase } from '../lib/supabase';

interface UserRecord {
  id: string;
  full_name: string;
  username: string;
  email?: string;
  role: string;
  is_suspended: boolean;
  joined: string;
}

export function Users() {
  const { user: currentAdmin } = useAdminAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, is_suspended, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setActionFeedback(`Database query failed: ${error.message}`);
        setLoading(false);
        return;
      }

      const mapped: UserRecord[] = (data || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name || p.username || 'User',
        username: p.username || 'user',
        email: `@${p.username || p.id.substring(0, 8)}`,
        role: p.role || 'Founder',
        is_suspended: !!p.is_suspended,
        joined: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : 'Recently',
      }));
      setUsers(mapped);
    } catch (err: any) {
      setActionFeedback(`Error loading users: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (targetUser: UserRecord) => {
    if (targetUser.id === currentAdmin?.id) {
      alert("Security Guard: You cannot perform administrative suspension on your own session.");
      return;
    }

    const newSuspendedState = !targetUser.is_suspended;
    const reason = newSuspendedState 
      ? prompt("Enter audit justification for suspension (required):", "Suspicious spam behavior") 
      : prompt("Enter audit justification for account restoration:", "Verification completed");

    if (!reason || !reason.trim()) return;

    try {
      // 1. Update profiles table in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_suspended: newSuspendedState,
          suspended_at: newSuspendedState ? new Date().toISOString() : null,
          suspension_reason: newSuspendedState ? reason.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUser.id);

      if (updateError) {
        setActionFeedback(`Action failed: ${updateError.message}`);
        return;
      }

      // 2. Persist audit log
      await supabase.from('admin_audit_logs').insert({
        event_id: `evt-${crypto.randomUUID()}`,
        actor_id: currentAdmin?.id,
        actor_role: currentAdmin?.role || 'Admin',
        action: newSuspendedState ? 'USER_SUSPENDED' : 'USER_RESTORED',
        target_type: 'user',
        target_id: targetUser.id,
        result: 'SUCCESS',
        reason: reason.trim(),
        details: { target_name: targetUser.full_name, previous_status: targetUser.is_suspended },
      });

      setUsers(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          return {
            ...u,
            is_suspended: newSuspendedState,
          };
        }
        return u;
      }));

      setActionFeedback(`User ${targetUser.full_name} (${targetUser.id.substring(0, 8)}) was ${newSuspendedState ? 'SUSPENDED' : 'RESTORED'}. Audit event recorded.`);
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      setActionFeedback(`Operation failed: ${err.message || err}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#FEF8E8]">User Accounts & Roles</h2>
          <p className="text-xs text-gray-400 mt-1">
            Server-side authorization and RBAC governance. All suspension actions require explicit audit justification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-2 text-xs font-mono px-3 py-2 rounded-xl bg-[#222222] text-[#FEF8E8] border border-[#2A2A2A] hover:border-[#F44A22] transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1F1F1F] border border-[#2A2A2A] text-white pl-9 pr-4 py-2 rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-[#F44A22] w-64"
            />
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="flex items-center space-x-2 rounded-xl border border-[#F44A22]/30 bg-[#F44A22]/10 p-3.5 text-xs text-[#FEF8E8] font-mono">
          <AlertTriangle size={16} className="text-[#F44A22]" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#1F1F1F] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#161616] border-b border-[#2A2A2A] text-gray-400 font-mono uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">User Identity</th>
              <th className="px-6 py-4 font-medium">Assigned Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {!loading && filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F44A22]/10 text-[#F44A22] flex items-center justify-center font-bold text-xs border border-[#F44A22]/20">
                    {u.full_name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[#FEF8E8] font-semibold">{u.full_name}</span>
                    <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                    u.role.includes('Admin') ? 'bg-[#F44A22]/15 text-[#F44A22] border border-[#F44A22]/30' : 'bg-[#161616] text-gray-300 border border-[#2A2A2A]'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.is_suspended ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] font-bold">
                      <Ban size={11} /> Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-mono text-[10px] font-bold">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-gray-400">
                  {u.joined}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggleSuspend(u)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      u.is_suspended
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    {u.is_suspended ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Restore Access</span>
                      </>
                    ) : (
                      <>
                        <Ban size={13} />
                        <span>Suspend Account</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 font-mono">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-[#F44A22] mr-2"></div>
                  Loading authentic user profiles from Supabase...
                </td>
              </tr>
            )}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 font-mono">
                  No registered profiles found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
