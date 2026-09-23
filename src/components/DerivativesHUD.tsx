import React from 'react';
import { ShieldAlert, Clock, Radio, Lock, Zap } from 'lucide-react';
import { QELDerivatives } from '../types.ts';

interface DerivativesHUDProps {
  derivatives: QELDerivatives;
}

export const DerivativesHUD: React.FC<DerivativesHUDProps> = ({ derivatives }) => {
  const { qelA, qelT, qelS, qelX } = derivatives;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* QEL-A: Kinetic Deflection */}
      <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-700/40 text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold font-heading text-emerald-400">QEL-A</span>
              <div className="text-[10px] text-slate-400">Kinetic Shielding</div>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              qelA.status === 'OPTIMAL'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                : qelA.status === 'RESONATING'
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                : 'bg-red-950/60 text-red-300 border-red-700/60'
            }`}
          >
            {qelA.status}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Deflection Efficiency</span>
            <span className="text-emerald-300 font-bold">{qelA.deflectionRatio}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, qelA.deflectionRatio)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Status: {qelA.kineticShieldActive ? 'Active Deflection Grid' : 'Standby Absorption'}
          </div>
        </div>
      </div>

      {/* QEL-T: Temporal Incident Forensics */}
      <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-700/40 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold font-heading text-cyan-400">QEL-T</span>
              <div className="text-[10px] text-slate-400">Temporal Forensics</div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/60">
            {qelT.entanglementTraceDepth} NODES
          </span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Causality Coherence</span>
            <span className="text-cyan-300 font-bold">{qelT.causalityCoherence}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, qelT.causalityCoherence)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Decay Factor: <strong className="text-slate-300">{qelT.temporalDecayRate}</strong>
          </div>
        </div>
      </div>

      {/* QEL-S: Spectral Resonance Sensor */}
      <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-purple-950/60 border border-purple-700/40 text-purple-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold font-heading text-purple-400">QEL-S</span>
              <div className="text-[10px] text-slate-400">Spectral Sensor</div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/60">
            {qelS.harmonicPhaseAlignment}% HARMONIC
          </span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Lyapunov Stability</span>
            <span className="text-purple-300 font-bold">{qelS.lyapunovStability}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, qelS.lyapunovStability * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Phase Jitter: <strong className="text-slate-300">{qelS.spectralAnomalyJitter}</strong>
          </div>
        </div>
      </div>

      {/* QEL-X: Zero-Day Containment */}
      <div className="bg-[#070b18]/90 border border-cyan-500/30 rounded-lg p-4 hud-corner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded border ${qelX.containmentLockdown ? 'bg-red-950/60 border-red-700/60 text-red-400' : 'bg-amber-950/60 border-amber-700/40 text-amber-400'}`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold font-heading text-amber-400">QEL-X</span>
              <div className="text-[10px] text-slate-400">Zero-Day Containment</div>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              qelX.containmentLockdown
                ? 'bg-red-950 text-red-300 border-red-600 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            {qelX.containmentLockdown ? 'LOCKDOWN' : 'MONITOR'}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-400">Zero-Day Threat Index</span>
            <span className="text-amber-300 font-bold">{(qelX.zeroDayCoefficient * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, qelX.zeroDayCoefficient * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Quarantine Silos: <strong className="text-white">{qelX.quarantineZoneCount} hosts</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
