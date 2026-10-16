import { Activity, ShieldCheck, Gauge, Zap } from 'lucide-react';

interface MetricGaugeProps {
  label: string;
  value: number;
  displayValue: string;
  unit: string;
  status: 'optimal' | 'good' | 'warning';
  icon: any;
}

function RadialGauge({ label, value, displayValue, unit, status, icon: Icon }: MetricGaugeProps) {
  const size = 110;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const colorMap = {
    optimal: '#10B981',
    good: '#3B82F6',
    warning: '#F59E0B',
  };

  const strokeColor = colorMap[status];

  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90 select-none">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#262626"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center flex flex-col items-center">
          <Icon size={14} className="mb-0.5" style={{ color: strokeColor }} />
          <div className="text-sm font-black text-[#FEF8E8] leading-none font-mono">
            {displayValue}
          </div>
          <div className="text-[9px] text-gray-500 font-mono">{unit}</div>
        </div>
      </div>
      <div className="text-xs font-semibold text-gray-300 mt-2 text-center">{label}</div>
    </div>
  );
}

export function SystemMetricsGauges() {
  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717] p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            <Gauge size={16} />
          </div>
          <h3 className="font-bold text-sm text-[#FEF8E8]">Real-Time Health & Infrastructure Telemetry</h3>
        </div>
        <span className="flex items-center space-x-1.5 text-[11px] font-mono text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Operational 99.98%</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
        <RadialGauge
          label="Truth Consensus"
          value={94}
          displayValue="94.2"
          unit="%"
          status="optimal"
          icon={Activity}
        />
        <RadialGauge
          label="RLS Security"
          value={100}
          displayValue="100"
          unit="% Enforced"
          status="optimal"
          icon={ShieldCheck}
        />
        <RadialGauge
          label="Edge Latency"
          value={76}
          displayValue="38"
          unit="ms p95"
          status="good"
          icon={Zap}
        />
        <RadialGauge
          label="Engine Load"
          value={28}
          displayValue="28.4"
          unit="% CPU"
          status="optimal"
          icon={Gauge}
        />
      </div>
    </div>
  );
}
