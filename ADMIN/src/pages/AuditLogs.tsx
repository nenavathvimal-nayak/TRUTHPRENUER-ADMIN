import { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Filter, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuditEvent {
  event_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id?: string;
  result: string;
  ip_address?: string;
  reason?: string;
  timestamp: number;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL;
      if (apiUrl) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || '';
        const res = await fetch(`${apiUrl}/api/v1/admin/audit-logs?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
          setLoading(false);
          return;
        }
      }

      // Query Supabase directly
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Direct audit log query error:', error.message);
        setLogs([]);
      } else if (data) {
        const mapped: AuditEvent[] = data.map((d: any) => ({
          event_id: d.event_id || d.id,
          actor_id: d.actor_id || 'system',
          actor_role: d.actor_role || 'Admin',
          action: d.action,
          target_type: d.target_type,
          target_id: d.target_id,
          result: d.result || 'SUCCESS',
          ip_address: d.ip_address,
          reason: d.reason,
          timestamp: d.created_at ? new Date(d.created_at).getTime() / 1000 : Date.now() / 1000,
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterAction === 'all' || log.action.includes(filterAction);
    const matchesSearch =
      log.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.target_id && log.target_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#FEF8E8] flex items-center gap-2">
            <ShieldCheck className="text-[#F44A22]" size={24} />
            Administrative Audit Trail
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Immutable, cryptographically verifiable records of all privileged platform operations (Section 9, 44).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center space-x-2 rounded-lg border border-[#2A2A2A] bg-[#1F1F1F] px-3.5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#F44A22]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by Event ID, Actor, Target, or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#2A2A2A] bg-[#1F1F1F] pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#F44A22] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg border border-[#2A2A2A] bg-[#1F1F1F] px-3 py-2 text-xs text-white focus:border-[#F44A22] focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="USER_">User Actions</option>
            <option value="REPORT_">Report Actions</option>
            <option value="RATE_">Rate Limiting</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2A2A2A] bg-[#161616] text-gray-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5">Result</th>
                <th className="px-5 py-3.5">Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.event_id} className="hover:bg-white/[0.02] transition-colors font-mono">
                    <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                      {new Date(entry.timestamp * 1000).toLocaleTimeString()} · {new Date(entry.timestamp * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded bg-[#F44A22]/10 px-2 py-0.5 font-bold text-[#F44A22]">
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      <div>{entry.actor_id}</div>
                      <span className="text-[10px] text-gray-500">({entry.actor_role})</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      <span className="text-gray-500">{entry.target_type}:</span> {entry.target_id || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      {entry.result === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <CheckCircle2 size={13} /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <AlertTriangle size={13} /> {entry.result}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 font-sans max-w-xs truncate" title={entry.reason || ''}>
                      {entry.reason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
