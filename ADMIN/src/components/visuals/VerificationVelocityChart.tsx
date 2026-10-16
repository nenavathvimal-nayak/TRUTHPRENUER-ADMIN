import { useState } from 'react';
import { TrendingUp, Zap } from 'lucide-react';

interface DataPoint {
  time: string;
  total: number;
  verified: number;
  disputed: number;
}

const dataByRange: Record<string, DataPoint[]> = {
  '24h': [
    { time: '00:00', total: 18, verified: 15, disputed: 3 },
    { time: '04:00', total: 12, verified: 10, disputed: 2 },
    { time: '08:00', total: 34, verified: 29, disputed: 5 },
    { time: '12:00', total: 68, verified: 59, disputed: 9 },
    { time: '16:00', total: 92, verified: 81, disputed: 11 },
    { time: '20:00', total: 74, verified: 65, disputed: 9 },
    { time: '23:59', total: 45, verified: 40, disputed: 5 },
  ],
  '7d': [
    { time: 'Mon', total: 142, verified: 124, disputed: 18 },
    { time: 'Tue', total: 189, verified: 168, disputed: 21 },
    { time: 'Wed', total: 220, verified: 198, disputed: 22 },
    { time: 'Thu', total: 265, verified: 239, disputed: 26 },
    { time: 'Fri', total: 310, verified: 280, disputed: 30 },
    { time: 'Sat', total: 195, verified: 175, disputed: 20 },
    { time: 'Sun', total: 160, verified: 144, disputed: 16 },
  ],
  '30d': [
    { time: 'W1', total: 980, verified: 882, disputed: 98 },
    { time: 'W2', total: 1240, verified: 1116, disputed: 124 },
    { time: 'W3', total: 1490, verified: 1341, disputed: 149 },
    { time: 'W4', total: 1820, verified: 1638, disputed: 182 },
  ]
};

export function VerificationVelocityChart() {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = dataByRange[range];
  const maxVal = Math.max(...data.map(d => d.total)) * 1.15;

  const width = 680;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const getX = (index: number) => paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
  const getY = (val: number) => height - paddingY - (val / maxVal) * (height - 2 * paddingY);

  // Generate smooth SVG curve for Total
  const totalPoints = data.map((d, i) => `${getX(i)},${getY(d.total)}`);
  const verifiedPoints = data.map((d, i) => `${getX(i)},${getY(d.verified)}`);

  const totalPath = `M ${totalPoints.join(' L ')}`;
  const verifiedPath = `M ${verifiedPoints.join(' L ')}`;

  const totalArea = `M ${getX(0)},${height - paddingY} L ${totalPoints.join(' L ')} L ${getX(data.length - 1)},${height - paddingY} Z`;
  const verifiedArea = `M ${getX(0)},${height - paddingY} L ${verifiedPoints.join(' L ')} L ${getX(data.length - 1)},${height - paddingY} Z`;

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] via-[#1A1A1A] to-[#141414] p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#F44A22]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#F44A22]/10 text-[#F44A22] border border-[#F44A22]/20">
              <TrendingUp size={16} />
            </div>
            <h3 className="font-bold text-sm text-[#FEF8E8] tracking-tight">Verification Velocity & Consensus Rate</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">Real-time claim submissions, consensus verification, and disputes</p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center space-x-1 bg-[#141414] border border-[#2A2A2A] p-1 rounded-xl">
          {(['24h', '7d', '30d'] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRange(r); setHoverIndex(null); }}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                range === r 
                  ? 'bg-[#F44A22] text-[#FEF8E8] font-bold shadow-md shadow-[#F44A22]/20' 
                  : 'text-gray-400 hover:text-[#FEF8E8] hover:bg-[#1F1F1F]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Active Stat Highlights */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-xl bg-[#161616]/80 border border-[#2A2A2A]/80 backdrop-blur">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Validations</div>
          <div className="text-lg font-black text-[#FEF8E8]">{activePoint.total.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-green-400">Verified Truth (90%+)</div>
          <div className="text-lg font-black text-green-400">{activePoint.verified.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#F44A22]">Disputed Claims</div>
          <div className="text-lg font-black text-[#F44A22]">{activePoint.disputed.toLocaleString()}</div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-56 select-none overflow-visible"
        >
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F44A22" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F44A22" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <g key={i}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="#262626" 
                  strokeDasharray="4 4" 
                  strokeWidth="1"
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="text-[9px] fill-gray-500 font-mono"
                >
                  {Math.round(pct * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={totalArea} fill="url(#totalGradient)" />
          <path d={verifiedArea} fill="url(#verifiedGradient)" />

          {/* Stroke Lines */}
          <path 
            d={totalPath} 
            fill="none" 
            stroke="#F44A22" 
            strokeWidth="2.5" 
            filter="url(#glow)"
          />
          <path 
            d={verifiedPath} 
            fill="none" 
            stroke="#10B981" 
            strokeWidth="2" 
          />

          {/* Data Points & Interactive Columns */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cyTotal = getY(d.total);
            const isHovered = hoverIndex === i;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIndex(i)}>
                {/* Invisible hover hitbox */}
                <rect
                  x={cx - (width / data.length / 2)}
                  y={paddingY}
                  width={width / data.length}
                  height={height - 2 * paddingY}
                  fill="transparent"
                />

                {/* X Axis Label */}
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered ? 'fill-[#FEF8E8] font-bold' : 'fill-gray-500'
                  }`}
                >
                  {d.time}
                </text>

                {/* Vertical Crosshair Line */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={height - paddingY}
                    stroke="#F44A22"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-70"
                  />
                )}

                {/* Dot markers */}
                <circle
                  cx={cx}
                  cy={cyTotal}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#F44A22"
                  stroke="#161616"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#2A2A2A] text-xs">
        <div className="flex items-center space-x-5 text-[11px] font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F44A22]" />
            <span className="text-gray-300">Total Submissions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-gray-300">Consensus Confirmed</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-gray-500 flex items-center space-x-1">
          <Zap size={12} className="text-[#F44A22]" />
          <span>Syncing Live (127.0.0.1:8000)</span>
        </div>
      </div>
    </div>
  );
}
