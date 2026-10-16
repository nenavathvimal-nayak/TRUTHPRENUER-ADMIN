import { Globe2, Radio, Server } from 'lucide-react';

interface MeshNode {
  city: string;
  region: string;
  latency: number;
  status: 'active' | 'syncing';
  verifiedCount: number;
  ip: string;
}

const nodes: MeshNode[] = [
  { city: 'San Francisco', region: 'us-west-1', latency: 24, status: 'active', verifiedCount: 489, ip: '127.0.0.1 (Loopback)' },
  { city: 'Frankfurt', region: 'eu-central-1', latency: 42, status: 'active', verifiedCount: 312, ip: '127.0.0.1 (Loopback)' },
  { city: 'Tokyo', region: 'ap-northeast-1', latency: 58, status: 'active', verifiedCount: 298, ip: '127.0.0.1 (Loopback)' },
  { city: 'Singapore', region: 'ap-southeast-1', latency: 64, status: 'active', verifiedCount: 220, ip: '127.0.0.1 (Loopback)' },
  { city: 'Mumbai', region: 'ap-south-1', latency: 31, status: 'active', verifiedCount: 428, ip: '127.0.0.1 (Loopback)' },
];

export function GlobalMeshNodes() {
  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F] to-[#171717] p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#F44A22]/10 text-[#F44A22] border border-[#F44A22]/20">
            <Globe2 size={16} />
          </div>
          <h3 className="font-bold text-sm text-[#FEF8E8]">Consensus Mesh & Edge Nodes</h3>
        </div>
        <span className="flex items-center space-x-1.5 text-[11px] font-mono text-green-400">
          <Radio size={12} className="animate-pulse" />
          <span>5/5 Nodes Synchronized</span>
        </span>
      </div>

      <div className="space-y-2.5">
        {nodes.map(node => (
          <div
            key={node.city}
            className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#222222] text-[#F44A22] border border-[#2E2E2E]">
                <Server size={14} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#FEF8E8] flex items-center space-x-2">
                  <span>{node.city}</span>
                  <span className="text-[10px] font-mono text-gray-500 font-normal">({node.region})</span>
                </div>
                <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                  Bound: {node.ip}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-gray-200">{node.verifiedCount}</div>
                <div className="text-[9px] font-mono text-gray-500">verifications</div>
              </div>

              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-[#222222] border border-[#2A2A2A] font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-green-400 font-bold">{node.latency}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
