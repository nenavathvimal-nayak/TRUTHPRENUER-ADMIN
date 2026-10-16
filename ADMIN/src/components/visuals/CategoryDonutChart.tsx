import { useState } from 'react';
import { PieChart } from 'lucide-react';

interface CategoryItem {
  name: string;
  count: number;
  pct: number;
  color: string;
}

const categories: CategoryItem[] = [
  { name: 'AI & DeepTech', count: 684, pct: 38, color: '#F44A22' },
  { name: 'FinTech & Cryptography', count: 432, pct: 24, color: '#3B82F6' },
  { name: 'HealthTech & Bio', count: 324, pct: 18, color: '#10B981' },
  { name: 'Autonomous Agents', count: 216, pct: 12, color: '#F59E0B' },
  { name: 'CleanTech & Hardware', count: 144, pct: 8, color: '#8B5CF6' },
];

export function CategoryDonutChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;

  const activeCategory = hoveredIdx !== null ? categories[hoveredIdx] : null;
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717] p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
              <PieChart size={16} />
            </div>
            <h3 className="font-bold text-sm text-[#FEF8E8]">Industry Domain Distribution</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-[#141414] px-2 py-0.5 rounded border border-[#2A2A2A]">
            {totalCount} Total
          </span>
        </div>

        {/* SVG Donut */}
        <div className="relative flex items-center justify-center my-4">
          <svg width={size} height={size} className="transform -rotate-90 select-none">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#262626"
              strokeWidth={strokeWidth}
            />

            {/* Category Arcs */}
            {categories.map((cat, idx) => {
              const dashLength = (cat.pct / 100) * circumference;
              const dashSpace = circumference - dashLength;
              const strokeDashoffset = -((cumulativePct / 100) * circumference);
              cumulativePct += cat.pct;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={cat.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${dashSpace}`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute text-center pointer-events-none">
            <div className="text-xl font-black text-[#FEF8E8] tracking-tight">
              {activeCategory ? `${activeCategory.pct}%` : `${totalCount}`}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              {activeCategory ? activeCategory.name.split(' ')[0] : 'Claims'}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Items */}
      <div className="space-y-2 mt-4 pt-4 border-t border-[#2A2A2A]">
        {categories.map((cat, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={cat.name}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                isHovered ? 'bg-[#262626]' : 'hover:bg-[#1A1A1A]'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className={`text-xs ${isHovered ? 'text-[#FEF8E8] font-semibold' : 'text-gray-300'}`}>
                  {cat.name}
                </span>
              </div>
              <div className="font-mono text-xs flex items-center space-x-2">
                <span className="text-gray-400">{cat.count}</span>
                <span className="text-[10px] text-gray-500 font-bold">({cat.pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
