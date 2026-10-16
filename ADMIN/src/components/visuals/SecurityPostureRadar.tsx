import { ShieldCheck } from 'lucide-react';

interface SecurityAxis {
  name: string;
  score: number; // 0-100
  fullMark: number;
}

const securityAxes: SecurityAxis[] = [
  { name: 'Zero-Trust Loopback', score: 100, fullMark: 100 },
  { name: 'WORM Audit Log', score: 100, fullMark: 100 },
  { name: 'Supabase RLS', score: 100, fullMark: 100 },
  { name: 'Prompt Defense', score: 96, fullMark: 100 },
  { name: 'Rate Limiter', score: 98, fullMark: 100 },
  { name: 'JWT Fail-Closed', score: 100, fullMark: 100 },
];

export function SecurityPostureRadar() {
  const size = 260;
  const center = size / 2;
  const radius = 85;
  const totalAxes = securityAxes.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // Calculate polygon coordinates for a given percentage of radius
  const getCoordinates = (scores: number[]) => {
    return scores.map((score, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (score / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const actualPoints = getCoordinates(securityAxes.map(a => a.score));

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717] p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            <ShieldCheck size={16} />
          </div>
          <h3 className="font-bold text-sm text-[#FEF8E8]">Security Boundary Radar</h3>
        </div>
        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
          99.0 / 100
        </span>
      </div>

      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} className="select-none overflow-visible">
          {/* Background web rings (25%, 50%, 75%, 100%) */}
          {[0.25, 0.5, 0.75, 1].map((pct, idx) => (
            <polygon
              key={idx}
              points={getCoordinates(Array(totalAxes).fill(pct * 100))}
              fill="transparent"
              stroke="#2A2A2A"
              strokeWidth="1"
              strokeDasharray={pct === 1 ? 'none' : '3 3'}
            />
          ))}

          {/* Radial axis lines */}
          {securityAxes.map((_, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#2A2A2A"
                strokeWidth="1"
              />
            );
          })}

          {/* Actual score polygon area */}
          <polygon
            points={actualPoints}
            fill="#10B981"
            fillOpacity="0.25"
            stroke="#10B981"
            strokeWidth="2"
          />

          {/* Data point dots and text labels */}
          {securityAxes.map((axis, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const r = (axis.score / 100) * radius;
            const cx = center + r * Math.cos(angle);
            const cy = center + r * Math.sin(angle);

            // Label positioning
            const labelR = radius + 22;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#10B981"
                  stroke="#161616"
                  strokeWidth="1.5"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[9px] font-mono fill-gray-400 font-medium"
                >
                  {axis.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-3 border-t border-[#2A2A2A] flex justify-between items-center text-xs">
        <span className="text-gray-400 text-[11px]">Audit Engine State</span>
        <span className="text-[11px] font-mono text-green-400 font-bold">Hardened & Enforced</span>
      </div>
    </div>
  );
}
