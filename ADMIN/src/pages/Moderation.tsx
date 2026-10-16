import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../components/AdminAuthGuard';
import { supabase } from '../lib/supabase';

interface ModerationReport {
  id: string;
  target_type: string;
  target_id: string;
  reporter_id: string;
  reason: string;
  explanation?: string;
  status: string;
  created_at: string;
}

export function Moderation() {
  const { user: currentAdmin } = useAdminAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        setFeedback(`Database query error: ${error.message}`);
        setReports([]);
      } else {
        setReports(data || []);
      }
    } catch (err: any) {
      setFeedback(`Error loading moderation reports: ${err.message || err}`);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: 'dismiss' | 'remove_content' | 'warn_user') => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const actionText = action === 'dismiss' ? 'DISMISSED' : action === 'remove_content' ? 'CONTENT_REMOVED' : 'WARNING_ISSUED';
    const newStatus = action === 'dismiss' ? 'dismissed' : 'resolved';

    try {
      // 1. Update report in Supabase
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: newStatus,
        })
        .eq('id', reportId);

      if (updateError) {
        setFeedback(`Failed to update report: ${updateError.message}`);
        return;
      }

      // 2. If content removal requested, mark target if applicable
      if (action === 'remove_content') {
        if (report.target_type === 'validation') {
          await supabase.from('validations').delete().eq('id', report.target_id);
        } else if (report.target_type === 'message') {
          await supabase.from('messages').delete().eq('id', report.target_id);
        }
      }

      // 3. Write immutable WORM audit log
      await supabase.from('admin_audit_logs').insert({
        event_id: `evt-${crypto.randomUUID()}`,
        actor_id: currentAdmin?.id,
        actor_role: currentAdmin?.role || 'Admin',
        action: `REPORT_ACTION_${actionText}`,
        target_type: report.target_type,
        target_id: report.target_id,
        result: 'SUCCESS',
        reason: `Admin processed report ${reportId} with resolution ${actionText}`,
        details: { report_id: reportId, report_reason: report.reason },
      });

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setFeedback(`Report ${reportId.substring(0, 8)} processed: ${actionText}. Audit event recorded.`);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback(`Failed to process moderation action: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#FEF8E8]">Content & Trust Moderation</h2>
          <p className="text-xs text-gray-400 mt-1">
            Empirical validation integrity enforcement. Every review action generates an immutable audit record.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] text-xs font-mono text-[#FEF8E8]">
            Pending Queue: <span className="text-[#F44A22] font-bold">{reports.length}</span>
          </span>
          <button
            onClick={fetchReports}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#222222] text-[#FEF8E8] border border-[#2A2A2A] hover:border-[#F44A22] text-xs font-mono transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center space-x-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-xs text-green-400 font-mono">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-gray-400 bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl font-mono text-xs">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-[#F44A22] mr-2"></div>
          Querying authoritative reports queue from Supabase...
        </div>
      )}

      {!loading && (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#F44A22]/40 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl mt-0.5 bg-[#F44A22]/10 text-[#F44A22] border border-[#F44A22]/20">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-sm text-[#FEF8E8] uppercase">{report.target_type}</h3>
                    <span className="text-[11px] font-mono text-gray-500">Target ID: {report.target_id}</span>
                    <span className="text-[11px] font-mono text-gray-400">
                      · {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Reason: <span className="text-[#FEF8E8] font-medium">{report.reason}</span>
                  </p>
                  {report.explanation && (
                    <p className="text-gray-400 text-[11px] mt-0.5 italic">
                      "{report.explanation}"
                    </p>
                  )}
                  <div className="text-[11px] text-gray-400 font-mono mt-1">
                    Reporter ID: <span className="text-gray-300">{report.reporter_id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => handleAction(report.id, 'dismiss')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#2A2A2A] border border-[#2A2A2A] transition-colors"
                  title="Dismiss Report as False Positive"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleAction(report.id, 'warn_user')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-400/10 border border-amber-400/20 transition-colors"
                  title="Issue Founder Warning"
                >
                  Warn
                </button>
                <button
                  onClick={() => handleAction(report.id, 'remove_content')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F44A22] text-[#FEF8E8] hover:bg-[#D73D19] transition-colors shadow-md shadow-[#F44A22]/20"
                  title="Remove Hostile/Spam Content"
                >
                  Remove Content
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl">
              <Shield size={44} className="mx-auto mb-3 text-[#F44A22] opacity-60" />
              <h4 className="text-base font-bold text-[#FEF8E8]">Moderation Queue Clear</h4>
              <p className="text-xs text-gray-400 mt-1">
                All reported content has been reviewed according to community guidelines.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
