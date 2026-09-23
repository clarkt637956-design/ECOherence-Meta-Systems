import React from 'react';
import { Activity, Layers, Zap } from 'lucide-react';

interface LatticeMatrixProps {
  lattice: number[];
  history: number[];
  spiralText: string;
  totalEntropy: number;
  rotation: number;
  onOpenEntropyDashboard?: () => void;
}

export const LatticeMatrix: React.FC<LatticeMatrixProps> = ({
  lattice,
  history,
  spiralText,
  totalEntropy,
  rotation,
  onOpenEntropyDashboard,
}) => {
  // SVG Radar nodes
  const centerX = 120;
  const centerY = 120;
  const radius = 85;

  const nodes = lattice.map((val, idx) => {
    const angle = (idx * 30 - 90) * (Math.PI / 180);
    // Dynamic amplitude based on energy
    const dynamicRadius = radius * Math.min(1.4, Math.max(0.4, 0.5 + val / 120));
    const x = centerX + dynamicRadius * Math.cos(angle);
    const y = centerY + dynamicRadius * Math.sin(angle);
    const baseAngle = (idx * 30 - 90) * (Math.PI / 180);
    const baseX = centerX + radius * Math.cos(baseAngle);
    const baseY = centerY + radius * Math.sin(baseAngle);
    const isTeslaHarmonic = idx === 3 || idx === 6 || idx === 9;
    return { idx, val, x, y, baseX, baseY, isTeslaHarmonic };
  });

  return (
    <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner shadow-xl">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-950 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold tracking-wider text-emerald-400 font-heading uppercase">
            12-Phase Resonance Lattice
          </h2>
          <span className="text-xs font-mono text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            {spiralText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenEntropyDashboard ? (
            <button
              onClick={onOpenEntropyDashboard}
              className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded bg-black/60 hover:bg-cyan-950/60 border border-cyan-900/60 hover:border-cyan-500/60 transition group cursor-pointer"
              title="Click to open Quantum Entropy Dashboard (60m Historical Decay & Pulse Spikes)"
            >
              <span className="text-slate-400 group-hover:text-cyan-300">Total Entropy:</span>
              <span className="text-emerald-300 font-bold glow-green">{totalEntropy.toFixed(2)}</span>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-950/60 px-1 py-0.2 rounded border border-purple-800">60m Analytics ↗</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Total Entropy:</span>
              <span className="text-emerald-300 font-bold glow-green">{totalEntropy.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar / Circular Manifold */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-[240px] h-[240px]">
            <svg className="w-full h-full" viewBox="0 0 240 240">
              {/* Concentric rings */}
              <circle cx={centerX} cy={centerY} r={radius * 0.33} fill="none" stroke="#0e2338" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={centerX} cy={centerY} r={radius * 0.66} fill="none" stroke="#0e2338" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#164e63" strokeWidth="1.5" />
              <circle cx={centerX} cy={centerY} r={radius * 1.3} fill="none" stroke="#083344" strokeWidth="1" strokeDasharray="4 4" />

              {/* Rotational Scanner Beam */}
              <line
                x1={centerX}
                y1={centerY}
                x2={centerX + radius * 1.3 * Math.cos((rotation * Math.PI) / 180)}
                y2={centerY + radius * 1.3 * Math.sin((rotation * Math.PI) / 180)}
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeOpacity="0.7"
              />

              {/* Connecting polygon of current energy */}
              <polygon
                points={nodes.map((n) => `${n.x},${n.y}`).join(' ')}
                fill="rgba(34, 197, 94, 0.15)"
                stroke="#22c55e"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              {/* Axis Spoke Lines */}
              {nodes.map((n) => (
                <line
                  key={`spoke-${n.idx}`}
                  x1={centerX}
                  y1={centerY}
                  x2={n.baseX}
                  y2={n.baseY}
                  stroke={n.isTeslaHarmonic ? '#06b6d4' : '#1e293b'}
                  strokeWidth={n.isTeslaHarmonic ? '1.5' : '0.8'}
                  strokeDasharray={n.isTeslaHarmonic ? 'none' : '2 2'}
                />
              ))}

              {/* Nodes */}
              {nodes.map((n) => {
                const isHigh = n.val > 40;
                const nodeFill = n.isTeslaHarmonic ? '#00f0ff' : isHigh ? '#22c55e' : '#64748b';
                return (
                  <g key={`node-${n.idx}`} className="transition-all duration-300">
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.isTeslaHarmonic ? 5 : 3.5}
                      fill={nodeFill}
                      stroke="#030712"
                      strokeWidth="1.5"
                    />
                    {isHigh && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={8}
                        fill="none"
                        stroke={nodeFill}
                        strokeWidth="1"
                        className="animate-ping opacity-60"
                      />
                    )}
                    {/* Node label */}
                    <text
                      x={n.baseX + (n.baseX - centerX) * 0.18}
                      y={n.baseY + (n.baseY - centerY) * 0.18 + 3}
                      fill={n.isTeslaHarmonic ? '#00f0ff' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={n.isTeslaHarmonic ? 'bold' : 'normal'}
                    >
                      {n.idx.toString().padStart(2, '0')}
                    </text>
                  </g>
                );
              })}

              {/* Core vortex hub */}
              <circle cx={centerX} cy={centerY} r="6" fill="#00f0ff" className="glow-cyan" />
            </svg>
          </div>

          <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 3-6-9 Harmonic Nodes
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active Resonance
            </span>
          </div>
        </div>

        {/* Right: The Exact Sci-Fi Bracket Terminal Bars from Taylor Ryan Clark HUD */}
        <div className="lg:col-span-7 bg-black/60 border border-cyan-950 p-3 rounded font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-950/70 mb-2 text-[10px] text-slate-400 uppercase tracking-wider">
            <span className="text-emerald-400 font-bold">PHASE RESONANCE SPECTRUM</span>
            <span className="text-cyan-400 font-bold">SIGNAL HISTORY (TREND)</span>
          </div>

          <div className="space-y-1">
            {lattice.map((val, i) => {
              // Exact ASCII/Unicode representation from original Python script:
              // bar_len = int(min(val/8, 15))
              // bar = f"{C_GRN}{'█'*bar_len}{C_DIM}{'░'*(15-bar_len)}"
              const barLen = Math.min(15, Math.max(0, Math.floor(val / 6)));
              const activeBar = '█'.repeat(barLen);
              const dimBar = '░'.repeat(15 - barLen);

              // History sparkline value
              const histVal =
                history.length > i
                  ? history[history.length - 1 - i]
                  : history[0] || 0;
              const graphLen = Math.min(20, Math.max(1, Math.floor(histVal / 40)));
              const graphBar = '▰'.repeat(graphLen);

              const isTesla = i === 3 || i === 6 || i === 9;

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between py-0.5 px-1 rounded transition-colors ${
                    isTesla ? 'bg-cyan-950/20' : 'hover:bg-slate-900/40'
                  }`}
                >
                  {/* Left Column: Phase & Bar */}
                  <div className="flex items-center gap-1.5">
                    <span className={isTesla ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      [{i.toString().padStart(2, '0')}]
                    </span>
                    <span className="tracking-tight text-emerald-400 select-none">
                      {activeBar}
                      <span className="text-slate-700">{dimBar}</span>
                    </span>
                    <span className="text-emerald-300 font-semibold w-12 text-right">
                      {val.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-cyan-950 px-1">│</span>

                  {/* Right Column: History Trend */}
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-500/80 tracking-tighter select-none w-28 text-left">
                      {graphBar}
                    </span>
                    <span className="text-slate-400 w-12 text-right">
                      {histVal.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-cyan-950/70 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400/90 font-mono">
              &gt;&gt; POLAR HARMONIC: <span className="text-white font-bold">{spiralText}</span>
            </span>
            <span className="text-slate-500">
              LATTICE DECAY RATE: <span className="text-cyan-400">0.963 / sec</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
