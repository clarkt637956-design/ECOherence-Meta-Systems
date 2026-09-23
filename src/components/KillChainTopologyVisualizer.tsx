import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Target,
  Database,
  Radio,
  Network,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lock,
  Layers,
} from 'lucide-react';
import { soundFx } from '../lib/audio.ts';

interface KillChainTopologyVisualizerProps {
  onInjectLivePulse?: (ip: string, action: string) => void;
  onTriggerNotification?: (title: string, msg: string, type?: 'SUCCESS' | 'ALERT' | 'INFO') => void;
}

export const KillChainTopologyVisualizer: React.FC<KillChainTopologyVisualizerProps> = ({
  onInjectLivePulse,
  onTriggerNotification,
}) => {
  const [architectureMode, setArchitectureMode] = useState<'QEL_NEXUS' | 'LEGACY_STACK'>('QEL_NEXUS');
  const [activeVector, setActiveVector] = useState<string>('ZERO_DAY_DETECTED');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [deflectedCount, setDeflectedCount] = useState<number>(142);

  const vectors = [
    { id: 'ZERO_DAY_DETECTED', label: 'Polymorphic Zero-Day', ip: '185.220.101.5', severity: 'CRITICAL' },
    { id: 'DDOS_SURGE', label: 'Volumetric Syn-Flood', ip: '45.154.255.88', severity: 'CRITICAL' },
    { id: 'SQL_INJECTION', label: 'Invasive Blind SQLi', ip: '103.251.167.20', severity: 'HIGH' },
    { id: 'LATERAL_MOVEMENT', label: 'Kerberoast Lateral Pivot', ip: '10.0.4.15', severity: 'HIGH' },
  ];

  const handleFireSim = (vecId: string) => {
    const vec = vectors.find((v) => v.id === vecId) || vectors[0];
    setActiveVector(vec.id);
    setIsSimulating(true);
    setSimulationStep(1);
    soundFx.playAlert();

    if (onInjectLivePulse) {
      onInjectLivePulse(vec.ip, vec.id);
    }

    // Step 2: Ingress hits boundary (300ms)
    setTimeout(() => {
      setSimulationStep(2);
    }, 400);

    // Step 3: Deflection or Breach (900ms)
    setTimeout(() => {
      setSimulationStep(3);
      if (architectureMode === 'QEL_NEXUS') {
        soundFx.playSuccess();
        setDeflectedCount((c) => c + 1);
        if (onTriggerNotification) {
          onTriggerNotification(
            'QEL-A Boundary Deflection',
            `Adversary packet [${vec.id}] deflected at Phase 07 in <0.04 ms. Zero lateral movement.`,
            'SUCCESS'
          );
        }
      } else {
        soundFx.playAlert();
        if (onTriggerNotification) {
          onTriggerNotification(
            'Legacy Stack Breach Warning',
            `Adversary penetrated internal subnet. CrowdStrike sandbox analyzing in cloud...`,
            'ALERT'
          );
        }
      }
    }, 1000);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationStep(0);
    }, 3200);
  };

  return (
    <div className="bg-[#050914] border border-cyan-500/30 rounded-lg p-4 sm:p-6 hud-corner shadow-xl space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-950 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-950/80 border border-cyan-500/70 text-cyan-400">
              <Network className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white font-heading tracking-wide">
              Adversary Kill-Chain vs. Defense Topology Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time visual comparison: QEL 12-phase kinetic shield vs legacy multi-tier delay.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center bg-black/60 p-1 rounded-lg border border-slate-800 font-mono text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setArchitectureMode('QEL_NEXUS');
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${
              architectureMode === 'QEL_NEXUS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>QEL Nexus Shield (0.04 ms)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setArchitectureMode('LEGACY_STACK');
            }}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${
              architectureMode === 'LEGACY_STACK'
                ? 'bg-red-600 text-white shadow-md shadow-red-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Legacy SIEM/EDR Stack (45s delay)</span>
          </button>
        </div>
      </div>

      {/* Vector Simulator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 p-3 rounded-lg border border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-cyan-400 font-bold">SELECT ATTACK VECTOR:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {vectors.map((vec) => (
            <button
              key={vec.id}
              disabled={isSimulating}
              onClick={() => handleFireSim(vec.id)}
              className={`px-2.5 py-1.5 rounded border text-xs font-bold transition flex items-center gap-1.5 ${
                activeVector === vec.id
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-500'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600'
              } ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{vec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas / Topology Map */}
      <div className="relative bg-[#02050c] border border-cyan-950 rounded-xl p-6 min-h-[340px] flex flex-col justify-between overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#083344_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Status Callout Banner */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-cyan-950/80 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSimulating
                  ? 'bg-red-500 animate-ping'
                  : architectureMode === 'QEL_NEXUS'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              Architecture:{' '}
              <strong
                className={
                  architectureMode === 'QEL_NEXUS' ? 'text-emerald-400' : 'text-red-400'
                }
              >
                {architectureMode === 'QEL_NEXUS'
                  ? 'Autonomous 12-Phase QEL-A Shield'
                  : 'Multi-Vendor Cloud Sandbox Pipeline'}
              </strong>
            </span>
          </div>

          <div className="text-slate-400">
            Total Boundary Interceptions:{' '}
            <strong className="text-cyan-300 font-bold">{deflectedCount}</strong>
          </div>
        </div>

        {/* Interactive 3-Stage Topology Nodes */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
          {/* Node 1: Adversary Origin */}
          <div
            className={`p-4 rounded-xl border text-center transition-all ${
              simulationStep >= 1
                ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/60 scale-105'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/80 border border-red-600 flex items-center justify-center text-red-400 mb-2">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-red-200 font-heading uppercase">
              Hostile Adversary
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              IP: {vectors.find((v) => v.id === activeVector)?.ip || '185.220.101.5'}
            </div>
            <div className="text-[10px] font-mono text-red-400 mt-1">
              {simulationStep >= 1 ? '⚡ TRANSMITTING PAYLOAD' : 'Idle / Scouting'}
            </div>
          </div>

          {/* Node 2: Boundary Layer (QEL vs Legacy) */}
          <div
            className={`p-4 rounded-xl border text-center relative transition-all ${
              architectureMode === 'QEL_NEXUS'
                ? simulationStep >= 2
                  ? 'bg-emerald-950/50 border-emerald-400 shadow-xl shadow-emerald-950/80 scale-105'
                  : 'bg-emerald-950/20 border-emerald-700/60'
                : simulationStep >= 2
                ? 'bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-950/60'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            {/* Animated Laser Pulse Indicator */}
            {isSimulating && (
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase border ${
                  architectureMode === 'QEL_NEXUS'
                    ? 'bg-emerald-900 text-emerald-200 border-emerald-500 animate-pulse'
                    : 'bg-red-900 text-red-200 border-red-500 animate-bounce'
                }`}
              >
                {architectureMode === 'QEL_NEXUS' ? 'DEFLECTING 0.04 ms' : 'PENETRATING...'}
              </div>
            )}

            <div
              className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center mb-2 ${
                architectureMode === 'QEL_NEXUS'
                  ? 'bg-emerald-900/80 border-emerald-400 text-emerald-300'
                  : 'bg-amber-900/80 border-amber-500 text-amber-300'
              }`}
            >
              {architectureMode === 'QEL_NEXUS' ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <Radio className="w-8 h-8" />
              )}
            </div>

            <div className="text-xs font-bold text-white font-heading uppercase">
              {architectureMode === 'QEL_NEXUS' ? 'QEL 12-Phase Shield' : 'Legacy Firewall / SIEM'}
            </div>

            <div className="text-[11px] font-mono text-slate-300 mt-1">
              {architectureMode === 'QEL_NEXUS'
                ? 'Sub-millisecond kinetic deflection'
                : 'Syslog forwarder + Cloud Sandbox'}
            </div>

            <div
              className={`text-[10px] font-mono font-bold mt-2 py-0.5 px-2 rounded inline-block ${
                architectureMode === 'QEL_NEXUS'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {architectureMode === 'QEL_NEXUS'
                ? '✓ 99.4% Autonomous Drop'
                : '⚠ 42s – 5min Latency Gap'}
            </div>
          </div>

          {/* Node 3: Crown Jewels (Internal Database / Cloud Assets) */}
          <div
            className={`p-4 rounded-xl border text-center transition-all ${
              architectureMode === 'LEGACY_STACK' && simulationStep >= 3
                ? 'bg-red-950/60 border-red-500 shadow-2xl shadow-red-900/80 animate-pulse'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div
              className={`w-12 h-12 mx-auto rounded-full border flex items-center justify-center mb-2 ${
                architectureMode === 'LEGACY_STACK' && simulationStep >= 3
                  ? 'bg-red-900 border-red-500 text-red-200'
                  : 'bg-cyan-950/80 border-cyan-600 text-cyan-400'
              }`}
            >
              <Database className="w-6 h-6" />
            </div>

            <div className="text-xs font-bold text-slate-100 font-heading uppercase">
              Internal VPC &amp; Databases
            </div>

            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Customer Data, Secrets, Tokens
            </div>

            <div
              className={`text-[10px] font-mono font-bold mt-2 ${
                architectureMode === 'LEGACY_STACK' && simulationStep >= 3
                  ? 'text-red-400'
                  : 'text-emerald-400'
              }`}
            >
              {architectureMode === 'LEGACY_STACK' && simulationStep >= 3
                ? '❌ COMPROMISED (Exfiltration in progress)'
                : '🛡️ 100% PROTECTED & SECURE'}
            </div>
          </div>
        </div>

        {/* Bottom Explanatory Narrative */}
        <div className="relative z-10 bg-black/60 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
          {architectureMode === 'QEL_NEXUS' ? (
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-emerald-300">Why QEL Beats Legacy:</strong> Unlike traditional
                SIEMs that wait for logs to be ingested, indexed, and cron-queried over minutes,
                QEL Nexus computes the Lyapunov phase stability of every ingress packet in{' '}
                <strong className="text-cyan-300">0.04 ms</strong>. The boundary socket drops
                autonomously before the adversary can execute shellcode or establish persistence.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-red-300">The Multi-Vendor Vulnerability Gap:</strong> CrowdStrike
                and Splunk require cloud sandbox detonation or signature rule updates. During that
                24-minute average triage window, polymorphic zero-days pivot laterally to internal
                database clusters undetected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
