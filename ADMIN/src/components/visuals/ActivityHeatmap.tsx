import { CalendarDays, Info } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['00', '03', '06', '09', '12', '15', '18', '21'];

// Deterministic activity matrix (7 days x 8 time blocks)
const heatmapData = [
  [1, 0, 2, 6, 9, 8, 5, 2], // Mon
  [2, 1, 3, 7, 10, 9, 6, 3], // Tue
  [1, 1, 4, 8, 12, 11, 7, 4], // Wed
  [2, 2, 5, 9, 14, 12, 8, 5], // Thu
  [3, 2, 6, 11, 16, 15, 9, 6], // Fri
  [1, 0, 2, 4, 7, 8, 5, 3], // Sat
  [0, 0, 1, 3, 5, 6, 4, 2], // Sun
];

export function ActivityHeatmap() {
  const getCellColor = (level: number) => {
    if (level === 0) return 'bg-[#222222]';
    if (level <= 3) return 'bg-[#F44A22]/20 border border-[#F44A22]/30';
    if (level <= 7) return 'bg-[#F44A22]/50 border border-[#F44A22]/60';
    if (level <= 11) return 'bg-[#F44A22]/80 border border-[#F44A22]/90';
    return 'bg-[#F44A22] shadow-sm shadow-[#F44A22]/40';
  };

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717] p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#F44A22]/10 text-[#F44A22] border border-[#F44A22]/20">
            <CalendarDays size={16} />
          </div>
          <h3 className="font-bold text-sm text-[#FEF8E8]">Hourly Validation Consensus Density</h3>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-[#222222]" />
            <span className="w-2.5 h-2.5 rounded bg-[#F44A22]/20" />
            <span className="w-2.5 h-2.5 rounded bg-[#F44A22]/50" />
            <span className="w-2.5 h-2.5 rounded bg-[#F44A22]/80" />
            <span className="w-2.5 h-2.5 rounded bg-[#F44A22]" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Header row with time slots */}
          <div className="grid grid-cols-9 gap-1.5 mb-2 text-center text-[10px] font-mono text-gray-500">
            <div className="text-left pl-1">Day</div>
            {hours.map(h => (
              <div key={h}>{h}:00</div>
            ))}
          </div>

          {/* Matrix rows */}
          <div className="space-y-1.5">
            {days.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-9 gap-1.5 items-center">
                <div className="text-[11px] font-mono text-gray-400 pl-1">{day}</div>
                {heatmapData[dIdx].map((val, hIdx) => (
                  <div
                    key={hIdx}
                    title={`${day} at ${hours[hIdx]}:00 — ${val * 14} validations`}
                    className={`h-7 rounded-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center text-[10px] font-mono text-white/90 ${getCellColor(val)}`}
                  >
                    {val > 8 ? val : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1.5 text-[11px]">
          <Info size={13} className="text-[#F44A22]" />
          <span>Peak verification window: Friday 12:00 – 18:00 UTC</span>
        </div>
        <span className="font-mono text-[10px] text-gray-500">2,810 weekly submissions tracked</span>
      </div>
    </div>
  );
}
