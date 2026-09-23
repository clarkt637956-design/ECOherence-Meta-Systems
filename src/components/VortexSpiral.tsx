import React from 'react';
import { Compass, RotateCw, Sliders, Sparkles } from 'lucide-react';
import { soundFx } from '../lib/audio.ts';

interface VortexSpiralProps {
  rotation: number;
  spiralText: string;
  onHarmonicShift: () => void;
  dampingFactor: number;
  onSetDamping: (val: number) => void;
  resonanceMultiplier: number;
  onSetMultiplier: (val: number) => void;
}

export const VortexSpiral: React.FC<VortexSpiralProps> = ({
  rotation,
  spiralText,
  onHarmonicShift,
  dampingFactor,
  onSetDamping,
  resonanceMultiplier,
  onSetMultiplier,
}) => {
  return (
    <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner shadow-xl">
      <div className="flex items-center justify-between border-b border-cyan-950 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold tracking-wider text-cyan-400 font-heading uppercase">
            3-6-9 Vortex Spiral Manifold
          </h2>
        </div>
        <div className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
          θ = {rotation}°
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Animated Visualizer */}
        <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded border border-cyan-950">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Concentric Rotating Rings */}
            <div
              className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40 transition-transform duration-75"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Tesla 3-6-9 Markers */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[10px] font-bold font-mono text-cyan-300 bg-black/80 px-1 rounded border border-cyan-500">
                3
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[10px] font-bold font-mono text-cyan-300 bg-black/80 px-1 rounded border border-cyan-500">
                6
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 text-[10px] font-bold font-mono text-cyan-300 bg-black/80 px-1 rounded border border-cyan-500">
                9
              </div>
            </div>

            <div
              className="absolute w-32 h-32 rounded-full border border-dotted border-emerald-500/50 transition-transform duration-75"
              style={{ transform: `rotate(${-rotation * 1.5}deg)` }}
            />

            <div
              className="absolute w-20 h-20 rounded-full border-2 border-cyan-400/70 transition-transform duration-75"
              style={{ transform: `rotate(${rotation * 2}deg)` }}
            />

            {/* Core Center Pulse */}
            <div className="relative z-10 text-center">
              <div className="text-base font-bold font-mono text-emerald-400 glow-green">
                {spiralText}
              </div>
              <div className="text-[9px] text-cyan-300 font-mono mt-0.5 tracking-wider">
                TESLA RESONANCE
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mt-3 text-center">
            Periodic nodal alignment triggers destructive wave interference on hostile pulses.
          </p>
        </div>

        {/* Resonance Tuning Controls */}
        <div className="space-y-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Lattice Damping (Decay Rate)</span>
              <span className="text-cyan-400 font-bold">{dampingFactor.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.800"
              max="0.999"
              step="0.003"
              value={dampingFactor}
              onChange={(e) => onSetDamping(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Rapid Dissipation (0.80)</span>
              <span>Persistent Echo (0.99)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Pulse Resonance Multiplier</span>
              <span className="text-emerald-400 font-bold">{resonanceMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="6.0"
              step="0.1"
              value={resonanceMultiplier}
              onChange={(e) => onSetMultiplier(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Low Harmonic (1.0x)</span>
              <span>Overdrive (6.0x)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                soundFx.playAlert();
                onHarmonicShift();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-bold transition shadow-md shadow-cyan-950/40"
            >
              <RotateCw className="w-4 h-4 text-cyan-400" />
              <span>Shift Lattice Harmonic (+90°)</span>
            </button>
            <p className="text-[10px] text-slate-500 mt-1 text-center">
              Re-tunes the vortex phase manifold to desynchronize automated threat payloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
