import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  Shield, 
  ArrowUpRight, 
  RefreshCw, 
  Clock 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VerificationVelocityChart } from '../components/visuals/VerificationVelocityChart';
import { CategoryDonutChart } from '../components/visuals/CategoryDonutChart';
import { SystemMetricsGauges } from '../components/visuals/SystemMetricsGauges';
import { SecurityPostureRadar } from '../components/visuals/SecurityPostureRadar';
import { ActivityHeatmap } from '../components/visuals/ActivityHeatmap';
import { GlobalMeshNodes } from '../components/visuals/GlobalMeshNodes';

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 68;
  const h = 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible select-none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function EnhancedStatCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  sparkData,
  color = '#F44A22',
  accent = false,
}: {
  title: string;
  value: string;
  change: string;
  subtitle: string;
  icon: any;
  sparkData: number[];
  color?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
        accent
          ? 'border-[#F44A22]/50 bg-gradient-to-br from-[#221A18] via-[#1E1716] to-[#161616] shadow-lg shadow-[#F44A22]/10'
          : 'border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">{title}</span>
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${color}18`, color: color }}
        >
          <Icon size={17} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-[#FEF8E8] tracking-tight">{value}</div>
          <div className="flex items-center space-x-1 mt-1">
            <span className="text-xs font-mono font-bold text-green-400 flex items-center">
              <ArrowUpRight size={13} className="mr-0.5" />
              {change}
            </span>
            <span className="text-[11px] text-gray-400 font-normal">· {subtitle}</span>
          </div>
        </div>

        <div className="pb-1">
          <MiniSparkline data={sparkData} color={color} />
        </div>
      </div>
    </div>
  );
}

interface ValidationItem {
  id: string;
  thesis: string;
  stage: string;
  upvotes: number;
  created_at: string;
}

export function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    validations: 0,
    verified: 0,
    profiles: 0,
    auditLogs: 0,
  });
  const [recentValidations, setRecentValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch live metrics from Supabase
      const [
        { count: validationsCount },
        { count: verifiedCount },
        { count: profilesCount },
        { count: auditLogsCount },
        { data: valData }
      ] = await Promise.all([
        supabase.from('validations').select('*', { count: 'exact', head: true }),
        supabase.from('validations').select('*', { count: 'exact', head: true }).eq('stage', 'verified'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('admin_audit_logs').select('*', { count: 'exact', head: true }),
        supabase.from('validations').select('id, thesis, stage, upvotes, created_at').order('created_at', { ascending: false }).limit(4)
      ]);

      setStats({
        validations: validationsCount || 0,
        verified: verifiedCount || 0,
        profiles: profilesCount || 0,
        auditLogs: auditLogsCount || 0,
      });

      setRecentValidations(valData || []);
    } catch (err) {
      console.warn('Dashboard telemetry fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-7">
      {/* Top Banner & Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black tracking-tight text-[#FEF8E8]">
              Executive Telemetry & Verification Hub
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F44A22]/10 text-[#F44A22] border border-[#F44A22]/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F44A22] animate-pulse" />
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Authoritative database metrics, consensus verification dispatches, and Zero-Trust boundary posture.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-gray-400 bg-[#141414] border border-[#2A2A2A] px-3 py-2 rounded-xl">
            <Clock size={14} className="text-[#F44A22]" />
            <span>Isolated Privileged Console</span>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-xs font-mono px-3.5 py-2 rounded-xl bg-[#222222] text-[#FEF8E8] border border-[#2A2A2A] hover:border-[#F44A22] hover:text-[#F44A22] transition-colors"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Interactive KPI Stat Cards with SVG Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnhancedStatCard
          title="Consensus Validations"
          value={loading ? '—' : stats.validations.toLocaleString()}
          change="LIVE"
          subtitle="database records"
          icon={Activity}
          sparkData={[stats.validations, stats.validations, stats.validations]}
          color="#F44A22"
          accent={true}
        />
        <EnhancedStatCard
          title="Verified Truth Records"
          value={loading ? '—' : stats.verified.toLocaleString()}
          change="SEALED"
          subtitle="empirical consensus"
          icon={CheckCircle}
          sparkData={[stats.verified, stats.verified, stats.verified]}
          color="#10B981"
        />
        <EnhancedStatCard
          title="Active Founder Profiles"
          value={loading ? '—' : stats.profiles.toLocaleString()}
          change="ACTIVE"
          subtitle="authenticated identities"
          icon={Users}
          sparkData={[stats.profiles, stats.profiles, stats.profiles]}
          color="#3B82F6"
        />
        <EnhancedStatCard
          title="Security Audit Records"
          value={loading ? '—' : stats.auditLogs.toLocaleString()}
          change="WORM"
          subtitle="immutable logs"
          icon={Shield}
          sparkData={[stats.auditLogs, stats.auditLogs, stats.auditLogs]}
          color="#8B5CF6"
        />
      </div>

      {/* Primary Analytics Row: Velocity Area Chart & Industry Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VerificationVelocityChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Secondary Row: System Metrics Gauges & Security Posture Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemMetricsGauges />
        </div>
        <div className="lg:col-span-1">
          <SecurityPostureRadar />
        </div>
      </div>

      {/* Tertiary Row: Hourly Heatmap & Global Mesh Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityHeatmap />
        <GlobalMeshNodes />
      </div>

      {/* Recent High-Priority Validation Decisions Table */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-sm text-[#FEF8E8]">Recent Verification Dispatches & Evidence Reports</h3>
            <p className="text-xs text-gray-400 mt-0.5">Authoritative validations loaded from Supabase</p>
          </div>
          <span className="text-[11px] font-mono text-gray-400 bg-[#161616] px-2.5 py-1 rounded-lg border border-[#2A2A2A]">
            Auto-Sync Active
          </span>
        </div>

        {recentValidations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-mono text-xs">
            {loading ? 'Loading recent verifications from database...' : 'No verification dispatches recorded yet in database.'}
          </div>
        ) : (
          <div className="space-y-3">
            {recentValidations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-gray-500">{item.id.substring(0, 8)}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#222222] text-gray-300 uppercase">
                      {item.stage || 'STAGE'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#FEF8E8]">{item.thesis}</div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#FEF8E8]">{item.upvotes || 0} votes</div>
                    <div className="text-[10px] font-mono text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                    item.stage === 'verified'
                      ? 'text-green-400 bg-green-500/10 border-green-500/30'
                      : 'text-[#F44A22] bg-[#F44A22]/10 border-[#F44A22]/30'
                  }`}>
                    {item.stage ? item.stage.toUpperCase() : 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
